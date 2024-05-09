/* eslint-disable import/prefer-default-export */
/* eslint-disable no-undef */
/**
 * replacement for FileMaker.PerformScriptWithOption
 * @function
 * @private
 *
 * @param {string} script
 * @param {string} param
 * @param {number} option
 */
const performScriptWithOption = (
  script: string,
  param?: any,
  option?: ScriptOption
) => {
  const fn = window.FileMaker?.mockedScripts?.[script.toLowerCase()];
  if (fn === undefined)
    throw new Error(`The script '${script}' is not registered.`);
  // setTimeout simulates FM async behavior by moving call to end of event loop
  setTimeout(() => {
    fn(param, option);
  }, 1);
};

/**
 * replacement for FileMaker.PerformScript
 * @function
 * @private
 *
 * @param {string} script
 * @param {string} param
 */
const performScript = (script: string, param?: any) => {
  const defaultOption = 0;
  performScriptWithOption(script, param, defaultOption);
};

/**
 * checks if window.FileMaker is already mocked
 * @private
 *
 * @returns {boolean} true if already mocked
 */
const fmIsMock = () =>
  !!(typeof window.FileMaker === 'object' && window.FileMaker.isMock);

/**
 * replace window.FileMaker with this mock
 * @private
 *
 */
const mockFileMaker = () => {
  if (fmIsMock()) return;
  const originalFileMaker = window.FileMaker;
  window.FileMaker = {
    originalFileMaker,
    isMock: true,
    mockedScripts: {},
    PerformScriptWithOption: (script, param, option) =>
      performScriptWithOption(script, param, option),
    PerformScript: (script, param) => performScript(script, param),
  };
};

const restoreMocks = () => {
  if (window.FileMaker.isMock) {
    window.FileMaker = window.FileMaker.originalFileMaker;
  }
};

/**
 * register a FM script name and the function to call instead when that script
 * is called via FileMaker.PerformScript
 * @function
 *
 * @param {string} scriptName FM script name
 * @param {function} functionToCall JS function to call instead
 * @param {string} functionToCall.param param you'd pass to FileMaker
 * @param {Options} options optional configuration options
 * @param {number} options.delay delay in milliseconds before executing the callback function
 * @param {boolean} options.logParams log the parameters received by the mock
 */
const mockScript = (
  scriptName: string,
  functionToCall: (param: string) => void,
  options?: Options
): void => {
  if (typeof functionToCall !== 'function') {
    throw new Error('must pass in a real function');
  }
  mockFileMaker();

  const wrappedFunction = (param: string) => {
    const fn = () => {
      if (options?.logParams) console.log('param:', param);
      functionToCall(param);
    };

    options?.delay ? setTimeout(fn, options.delay) : fn();
  };

  window.FileMaker.mockedScripts[scriptName.toLowerCase()] = wrappedFunction;
};

/**
 * Mocks a script intended to be called via FMGofer. If `resultFromFM` is a function(both async or sync work), it will be executed with the parameter passed to `FMGofer.PerformScript[WithOption]`, and the result will be returned by the mock script. The other types will be stringified and returned as-is, simulating the behavior of FileMaker's `Perform JavaScript In Web Viewer` step, which always passes function parameters as strings.
 *
 * @param scriptName - The name of the FM script to mock.
 * @param options - Optional configuration options for the mock script.
 * @param options.resultFromFM - The result FM will return. This can be an object, array, number, string, or a function that accepts a single parameter and returns a result. If you pass a function and the function throws an error, the promise will be rejected as if FileMaker responded with an error.
 * @param options.delay - The delay (in milliseconds) before executing the callback function. Defaults to 0. Use to simulate slow FM scripts.
 * @param options.returnError - If true, the FMGofer.PerformScript[WithOption] call will reject instead of resolve. If `resultFromFM` is a function that throws an error, this option is ignored.
 * @param options.logParams - Specifies whether to log the parameters that will be received by FM.
 */
const mockGoferScript = (scriptName: string, options?: GoferOptions) => {
  mockScript(
    scriptName,
    (rawParam: string) => {
      const { callbackName, promiseID, parameter } = JSON.parse(rawParam);
      if (options?.logParams) {
        console.log('callbackName:', callbackName);
        console.log('promiseID:', promiseID);
        console.log('parameter:', parameter);
      }

      const fn = async () => {
        const resultFromFM = options?.resultFromFM;
        let res;
        let returnError = options?.returnError || false;

        // try convert a thrown exception into a fmgofer error callback
        try {
          res =
            typeof resultFromFM === 'function'
              ? await resultFromFM(parameter)
              : resultFromFM;
        } catch (err) {
          returnError = true;
          if (err instanceof Error) res = err.message;
          else res = err;
        }

        if (['object', 'number'].includes(typeof res)) {
          res = JSON.stringify(res);
        }

        // @ts-ignore
        window[callbackName](promiseID, res, returnError);
      };

      // don't call setTimeout here, as it's already handled in mockScript.
      // Just pass delay to mockScript.
      fn();
    },
    { delay: options?.delay }
  );
};

type ResultFunction = (
  // parameter is `any` to match FMGofer.PerformScript's `any` parameter type.
  parameter: any
) => string | number | Record<string, unknown> | any[] | void;

type AsyncResultFunction = (
  ...args: Parameters<ResultFunction>
) => Promise<ReturnType<ResultFunction>>;

type ScriptOption = 0 | 1 | 2 | 3 | 4 | 5 | '0' | '1' | '2' | '3' | '4' | '5';

/**
 * Options param for `mockScript`.
 */
interface Options {
  /**
   * The delay in milliseconds before the callback function is executed. Simulate slow fm scripts.
   */
  delay?: number;

  /**
   * Specifies whether to log the parameters received by the mock.
   */
  logParams?: boolean;
}

/**
 * Options param for `mockGoferScript`.
 */
interface GoferOptions extends Options {
  /**
   * The mock result from FM. It can be an object, an array, a number, a string, or a function that produces any of those.
   */
  resultFromFM?:
    | Record<string, unknown>
    | any[]
    | number
    | string
    | ResultFunction
    | AsyncResultFunction;

  /**
   * Specifies whether to return an error.
   */
  returnError?: boolean;
}

declare global {
  interface Window {
    FileMaker: {
      originalFileMaker: any;
      PerformScript: typeof performScript;
      PerformScriptWithOption: typeof performScriptWithOption;
      isMock: boolean;
      mockedScripts: {
        [key: string]: Function;
      };
    };
  }
}

export { mockScript, mockGoferScript, restoreMocks };
