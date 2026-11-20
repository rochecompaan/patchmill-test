import type { Poll } from './domain/poll';

function trimWhitespace(value: string): string {
  const whitespace = /[\s\p{White_Space}]/u;
  let start = 0;
  let end = value.length;
  while (start < end && whitespace.test(value[start])) start++;
  while (end > start && whitespace.test(value[end - 1])) end--;
  return value.slice(start, end);
}

/** Mount once per workspace. Polls live only in this document's memory. */
export function mountPollApp(root: HTMLElement): void {
  const document = root.ownerDocument;
  const window = document.defaultView!;
  let currentPoll: Poll | null = null;
  const warnBeforeUnload = (event: BeforeUnloadEvent): void => {
    event.preventDefault();
    event.returnValue = '';
  };
  root.innerHTML = `
    <section aria-labelledby="create-heading">
      <h2 id="create-heading">Create a poll</h2>
      <form novalidate autocomplete="off">
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
  const optionFields = form.querySelector('.option-fields')!;
  const addButton = form.querySelector('button')!;

  function appendOption(): HTMLInputElement {
    const number = optionFields.querySelectorAll('input').length + 1;
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.id = `poll-option-${number}`;
    input.name = 'option';
    input.type = 'text';
    input.required = true;
    label.htmlFor = input.id;
    label.textContent = `Option ${number}`;
    optionFields.append(label, input);
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
    if (event.target instanceof window.HTMLInputElement && currentPoll === null) {
      event.target.setCustomValidity('');
      // Only clearing a field needs a scan; ordinary keystrokes stay constant-time.
      const hasDraft = event.target.value !== '' || [...form.querySelectorAll('input')].some(input => input.value !== '');
      if (hasDraft) window.addEventListener('beforeunload', warnBeforeUnload);
      else window.removeEventListener('beforeunload', warnBeforeUnload);
    }
  });

  root.addEventListener('submit', event => {
    if (event.target !== form) return;
    event.preventDefault();
    if (currentPoll !== null) return;

    const inputs = [...form.querySelectorAll('input')];
    const values = inputs.map(input => trimWhitespace(input.value));
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
    window.removeEventListener('beforeunload', warnBeforeUnload);
    showPoll(currentPoll);
  });
}
