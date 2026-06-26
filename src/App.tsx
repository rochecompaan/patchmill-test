import './App.css';

export default function App() {
  return (
    <main className="app-shell" aria-labelledby="app-title">
      <section className="hero-card">
        <p className="eyebrow">Team decision helper</p>
        <h1 id="app-title">Team Lunch Poll</h1>
        <p className="description">
          Help teammates choose a lunch option together with a simple shared poll.
        </p>
      </section>

      <section className="placeholder-card" aria-labelledby="placeholder-title">
        <div>
          <p className="eyebrow">Coming next</p>
          <h2 id="placeholder-title">Poll creation and live results</h2>
        </div>
        <p>
          This space will hold the lunch poll form, voting options, and current results as the app grows.
        </p>
      </section>
    </main>
  );
}
