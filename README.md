# fm-mock

WebViewer-less development for WebViewers

A library for mocking the window.FileMaker object. This lets you develop FileMaker webviewer apps in the browser.

This can be especially useful if you're developing in a frontend framework like React, Vue, Svelte etc and you want to use dev tools in your browser of choice.

## Try

```sh
npm install
npm run dev
```

Then open the `/example/` URL that Vite prints. The javascript in `./example/main.ts` calls FileMaker.PerformScript and successfully gets data despite running outside of a webviewer.

The mocks live in `./example/mock-scripts.ts` and are loaded from `./example/main.ts` behind an `import.meta.env.DEV` check, so a production build drops fm-mock entirely.

Open `./example/FMMock.fmp12` to see the same app running in a real webviewer. There, `window.FileMaker` is provided by FileMaker itself, so the mock branch never runs and the JS calls real FM scripts.

## Usage

### 🏁 Install / Import

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

### ❇️ Use

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

#### 🤓 FMGofer Integration

If you're using [FMGofer](https://github.com/jwillinghalpern/fm-gofer), then
it's even easier to mock scripts. Use `mockGoferScript` instead of `mockScript`.

##### Quick'n'dirty

```javascript
import { mockGoferScript } from 'fm-mock';

// can return a value directly!
// string, number, boolean, object, array, will all be returned as a string just
// like FM's `Perform JavaScript In Web Viewer` step does
mockGoferScript('Get Count', {
  resultFromFM: 17,
});
```

##### Using a function to generate the response

You can pass a function to dynamically generate the return value, like `mockScript`.

```javascript
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
```

##### Store big json in separate file

This can keep your mocking code cleaner.

```javascript
mockGoferScript('Get Data', {
  resultFromFM: () => import('./mocks/data.json').then((res) => res.default),
});
```

##### Simulate errors from FM

Simply `throw`ing an error in the mock mimics the result of FileMaker calling back with the [FMGofer error](https://github.com/jwillinghalpern/fm-gofer?tab=readme-ov-file#in-your-filemaker-script) parameter set.

```javascript
mockGoferScript('Get Data', {
  resultFromFM: (param) => {
    switch (param.action) {
      case 'GET_CUSTOMER':
        return { name: 'John Doe' };
      case 'GET_ORDER':
        return { order: '123' };
      default:
        throw new Error(`Unknown action: ${param.action}`);
    }
  },
});
```

##### Other convenient options

Options to simulate different situations like slow scripts and errors that occur in your FM script (like a record lock conflict).

```javascript
mockGoferScript('Get Data', {
  resultFromFM: 'this might be an error',
  // simulate slow 2s fm script
  delay: 2000,
  // simulate 20% chance of error (FMGofer.PerformScript will reject)
  // this option is ignored if resultFromFM is a function that throws an error
  returnError: Math.random() > 0.8,
  // logs callbackName, promiseID, parameter as would be passed to FM in production
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

## 🛠 Develop

This repo uses [Vite](https://vite.dev) for the build and dev server, [Vitest](https://vitest.dev) for tests, and [Biome](https://biomejs.dev) for linting and formatting.

```sh
npm run dev        # dev server for ./example
npm test           # run tests once, with coverage
npm run test:watch # watch mode
npm run typecheck  # tsc --noEmit over src, tests, and example
npm run lint       # biome check
npm run format     # biome format --write
npm run build      # bundles to ./dist + emits .d.ts
```

`npm run build` produces `dist/fm-mock.js` (UMD, global `FMMock`), `dist/fm-mock.mjs` (ES module), and `dist/fm-mock.d.ts`. Both bundles target ES2020, so fm-mock requires a Chromium/WebKit-based webviewer — FileMaker 19.3+ on Windows, or any recent FileMaker on macOS/iOS.

`dist/` is generated and not committed; `npm run build` runs automatically before publish.

## 👯 Contribute

If you have any feature ideas or bug fixes, please let me know or send a pull request.
