/* eslint-disable no-undef */
/**
 * replacement for FileMaker.PerformScriptWithOption
 *
 * @param {string} script
 * @param {string} param
 * @param {number} option
 * @returns {any}
 */
const performScriptWithOption = (script, param, option) => {
  const fn = window.FileMaker.registeredScripts[script];
  if (fn === undefined)
    throw new Error(`The script '${script}' is not registered.`);
  return fn(param, option);
};

/**
 * replacement for FileMaker.PerformScript
 *
 * @param {string} script
 * @param {string} param
 * @returns {any}
 */
const performScript = (script, param) => {
  const defaultOption = 0;
  return performScriptWithOption(script, param, defaultOption);
};

/**
 * register a FM script name and the function to call instead when that script
 * is called via FileMaker.PerformScript
 *
 * @param {string} scriptName FM script name
 * @param {function} functionToCall JS function to call instead
 */
export const registerScript = (scriptName, functionToCall) => {
  if (typeof functionToCall !== 'function')
    throw new Error('must pass in a real function');
  window.FileMaker.registeredScripts[scriptName] = functionToCall;
};

/**
 * replace window.FileMaker with this mock
 *
 */
export const applyMock = () => {
  const alreadyMocked =
    typeof window.FileMaker === 'object' && window.FileMaker.isMock;
  if (alreadyMocked) return;

  window.FileMaker = {
    isMock: true,
    registeredScripts: {},
    PerformScriptWithOption: (script, param, option) =>
      performScriptWithOption(script, param, option),
    PerformScript: (script, param) => performScript(script, param),
  };
};
