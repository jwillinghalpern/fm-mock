import { mockScript } from '../../dist/fm-mock.mjs';

mockScript('Script 2', () => {
  const cyan = '\x1b[36m%s\x1b[0m';
  console.log(cyan, 'Script 2 called');
  window.globalFunction();
});
