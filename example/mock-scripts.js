// For this example, I'm assuming the FMMock dependency is already loaded

// instantiating FMMock replaces window.FileMaker automatically
const fmMock = new FMMock();

// Register some mock FM scripts. Note: FM can only pass data via
//   Perform JavaScript In Webviewer[], so to simulate this only call
//   global JS functions from here to pass data "back in" to the WV.
// It's good to call functions by name  since that's what FM does:
//   e.g. window['fnName']
fmMock.registerScript('Create Record', () => {
  const id = Math.floor(Math.random() * (999 - 100 + 1) + 100);
  const message = `MOCK: Record created. id: ${id}`;
  window['updateMessage'](message);
});

fmMock.registerScript('Delete Record', (param) => {
  const message =
    param === 234
      ? `MOCK: Sorry, you don't have permission: Param: ${param}`
      : `MOCK: Delete successful! Param: ${param}`;
  window['updateMessage'](message);
});

fmMock.registerScript('Fetch Records', (param) => {
  const resolvePromise = true;
  setTimeout(() => {
    const json = {
      data: [
        { id: 1, name: 'Joshy' },
        { id: 2, name: 'Bijou' },
        { id: 3, name: 'Wally' },
      ],
    };
    const response = JSON.stringify(json, null, 2);
    // this function syntax allows this code to live in a different file
    const fn = window['updateMessageAndHideLoader'];
    if (resolvePromise)
      fn(
        `MOCK: Thanks for sending this param:<br>${param}.<br><br>Here is your response:<br><pre>${response}</pre>`
      );
    else fn('Rejected by MOCK FileMaker');
  }, 750);
});
