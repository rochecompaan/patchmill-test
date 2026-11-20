import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { mountPollApp } from '../src/poll-app.ts';

function app(t) {
  const dom = new JSDOM('<!doctype html><main><div></div></main>');
  t.after(() => dom.window.close());
  const { document } = dom.window;
  const root = document.querySelector('div');
  mountPollApp(root);
  const inputs = () => [...root.querySelectorAll('input')];
  const button = text => [...root.querySelectorAll('button')]
    .find(element => element.textContent === text);
  const fill = values => values.forEach((value, index) => {
    inputs()[index].value = value;
    inputs()[index].dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  });
  const submit = (form = root.querySelector('form')) => {
    const event = new dom.window.Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    assert.equal(event.defaultPrevented, true);
  };
  const labels = () => [...root.querySelectorAll('ol li')].map(item => item.textContent);
  return { document, root, inputs, button, fill, submit, labels };
}

// Catches missing fields, labels, or required semantics in the mounted form.
test('starts with a labeled question and two required options', t => {
  const { root, inputs, button } = app(t);
  assert.equal(inputs().length, 3);
  assert.deepEqual(inputs().map(input => input.labels[0].textContent),
    ['Poll question', 'Option 1', 'Option 2']);
  assert.ok(inputs().every(input => input.required && input.value === ''));
  assert.equal(root.querySelector('fieldset legend').textContent, 'Options');
  assert.equal(root.querySelector('form').noValidate, true);
  assert.equal(button('Add option').type, 'button');
  assert.equal(button('Save poll').type, 'submit');
  assert.equal(root.querySelectorAll('ol li').length, 0);
  assert.match(root.textContent, /Voting and results are not available yet\./);
});

test('adds required options without losing draft values', t => {
  const { root, inputs, button, fill, document } = app(t);
  fill(['Lunch?', 'Soup', 'Wrap']);
  for (let count = 4; count <= 5; count++) {
    button('Add option').click();
    assert.equal(inputs().length, count);
    assert.equal(document.activeElement, inputs().at(-1));
    assert.equal(inputs().at(-1).required, true);
    assert.equal(inputs().at(-1).labels[0].textContent, `Option ${count - 1}`);
  }
  assert.deepEqual(inputs().map(input => input.value), ['Lunch?', 'Soup', 'Wrap', '', '']);
  assert.equal(root.querySelector('ol'), null);
});

test('saves two trimmed options and replaces the form', t => {
  const { root, fill, submit, labels, document } = app(t);
  fill(['  Lunch?  ', ' Soup ', ' Wrap ']);
  submit();
  const heading = root.querySelector('section h2');
  assert.equal(heading.textContent, 'Lunch?');
  assert.deepEqual(labels(), ['Soup', 'Wrap']);
  assert.match(root.textContent, /Poll created\./);
  assert.equal(root.querySelector('form'), null);
  assert.equal(root.querySelectorAll('button').length, 0);
  assert.equal(document.activeElement, heading);
  assert.equal(heading.tabIndex, -1);
  assert.match(root.textContent, /Voting and results are not available yet\./);
});

test('saves every added option in order', t => {
  const { button, fill, submit, labels } = app(t);
  button('Add option').click();
  button('Add option').click();
  fill(['Lunch?', 'Soup', 'Wrap', 'Salad', 'Sushi']);
  submit();
  assert.deepEqual(labels(), ['Soup', 'Wrap', 'Salad', 'Sushi']);
});

test('retains duplicates and literal text', t => {
  const { root, button, fill, submit, labels } = app(t);
  button('Add option').click();
  fill(['寿司 <img src=x onerror=alert(1)>?', 'Café  bowl', 'Café  bowl', '<script>bad()</script>']);
  submit();
  assert.equal(root.querySelector('section h2').textContent, '寿司 <img src=x onerror=alert(1)>?');
  assert.deepEqual(labels(), ['Café  bowl', 'Café  bowl', '<script>bad()</script>']);
  assert.equal(root.querySelector('img, script'), null);
});

// Catches missing trimming, skipped added rows, value loss, and stale custom validity.
for (const index of [0, 1, 2, 3]) {
  for (const blank of ['', '   ', '\u0085', '\u00a0', '\ufeff']) {
    test(`rejects blank field ${index} (${JSON.stringify(blank)}) and accepts correction`, t => {
      const { root, inputs, button, fill, submit, document, labels } = app(t);
      button('Add option').click();
      const values = ['Lunch?', 'Soup', 'Wrap', 'Salad'];
      values[index] = blank;
      fill(values);
      submit();
      const invalid = inputs()[index];
      assert.equal(root.querySelector('ol'), null);
      assert.deepEqual(inputs().map(input => input.value), values);
      assert.equal(document.activeElement, invalid);
      assert.equal(invalid.validationMessage, index === 0 ? 'Enter a poll question.' : `Enter option ${index}.`);
      assert.equal(invalid.validity.customError, true);
      values[index] = index === 0 ? 'Lunch?' : 'Fixed';
      fill(values);
      assert.equal(invalid.validity.customError, false);
      submit();
      assert.equal(labels().length, 3);
    });
  }
}

test('focuses the first invalid field before later errors', t => {
  const { inputs, fill, submit, document, labels } = app(t);
  fill(['', 'Soup', '   ']);
  submit();
  assert.equal(document.activeElement, inputs()[0]);
  fill(['Lunch?', 'Soup', '   ']);
  submit();
  assert.equal(document.activeElement, inputs()[2]);
  fill(['Lunch?', 'Soup', 'Wrap']);
  submit();
  assert.deepEqual(labels(), ['Soup', 'Wrap']);
});

test('ignores stale submissions after save', t => {
  const { root, fill, submit, labels } = app(t);
  const retiredForm = root.querySelector('form');
  fill(['Lunch?', 'Soup', 'Wrap']);
  submit();
  assert.equal(root.querySelector('form'), null);
  retiredForm.querySelector('input').value = 'Replacement?';
  retiredForm.hidden = true;
  root.append(retiredForm);
  submit(retiredForm);
  retiredForm.remove();
  assert.equal(root.querySelector('section h2').textContent, 'Lunch?');
  assert.deepEqual(labels(), ['Soup', 'Wrap']);
});

test('fresh mounts start empty', t => {
  const first = app(t);
  first.fill(['Lunch?', 'Soup', 'Wrap']);
  first.submit();
  const second = app(t);
  assert.ok(second.inputs().every(input => input.value === ''));
  assert.equal(second.root.querySelector('ol'), null);
  assert.deepEqual(first.labels(), ['Soup', 'Wrap']);
});
