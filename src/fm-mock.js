/* eslint-disable import/prefer-default-export */
/* eslint-disable no-undef */
/**
 * replacement for FileMaker.PerformScriptWithOption
 * @function
 *
 * @param {string} script
 * @param {string} param
 * @param {number} option
 */
const performScriptWithOption = (script, param, option) => {
  const fn = window.FileMaker.mockedScripts[script.toLowerCase()];
  if (fn === undefined)
    throw new Error(`The script '${script}' is not registered.`);
  fn(param, option);
};

/**
 * replacement for FileMaker.PerformScript
 * @function
 *
 * @param {string} script
 * @param {string} param
 */
const performScript = (script, param) => {
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
const mockScript = (scriptName, functionToCall) => {
  if (typeof functionToCall !== 'function')
    throw new Error('must pass in a real function');
  mockFileMaker();
  window.FileMaker.mockedScripts[scriptName.toLowerCase()] = functionToCall;
};

export { mockScript };
