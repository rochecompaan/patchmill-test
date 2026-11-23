import './style.css';
import { createPoll, type Poll } from './poll';

const creation = document.querySelector<HTMLDivElement>('#creation')!;
const form = creation.querySelector<HTMLFormElement>('#create-poll-form')!;
const question = form.querySelector<HTMLInputElement>('#poll-question')!;
const fields = form.querySelector<HTMLDivElement>('#option-fields')!;
const error = form.querySelector<HTMLParagraphElement>('#poll-error')!;
const addOption = form.querySelector<HTMLButtonElement>('#add-option')!;

let clearInputError: (() => void) | undefined;

function showError(input: HTMLInputElement, message: string) {
  const description = input.getAttribute('aria-describedby');
  input.setAttribute('aria-describedby', description ? `${description} ${error.id}` : error.id);
  input.setAttribute('aria-invalid', 'true');
  error.textContent = message;
  input.focus();

  clearInputError = () => {
    input.removeAttribute('aria-invalid');
    if (description === null) input.removeAttribute('aria-describedby');
    else input.setAttribute('aria-describedby', description);
  };
}

function showPoll(poll: Poll) {
  const heading = document.createElement('h3');
  heading.textContent = poll.question;
  heading.tabIndex = -1;

  const list = document.createElement('ul');
  for (const { label } of poll.options) {
    const item = document.createElement('li');
    item.textContent = label;
    list.append(item);
  }
  creation.replaceChildren(heading, list);
  heading.focus();
}

addOption.addEventListener('click', () => {
  const number = fields.childElementCount + 1;
  const field = document.createElement('div');
  field.className = 'field';

  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'option';
  input.id = `option-${number}`;

  const label = document.createElement('label');
  label.htmlFor = input.id;
  label.textContent = `Option ${number}`;

  field.append(label, input);
  fields.append(field);
  input.focus();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearInputError?.();
  clearInputError = undefined;
  error.textContent = '';

  const options = Array.from(fields.querySelectorAll<HTMLInputElement>('input[name="option"]'));
  const result = createPoll(question.value, options.map(({ value }) => value));
  if (result.ok) {
    showPoll(result.poll);
  } else if (result.reason === 'question-required') {
    showError(question, 'Enter a poll question.');
  } else {
    const blankOption = options.find(({ value }) => !value.trim());
    // The form always has at least two inputs; too few options means one is blank.
    showError(blankOption!, 'Enter at least two lunch options.');
  }
});

form.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button').forEach((control) => {
  control.disabled = false;
});
