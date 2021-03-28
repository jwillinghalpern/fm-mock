# fm-mock

(NOTE: this project is v0 and may change significantly before release)

A library for mocking the window.FileMaker object. This lets you develop FileMaker webviewer apps in the browser.

## Try

Open ./example/index.html in your browser. The javascript in this file calls FileMaker.PerformScript and successfully gets data despite running outside of a webviewer.

Open FMMock.fmp12. This webviewer runs the same html code, but index.css has been inlined in a `<style>` tag and the last `<script>` block (the one that loads the mock scripts) has been disabled. With that code disabled, the JS uses the default FileMaker.PerformScript and calls real FM scripts.

## Usage

### Import

You can either import the library in a script tag like this:

    <script src="dist/fm-mock.js"></script>

Or require the script in your js:

    const FMMock = require('fm-mock')

### Use

Once the code is imported, creating an instance of FMMock will immediately replace the window.FileMaker object and set up an FM mock script registry where you can define mock script logic:

    // create instance and mock window.FileMaker
    var fmMock = new FMMock()
    
    // register some mock scripts
    fmMock.register('Create Record', () => {
        const res = JSON.stringify({"newRecordID": 123});
        // mock scripts should call a global function, just like FileMaker has to do:
        window.addRecordToUI();
    });
    fmMock.register('Delete Record', () => {
        ...
    });
