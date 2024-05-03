# fm-mock

WebViewer-less development for WebViewers

A library for mocking the window.FileMaker object. This lets you develop FileMaker webviewer apps in the browser.

This can be especially useful if you're developing in a frontend framework like React, Vue, Svelte etc and you want to use dev tools in your browser of choice.

## Try

Open `./example/index.html` in your browser. The javascript in this file calls FileMaker.PerformScript and successfully gets data despite running outside of a webviewer.

Open `./example/FMMock.fmp12`. This webviewer runs the same html code, but index.css has been inlined in a `<style>` tag and the last `<script>` block (the one that loads the mock scripts) has been disabled. With that code disabled, the JS uses the default FileMaker.PerformScript and calls real FM scripts.

Run `npm run example-multi` to see how it works in a multi-file environment. Look at `./exampl/multi-file/*` to see how this works.

## Usage

### Install / Import

```sh
npm install --save-dev fm-mock
```

Import ES Module (preferred):

```javascript
import { mockScript } from 'fm-mock';
```

#### Other options

Via script tag:

```html
<script src="path/to/fm-mock.js"></script>
```

CommonJS require:

```javascript
const FMMock = require('fm-mock');
```

### Use

Once the code is imported, mocking scripts will immediately replace the window.FileMaker object and the script will be ready to call.

```javascript
// mock some scripts
FMMock.mockScript('Create Record', () => {
    const res = JSON.stringify({"newRecordID": 123});
    // mock scripts should call global functions, just like FM must
    window.addRecordToUI(res);
});
FMMock.mockScript('Delete Record', () => { ... });

// now call your scripts like this
window.FileMaker.PerformScript('Create Record', param);
window.FileMaker.PerformScriptWithOption('Create Record', param, opt);
```

#### FMGofer Integration

If you're using [FMGofer](https://github.com/jwillinghalpern/fm-gofer), then
it's even easier to mock scripts. Use `mockGoferScript` instead of `mockScript`.

```javascript
import { mockGoferScript } from 'fm-mock';

// can return a value directly!
// string, number, boolean, object, array, will all be returned as a string just
// like FM's `Perform JavaScript In Web Viewer` step does
mockGoferScript('Get Count', {
  resultFromFM: 17,
});

// can pass a function to dynamically generate the return value, like mockScript
mockGoferScript('Get Count', {
  resultFromFM: () => Math.floor(Math.random() * 100),
});
// async works too
mockGoferScript('Get Count', {
  resultFromFM: async () => {
    const res = await fetch('https://api.example.com/count');
    return await res.text();
  },
});

// store big json in a separate file
mockGoferScript('Get Initial Data', {
  resultFromFM: () => import('./mocks/initial-data.json'),
});
// or if the import automatically nests your json inside a `default` key, extract it like this:
mockGoferScript('Get Initial Data', {
  resultFromFM: () => import('./mocks/initial-data.json').then((res) => res.default),
});

// convenient options to simulate different situations like slow scripts and
// errors that occur in your FM script (like a record lock conflict)
mockGoferScript('Get Count', {
  resultFromFM: 'this might be an error',
  // simulate 2s fm script
  delay: 2000,
  // simulate 20% chance of error (FMGofer.PerformScript will reject)
  returnError: Math.random() > 0.8,
  // logs callbackName, promiseID, parameter as would be passed to FM
  logParams: true,
});
```

#### Vite

If you're using Vite, toggling dev/production is easy. Use an if statement to only mock scripts in development.

```javascript
import { mockScript } from 'fm-mock';

if (import.meta.env.DEV) {
    mockScript('Fetch Records', (param) => { ... });
}
```

#### Restoring window.FileMaker

If you wish to restore the original FileMaker functions, you can. This can be useful if your app has automated tests and you want to restore FileMaker between tests.

```javascript
import { mockScript, restoreMocks } from 'fm-mock';

restoreMocks();
```

Now `npm run dev` will let you test in the browser, and `npm run build` will create a version ready to use in your FM webviewer with fm-mock removed completely.

## Test

```sh
npm test
```

## Contribute

If you have any feature ideas or bug fixes, please let me know or send a pull request.
