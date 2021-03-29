# fm-mock

WebViewer-less development for WebViewers

(NOTE: this project is v0 and may change significantly before release)

A library for mocking the window.FileMaker object. This lets you develop FileMaker webviewer apps in the browser.
This can be especially useful if you're developiong in a framework like ReactJS and you want to use dev tools in your browser of choice.

## Try

Open `./example/index.html` in your browser. The javascript in this file calls FileMaker.PerformScript and successfully gets data despite running outside of a webviewer.

Open `./example/FMMock.fmp12`. This webviewer runs the same html code, but index.css has been inlined in a `<style>` tag and the last `<script>` block (the one that loads the mock scripts) has been disabled. With that code disabled, the JS uses the default FileMaker.PerformScript and calls real FM scripts.

Run `npm run example-multi` to see how it works in a multi-file environment. Look at `./exampl/multi-file/*` to see how this works.

## Usage

### Import

You can either import the library in a script tag like this:

    <script src="path/to/fm-mock.js"></script>

Or require the script in your js:

    const FMMock = require('fm-mock');

### Use

Once the code is imported, mocking scripts will immediately replace the window.FileMaker object and the script will be ready to call.

<<<<<<< Updated upstream
    // register some mock scripts
    FMMock.registerScript('Create Record', () => {
=======
    // mock some scripts
    FMMock.register('Create Record', () => {
>>>>>>> Stashed changes
        const res = JSON.stringify({"newRecordID": 123});
        // mock scripts should call global functions, just like FM must
        window.addRecordToUI(res);
    });
    FMMock.registerScript('Delete Record', () => { ... });

    // now call your scripts like this
    window.FileMaker.PerformScript('Create Record', param);
    window.FileMaker.PerformScriptWithOption('Create Record', param, opt);

#### Multi-file usage

Because the mock FileMaker object is global, you can register FM scripts within different files. This is useful if your app calls lots of different FileMaker scripts.

    // file1.js
    const { mockScript } = require('fm-mock');
    mockScript('Create Customer', () => {...});
    mockScript('Delete Customer', () => {...});

    // file2.js
    const { mockScript } = require('fm-mock');
    mockScript('Fetch Customers', () => {...});
    mockScript('Find Customer', () => {...});

## Contribute

If you have any feature ideas or bug fixes, please let me know or send a pull request.
