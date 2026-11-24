import './style.css';
import { castVote, createPoll, type Poll } from './poll';
import { createPollStore } from './poll-storage';

const creation = document.querySelector<HTMLDivElement>('#creation')!;
const createPanel = creation.querySelector<HTMLDivElement>('#create-panel')!;
const savedPanel = creation.querySelector<HTMLDivElement>('#saved-panel')!;
const status = creation.querySelector<HTMLParagraphElement>('#storage-status')!;
const resetTemplate = creation.querySelector<HTMLTemplateElement>('#reset-controls')!;
const form = creation.querySelector<HTMLFormElement>('#create-poll-form')!;
const question = form.querySelector<HTMLInputElement>('#poll-question')!;
const fields = form.querySelector<HTMLDivElement>('#option-fields')!;
const error = form.querySelector<HTMLParagraphElement>('#poll-error')!;
const addOption = form.querySelector<HTMLButtonElement>('#add-option')!;

const store = createPollStore(() => window.localStorage);
let currentPoll: Poll | undefined;
let clearInputError: (() => void) | undefined;

function clearDraftError() {
  clearInputError?.();
  clearInputError = undefined;
  error.textContent = '';
}

function showError(input: HTMLInputElement, message: string) {
  const description = input.getAttribute('aria-describedby');
  input.setAttribute('aria-describedby', description ? `${description} ${error.id}` : error.id);
  input.setAttribute('aria-invalid', 'true');
  if (input.nextElementSibling !== error) input.after(error);
  error.textContent = message;
  input.focus({ preventScroll: true });
  revealError(input);

  clearInputError = () => {
    input.removeAttribute('aria-invalid');
    if (description === null) input.removeAttribute('aria-describedby');
    else input.setAttribute('aria-describedby', description);
  };
}

function revealError(input: HTMLInputElement) {
  const message = error.getBoundingClientRect();
  const height = window.innerHeight;
  const row = input.closest('.field')!;

  // Prefer the labeled row, but prioritize the input and message in short viewports.
  for (const element of [row, input]) {
    const field = element.getBoundingClientRect();
    const top = Math.min(field.top, message.top);
    const bottom = Math.max(field.bottom, message.bottom);
    if (bottom - top > height) continue;
    if (top < 8 || bottom > height - 8) {
      window.scrollBy(0, (top + bottom - height) / 2);
    }
    return;
  }
  input.scrollIntoView({ block: 'nearest' });
}

function warnAboutDraft(event: BeforeUnloadEvent) {
  event.preventDefault();
  event.returnValue = true;
}

function buildOptions(poll: Poll, receipt: HTMLParagraphElement) {
  const selectedOptionId = poll.votes[0]?.optionId;
  const list = document.createElement('ul');
  list.setAttribute('role', 'list');
  for (const [index, { id, label }] of poll.options.entries()) {
    const item = document.createElement('li');
    const row = document.createElement('div');
    row.className = 'vote-row';
    const choice = document.createElement('div');
    choice.className = 'vote-choice';
    const ordinal = document.createElement('span');
    ordinal.className = 'vote-ordinal';
    ordinal.textContent = `Option ${index + 1}`;
    const name = document.createElement('strong');
    name.textContent = label;
    choice.append(ordinal, name);

    const action = document.createElement('button');
    action.type = 'button';
    action.textContent = 'Vote';
    const description = `option ${index + 1}: ${label}`;
    action.setAttribute('aria-label', `Vote for ${description}`);
    action.disabled = selectedOptionId !== undefined;
    action.addEventListener('click', () => {
      if (currentPoll !== poll || poll.votes.length !== 0) return;
      const result = castVote(poll, id);
      if (result.ok) saveAndShow(result.poll, 'vote');
    });

    if (id === selectedOptionId) {
      const marker = document.createElement('span');
      marker.className = 'vote-marker';
      marker.textContent = 'Your vote';
      choice.append(marker);
      row.classList.add('is-selected');
      receipt.textContent = `You voted for ${description}.`;
      receipt.hidden = false;
    }
    row.append(choice, action);
    item.append(row);
    list.append(item);
  }
  return list;
}

