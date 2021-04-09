// the tsd-jsdoc module doesn't seem to include the 'export' keyword before the
// function declarations, so this will add them before each 'declare'

const { readFile, writeFile } = require('fs');
// const path = require('path');

const path = 'dist/fm-mock.d.ts';
readFile(path, 'utf-8', (err, data) => {
  if (err) throw new Error(err);
  const output = data.replace(/^declare/gm, 'export declare');
  writeFile(path, output, (writeError) => {
    if (writeError) throw new Error(writeError);
  });
});
