const FMMock = require('../../dist/fm-mock.js');

// // you can also import like this if you're using ecmascript module syntax
// import * as fmMock from '../../dist/fm-mock.mjs';

// // or import the named exports directly so you don't have to prefix fmMock.*
// import { registerScript, applyMock } as fmMock from '../../dist/fm-mock.mjs';

FMMock.registerScript('Script 1', () => {
  const cyan = '\x1b[36m%s\x1b[0m';
  console.log(cyan, 'Script 1 called');
  window.globalFunction();
});
