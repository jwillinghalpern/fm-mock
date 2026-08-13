declare global {
  interface Window {
    updateMessage: (message: string) => void;
    updateMessageAndHideLoader: (message: string) => void;
  }
}

const byId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing element #${id}`);
  return el;
};

// Load fm-mock only in development, and only when a real FileMaker webviewer
// isn't providing window.FileMaker already. `npm run build` in a consuming
// project strips this branch out entirely, leaving fm-mock out of production.
if (import.meta.env.DEV && typeof window.FileMaker === 'undefined') {
  await import('./mock-scripts');

  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerText = 'FileMaker not found, USING FM-MOCK!';
  document.body.appendChild(footer);
} else {
  const footer = document.createElement('footer');
  footer.className = 'footer success';
  footer.innerText = 'FileMaker detected, NOT using fm-mock';
  document.body.appendChild(footer);
}

const showLoader = () => {
  (byId('loader') as HTMLDivElement).hidden = false;
};
const hideLoader = () => {
  (byId('loader') as HTMLDivElement).hidden = true;
};

// Global functions exposed to FileMaker. FM can only call back into a webviewer
// via `Perform JavaScript In Web Viewer`, which invokes globals by name.
window.updateMessage = (message: string) => {
  byId('message').innerHTML = message;
};
window.updateMessageAndHideLoader = (message: string) => {
  window.updateMessage(message);
  hideLoader();
};

// Buttons
byId('fetchButton').onclick = () => {
  showLoader();
  window.updateMessage('Fetching records...');
  const param = JSON.stringify({ message: 'hi, please return data.' });
  window.FileMaker.PerformScript('Fetch Records', param);
};
byId('createRecordButton').onclick = () => {
  window.FileMaker.PerformScriptWithOption('Create Record', 123, 0);
};
byId('deleteFailButton').onclick = () => {
  window.FileMaker.PerformScript('Delete Record', 234);
};
byId('deleteSuccessButton').onclick = () => {
  window.FileMaker.PerformScript('Delete Record', 345);
};
