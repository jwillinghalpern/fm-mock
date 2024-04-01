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

export { mockScript };

//  mockGoferScript: (
// 	scriptName: string,
// 	callbackOrResult:
// 		| Record<string, unknown>
// 		| number
// 		| string
// 		| (({
// 				callbackName,
// 				promiseID,
// 				parameter,
// 			}: {
// 				callbackName: string;
// 				promiseID: string;
// 				parameter: string;
// 			}) => void),
// 	callbackOptions?: { delay?: number } // I think it would be cool to make the delay configurable via options in `mockScript` too. That way I don't have to call setTimeout within the callback to do that.
// ) => void;

type CallbackFunction = (
  callbackName: string,
  promiseID: string,
  parameter: string
) => void;
// // write a function called mockGoferScript that accepts the above call signature, and under the hood, calls mockScript with the scriptName and a function that calls the callbackOrResult function with the correct parameters. The callbackOrResult function should be called with the correct parameters, and the delay should be respected.
const mockGoferScript = (
  scriptName: string,
  callbackOrResult:
    | Record<string, unknown>
    | number
    | string
    | CallbackFunction,
  callbackOptions?: { delay?: number }
) => {
  console.log('callbackOrResult:', callbackOrResult);
  if (
    typeof callbackOrResult === 'string' ||
    typeof callbackOrResult === 'number' ||
    typeof callbackOrResult === 'object'
  ) {
    mockScript(scriptName, (rawParam: string) => {
      const { callbackName, promiseID } = JSON.parse(rawParam);
      setTimeout(() => {
        if (['object', 'number'].includes(typeof callbackOrResult)) {
          callbackOrResult = JSON.stringify(callbackOrResult);
        }
        // @ts-ignore
        window[callbackName](promiseID, callbackOrResult);
      }, callbackOptions?.delay || 0);
    });
    return;
  }

  if (typeof callbackOrResult === 'function') {
    mockScript(scriptName, (rawParam: string) => {
      const { callbackName, promiseID, parameter } = JSON.parse(rawParam);
      setTimeout(() => {
        if (typeof callbackOrResult !== 'function') {
          throw new Error('must pass in a real function');
        }
        callbackOrResult(callbackName, promiseID, rawParam);
      }, callbackOptions?.delay || 0);
    });
    return;
  }
};

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
