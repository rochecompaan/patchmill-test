import './style.css';
import { castVote, createPoll, getPollResults, type Poll } from './poll';

const creation = document.querySelector<HTMLDivElement>('#creation')!;
const form = creation.querySelector<HTMLFormElement>('#create-poll-form')!;
const question = form.querySelector<HTMLInputElement>('#poll-question')!;
const fields = form.querySelector<HTMLDivElement>('#option-fields')!;
const error = form.querySelector<HTMLParagraphElement>('#poll-error')!;
const addOption = form.querySelector<HTMLButtonElement>('#add-option')!;
const resultsSummary = document.querySelector<HTMLParagraphElement>('#results-summary')!;
const resultsCounts = document.querySelector<HTMLUListElement>('#results-counts')!;

let clearInputError: (() => void) | undefined;

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

function renderResults(poll: Poll): void {
  const { counts, leadingOptionIds } = getPollResults(poll);
  const leaders = new Set(leadingOptionIds);
  let summary: string | DocumentFragment = leaders.size > 1 ? 'The poll is tied.' : 'No votes yet. Choose an option to vote.';
  const rows = document.createDocumentFragment();

  for (const [index, { optionId, count }] of counts.entries()) {
    const { label } = poll.options[index];
    const leading = leaders.has(optionId);
    const soleLeader = leading && leaders.size === 1;
    const item = document.createElement('li');
    const choice = document.createElement('div');
    choice.className = 'result-choice';
    const ordinal = document.createElement('span');
    ordinal.className = 'result-ordinal';
    ordinal.textContent = `Option ${index + 1}`;
    const name = document.createElement('strong');
    const isolatedLabel = document.createElement('bdi');
    isolatedLabel.textContent = label;
    name.append(isolatedLabel);
    choice.append(ordinal, name);
    if (leading) {
      const marker = document.createElement('span');
      marker.className = 'result-marker';
      marker.textContent = soleLeader ? 'Leader' : 'Tied for lead';
      choice.append(marker);
    }
    if (soleLeader) {
      item.classList.add('is-leader');
      summary = document.createDocumentFragment();
      summary.append(`Current leader: ${ordinal.textContent}: `, isolatedLabel.cloneNode(true), '.');
    }
    const tally = document.createElement('span');
    tally.className = 'result-count';
    tally.textContent = `${count} ${count === 1 ? 'vote' : 'votes'}`;
    item.append(choice, tally);
    rows.append(item);
  }

  resultsCounts.replaceChildren(rows);
  resultsCounts.hidden = false;
  resultsSummary.replaceChildren(summary);
}

function showPoll(poll: Poll) {
  window.removeEventListener('beforeunload', warnAboutDraft);
  const heading = document.createElement('h3');
  heading.textContent = poll.question;
  heading.tabIndex = -1;

  let currentPoll = poll;
  let selectedOptionId: string | undefined;
  const receipt = document.createElement('p');
  receipt.className = 'vote-receipt';
  receipt.hidden = true;
  receipt.tabIndex = -1;
  receipt.setAttribute('aria-describedby', resultsSummary.id);

  const list = document.createElement('ul');
  list.setAttribute('role', 'list');
  const actions: HTMLButtonElement[] = [];
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
    actions.push(action);
    action.addEventListener('click', () => {
      if (selectedOptionId !== undefined) return;
      const result = castVote(currentPoll, id);
      if (!result.ok) return;
      currentPoll = result.poll;
      selectedOptionId = id;

      for (const button of actions) button.disabled = true;
      const marker = document.createElement('span');
      marker.className = 'vote-marker';
      marker.textContent = 'Your vote';
      choice.append(marker);
      row.classList.add('is-selected');
      receipt.textContent = `You voted for ${description}.`;
      receipt.hidden = false;
      renderResults(currentPoll);
      receipt.focus();
    });
    row.append(choice, action);
    item.append(row);
    list.append(item);
  }
  creation.classList.add('saved-poll');
  creation.replaceChildren(heading, receipt, list);
  renderResults(poll);
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

form.addEventListener('input', () => {
  const hasDraft = Array.from(form.querySelectorAll('input')).some(({ value }) => value.trim());
  if (hasDraft) window.addEventListener('beforeunload', warnAboutDraft);
  else window.removeEventListener('beforeunload', warnAboutDraft);
});

form.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button').forEach((control) => {
  control.disabled = false;
});
