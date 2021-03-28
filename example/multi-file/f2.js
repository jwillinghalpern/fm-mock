import { registerScript, applyMock } from '../../dist/fm-mock.mjs';

applyMock();

registerScript('Script 2', () => {
  const cyan = '\x1b[36m%s\x1b[0m';
  console.log(cyan, 'Script 2 called');
  window.globalFunction();
});
