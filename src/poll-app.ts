import type { Poll } from './domain/poll';

/** Mount once per workspace. Polls live only in this document's memory. */
export function mountPollApp(root: HTMLElement): void {
  const document = root.ownerDocument;
  let currentPoll: Poll | null = null;
  root.innerHTML = `
    <section aria-labelledby="create-heading">
      <h2 id="create-heading">Create a poll</h2>
      <form novalidate>
        <p>Enter a question and at least two lunch options.</p>
        <label for="poll-question">Poll question</label>
        <input id="poll-question" name="question" type="text" required>
        <fieldset>
          <legend>Options</legend>
          <div class="option-fields"></div>
        </fieldset>
        <div class="poll-actions">
          <button type="button">Add option</button>
          <button type="submit" class="primary">Save poll</button>
        </div>
      </form>
    </section>
    <section aria-labelledby="results-heading">
      <h2 id="results-heading">Poll results</h2>
      <p>Voting and results are not available yet.</p>
    </section>`;

  const creation = root.querySelector('section')!;
  const form = root.querySelector('form')!;
  const question = form.querySelector('input')!;
  const optionFields = form.querySelector('.option-fields')!;
  const addButton = form.querySelector('button')!;
  const optionInputs: HTMLInputElement[] = [];

  function appendOption(): HTMLInputElement {
    const number = optionInputs.length + 1;
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.id = `poll-option-${number}`;
    input.name = 'option';
    input.type = 'text';
    input.required = true;
    label.htmlFor = input.id;
    label.textContent = `Option ${number}`;
    optionFields.append(label, input);
    optionInputs.push(input);
    return input;
  }

  function showPoll(poll: Poll): void {
    const heading = document.createElement('h2');
    heading.id = 'poll-heading';
    heading.tabIndex = -1;
    heading.textContent = poll.question;
    const message = document.createElement('p');
    message.textContent = 'Poll created.';
    const list = document.createElement('ol');
    for (const option of poll.options) {
      const item = document.createElement('li');
      item.textContent = option.label;
      list.append(item);
    }
    creation.setAttribute('aria-labelledby', heading.id);
    creation.replaceChildren(heading, message, list);
    heading.focus();
  }

  appendOption();
  appendOption();

  root.addEventListener('click', event => {
    if (event.target === addButton && currentPoll === null) {
      appendOption().focus();
    }
  });

  root.addEventListener('input', event => {
    const input = [question, ...optionInputs].find(field => field === event.target);
    input?.setCustomValidity('');
  });

  root.addEventListener('submit', event => {
    if (event.target !== form) return;
    event.preventDefault();
    if (currentPoll !== null) return;

    const inputs = [question, ...optionInputs];
    const values = inputs.map(input => input.value.trim());
    inputs.forEach((input, index) => {
      const message = index === 0 ? 'Enter a poll question.' : `Enter option ${index}.`;
      input.setCustomValidity(values[index] ? '' : message);
    });
    const invalid = inputs.find(input => !input.validity.valid);
    if (invalid) {
      invalid.focus();
      invalid.reportValidity();
      return;
    }

    currentPoll = {
      id: crypto.randomUUID(),
      question: values[0],
      options: values.slice(1).map(label => ({ id: crypto.randomUUID(), label })),
      votes: [],
    };
    showPoll(currentPoll);
  });
}
