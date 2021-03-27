class FMMock {
  constructor() {
    this.fmScripts = {};

    window.FileMaker = {};
    window.FileMaker.PerformScriptWithOption = (script, param, option) => {
      return this.performScriptWithOption(script, param, option);
    };
    window.FileMaker.PerformScript = (script, param) => {
      return this.performScript(script, param);
    };
  }

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
