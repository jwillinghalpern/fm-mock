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
  window.FileMaker = {
    isMock: true,
    mockedScripts: {},
    PerformScriptWithOption: (script, param, option) =>
      performScriptWithOption(script, param, option),
    PerformScript: (script, param) => performScript(script, param),
  };
};

/**
 * register a FM script name and the function to call instead when that script
 * is called via FileMaker.PerformScript
 * @function
 *
 * @param {string} scriptName FM script name
 * @param {function} functionToCall JS function to call instead
 * @param {string} functionToCall.param param you'd pass to FileMaker
 */
const mockScript = (
  scriptName: string,
  functionToCall: (param: string) => void
): void => {
  if (typeof functionToCall !== 'function')
    throw new Error('must pass in a real function');
  mockFileMaker();
  window.FileMaker.mockedScripts[scriptName.toLowerCase()] = functionToCall;
};

/**
 * Mocks a script intended to be called via FMGofer. If `resultFromFM` is a function(both async or sync work), it will be executed with the parameter passed to `FMGofer.PerformScript[WithOption]`, and the result will be returned by the mock script. The other types will be stringified and returned as-is, simulating the behavior of FileMaker's `Perform JavaScript In Web Viewer` step, which always passes function parameters as strings.
 *
 * @param scriptName - The name of the FM script to mock.
 * @param options - Optional configuration options for the mock script.
 * @param options.resultFromFM - The result FM will return. This can be an object, array, number, string, or a function that accepts a single parameter and returns a result.
 * @param options.delay - The delay (in milliseconds) before executing the callback function. Defaults to 0. Use to simulate slow FM scripts.
 * @param options.returnError - If true, the FMGofer.PerformScript[WithOption] call will reject instead of resolve.
 * @param options.logParams - Specifies whether to log the parameters that will be received by FM.
 */
const mockGoferScript = (
  scriptName: string,
  options?: {
    resultFromFM?:
      | Record<string, unknown>
      | any[]
      | number
      | string
      | ResultFunction
      | AsyncResultFunction;
    delay?: number;
    returnError?: boolean;
    logParams?: boolean;
  }
) => {
  mockScript(scriptName, (rawParam: string) => {
    const { callbackName, promiseID, parameter } = JSON.parse(rawParam);
    if (options?.logParams) {
      console.log('callbackName:', callbackName);
      console.log('promiseID:', promiseID);
      console.log('parameter:', parameter);
    }

    setTimeout(async () => {
      const resultFromFM = options?.resultFromFM;
      let res =
        typeof resultFromFM === 'function'
          ? await resultFromFM(parameter)
          : resultFromFM;

      if (['object', 'number'].includes(typeof res)) {
        res = JSON.stringify(res);
      }

      // @ts-ignore
      window[callbackName](promiseID, res, options?.returnError || false);
    }, options?.delay || 0);
  });
};

type ResultFunction = (
  parameter: string
) => string | number | Record<string, unknown> | void;

type AsyncResultFunction = (
  ...args: Parameters<ResultFunction>
) => Promise<ReturnType<ResultFunction>>;

type ScriptOption = 0 | 1 | 2 | 3 | 4 | 5 | '0' | '1' | '2' | '3' | '4' | '5';

declare global {
  interface Window {
    FileMaker: {
      PerformScript: typeof performScript;
      PerformScriptWithOption: typeof performScriptWithOption;
      isMock: boolean;
      mockedScripts: {
        [key: string]: Function;
      };
    };
  }
}

export { mockScript, mockGoferScript };
