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
  fn(param, option);
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
    // https://flutterq.com/no-index-signature-with-a-parameter-of-type-string-was-found-on-type/
  }
}
