/* eslint-disable no-undef */
/**
 * Class for mocking the window.FileMaker object and mocking FM script calls
 *
 * @class FMMock
 */
class FMMock {
  /**
   * Creates an instance of FMMock.
   * @memberof FMMock
   */
  constructor() {
    this.fmScripts = {};
    this.enable();
  }

  /**
   * replace window.FileMaker with this mock
   *
   * @memberof FMMock
   */
  enable() {
    const alreadyMocked =
      typeof window.FileMaker === 'object' && window.FileMaker.isMock;
    if (alreadyMocked) return;
    window.FileMaker = {};
    window.FileMaker.isMock = true;
    window.FileMaker.PerformScriptWithOption = (script, param, option) =>
      this.performScriptWithOption(script, param, option);
    window.FileMaker.PerformScript = (script, param) =>
      this.performScript(script, param);
  }

  /**
   * register a FM script name and the function to call instead when that script
   * is called via FileMaker.PerformScript
   *
   * @param {string} scriptName FM script name
   * @param {function} functionToCall JS function to call instead
   * @memberof FMMock
   */
  registerScript(scriptName, functionToCall) {
    if (typeof functionToCall !== 'function')
      throw new Error('must pass in a real function');
    this.fmScripts[scriptName] = functionToCall;
  }

  /**
   * replacement for FileMaker.PerformScriptWithOption
   *
   * @param {string} script
   * @param {string} param
   * @param {number} option
   * @returns {any}
   * @private
   * @memberof FMMock
   */
  performScriptWithOption(script, param, option) {
    const fn = this.fmScripts[script];
    if (fn === undefined)
      throw new Error(`The script '${script}' is not registered.`);
    return fn(param, option);
  }

  /**
   * replacement for FileMaker.PerformScript
   *
   * @param {string} script
   * @param {string} param
   * @returns {any}
   * @private
   * @memberof FMMock
   */
  performScript(script, param) {
    const defaultOption = 0;
    return this.performScriptWithOption(script, param, defaultOption);
  }
}

export default FMMock;
