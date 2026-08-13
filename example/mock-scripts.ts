// In your own project this would be `import { mockScript } from 'fm-mock';`
// Here we import the source directly so the example picks up local edits.
import { mockScript } from '../src/fm-mock';

// Mock some FM scripts. Note: FM can only pass data via
//   Perform JavaScript In Webviewer[], so to simulate this only call
//   global JS functions from here to pass data "back in" to the WV.
// It's good to call functions by name  since that's what FM does:
//   e.g. window['fnName']
mockScript('Create Record', () => {
  const id = Math.floor(Math.random() * (999 - 100 + 1) + 100);
  const message = `MOCK: Record created. id: ${id}`;
  // use setTimeout to better simulate FileMaker's behavior
  setTimeout(() => window.updateMessage(message), 5);
});

mockScript('Delete Record', (param) => {
  const message =
    Number(param) === 234
      ? `MOCK: Sorry, you don't have permission: Param: ${param}`
      : `MOCK: Delete successful! Param: ${param}`;
  setTimeout(() => window.updateMessage(message), 5);
});

mockScript('Fetch Records', (param) => {
  // you do this to simulate branching logic in your real FM Script.
  const returnSuccess = true;
  setTimeout(() => {
    const json = {
      data: [
        { id: 1, name: 'Joshy' },
        { id: 2, name: 'Washy' },
        { id: 3, name: 'Goshy' },
      ],
    };
    const response = JSON.stringify(json, null, 2);
    // this function syntax allows this code to live in a different file
    const fn = window.updateMessageAndHideLoader;
    if (returnSuccess) {
      fn(
        `MOCK: Thanks for sending this param:<br>${param}.<br><br>Here is your response:<br><pre>${response}</pre>`,
      );
    } else {
      fn('Rejected by MOCK FileMaker');
    }
  }, 750);
});
