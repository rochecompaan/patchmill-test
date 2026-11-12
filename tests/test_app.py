from html.parser import HTMLParser

import pytest

from team_lunch_poll import create_app


class ShellParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []
        self.headings = []
        self._heading = None

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))
        if tag in {"h1", "h2"}:
            self._heading = (tag, "")

    def handle_data(self, data):
        if self._heading is not None:
            tag, text = self._heading
            self._heading = (tag, text + data)

    def handle_endtag(self, tag):
        if self._heading is not None and tag == self._heading[0]:
            self.headings.append(self._heading)
            self._heading = None


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    return app.test_client()


def test_home_serves_html_shell(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.mimetype == "text/html"
    page = ShellParser()
    page.feed(response.get_data(as_text=True))
    assert any(
        tag == "html" and attrs.get("lang") == "en" for tag, attrs in page.elements
    )
    assert [text for tag, text in page.headings if tag == "h1"] == ["Team Lunch Poll"]
    assert ("h2", "Create a poll") in page.headings
    assert ("h2", "Results") in page.headings
    assert any(tag == "main" for tag, _ in page.elements)
    assert any(
        tag == "link"
        and attrs.get("rel") == "stylesheet"
        and attrs.get("href") == "/static/styles.css"
        for tag, attrs in page.elements
    )


def test_local_stylesheet_is_served(client):
    response = client.get("/static/styles.css")

    assert response.status_code == 200
    assert response.mimetype == "text/css"
    assert response.data.strip()


def test_unknown_route_returns_404(client):
    assert client.get("/not-a-route").status_code == 404
