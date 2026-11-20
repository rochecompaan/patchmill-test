import './style.css';
import { mountPollApp } from './poll-app';

const workspace = document.querySelector<HTMLElement>('#poll-workspace');
if (!workspace) {
  throw new Error('The poll workspace is missing.');
}
mountPollApp(workspace);
