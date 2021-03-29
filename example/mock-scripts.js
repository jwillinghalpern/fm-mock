// For this example, I'm assuming the FMMock dependency is already loaded

// Register some mock FM scripts. Note: FM can only pass data via
//   Perform JavaScript In Webviewer[], so to simulate this only call
//   global JS functions from here to pass data "back in" to the WV.
// It's good to call functions by name  since that's what FM does:
//   e.g. window['fnName']
FMMock.registerScript('Create Record', () => {
  const id = Math.floor(Math.random() * (999 - 100 + 1) + 100);
  const message = `MOCK: Record created. id: ${id}`;
  // use setTimeout to better simulate FileMaker's behavior
  setTimeout(() => window['updateMessage'](message), 5);
});
FMMock.registerScript('Delete Record', (param) => {
  const message =
    param === 234
      ? `MOCK: Sorry, you don't have permission: Param: ${param}`
      : `MOCK: Delete successful! Param: ${param}`;
  setTimeout(() => window['updateMessage'](message), 5);
});

FMMock.registerScript('Fetch Records', (param) => {
  // you do this to simulate branching logic in your real FM Script.
  const returnSuccess = true;
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
    if (returnSuccess)
      fn(
        `MOCK: Thanks for sending this param:<br>${param}.<br><br>Here is your response:<br><pre>${response}</pre>`
      );
    else fn('Rejected by MOCK FileMaker');
  }, 750);
});