function buildResetControls(poll: Poll) {
  const controls = resetTemplate.content.cloneNode(true) as DocumentFragment;
  const opener = controls.querySelector<HTMLDivElement>('.reset-opener')!;
  const open = opener.querySelector('button')!;
  const confirmation = controls.querySelector<HTMLDivElement>('.reset-confirmation')!;
  const cancel = controls.querySelector<HTMLButtonElement>('.cancel-reset')!;
  const confirm = controls.querySelector<HTMLButtonElement>('.confirm-reset')!;

  open.addEventListener('click', () => {
    if (currentPoll !== poll || !confirmation.hidden) return;
    opener.hidden = true;
    confirmation.hidden = false;
    cancel.focus();
  });
  cancel.addEventListener('click', () => {
    if (currentPoll !== poll || confirmation.hidden) return;
    confirmation.hidden = true;
    opener.hidden = false;
    open.focus();
  });
  confirm.addEventListener('click', () => {
    if (currentPoll !== poll || confirmation.hidden) return;
    if (!store.clear()) {
      status.textContent = 'Could not reset this poll. Try again.';
      return;
    }
    currentPoll = undefined;
    status.textContent = '';
    showCleanForm();
  });
  return controls;
}

function showCleanForm() {
  savedPanel.hidden = true;
  savedPanel.replaceChildren();
  clearDraftError();
  form.reset();
  while (fields.childElementCount > 2) fields.lastElementChild!.remove();
  window.removeEventListener('beforeunload', warnAboutDraft);
  creation.classList.remove('saved-poll');
  createPanel.hidden = false;
  question.focus();
}

function showPoll(poll: Poll, transition: 'restore' | 'create' | 'vote') {
  window.removeEventListener('beforeunload', warnAboutDraft);
  const heading = document.createElement('h3');
  heading.textContent = poll.question;
  heading.tabIndex = -1;

  const receipt = document.createElement('p');
  receipt.className = 'vote-receipt';
  receipt.hidden = true;
  receipt.tabIndex = -1;

  const options = buildOptions(poll, receipt);
  savedPanel.replaceChildren(heading, receipt, options, buildResetControls(poll));
  createPanel.hidden = true;
  savedPanel.hidden = false;
  creation.classList.add('saved-poll');
  if (transition === 'create') heading.focus();
  if (transition === 'vote') receipt.focus();
}

function saveAndShow(poll: Poll, transition: 'create' | 'vote') {
  currentPoll = poll;
  status.textContent = store.save(poll) ? '' : 'Could not save this poll. A refresh may lose your changes.';
  showPoll(poll, transition);
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
  if (currentPoll) return;
  clearDraftError();

  const options = Array.from(fields.querySelectorAll<HTMLInputElement>('input[name="option"]'));
  const result = createPoll(question.value, options.map(({ value }) => value));
  if (result.ok) {
    saveAndShow(result.poll, 'create');
  } else if (result.reason === 'question-required') {
    showError(question, 'Enter a poll question.');
  } else {
    const blankOption = options.find(({ value }) => !value.trim());
    // The form always has at least two inputs; too few options means one is blank.
    showError(blankOption!, 'Enter at least two lunch options.');
  }
});

form.addEventListener('input', () => {
  const hasDraft = Array.from(form.querySelectorAll('input')).some(({ value }) => value.trim());
  if (hasDraft) window.addEventListener('beforeunload', warnAboutDraft);
  else window.removeEventListener('beforeunload', warnAboutDraft);
});

const saved = store.load();
if (saved.kind === 'loaded') {
  currentPoll = saved.poll;
  showPoll(saved.poll, 'restore');
} else if (saved.kind === 'invalid') {
  status.textContent = 'The saved poll could not be read. Save a new poll to replace it.';
} else if (saved.kind === 'unavailable') {
  status.textContent = 'Browser storage is unavailable. A refresh may lose this poll.';
}

form.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button').forEach((control) => {
  control.disabled = false;
});
