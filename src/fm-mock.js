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
    window.FileMaker = {};
    window.FileMaker.PerformScriptWithOption = (script, param, option) => {
      return this.performScriptWithOption(script, param, option);
    };
    window.FileMaker.PerformScript = (script, param) => {
      return this.performScript(script, param);
    };
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

  performScriptWithOption(script, param, option) {
    const fn = this.fmScripts[script];
    if (fn === undefined)
      throw new Error(`The script '${script}' is not registered.`);
    return fn(param, option);
  }

  performScript(script, param) {
    const defaultOption = 0;
    return this.performScriptWithOption(script, param, defaultOption);
  }
}

export default FMMock;
