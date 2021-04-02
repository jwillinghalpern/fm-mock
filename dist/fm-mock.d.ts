/**
 * replacement for FileMaker.PerformScriptWithOption
 */
declare function performScriptWithOption(script: string, param: string, option: number): void;

/**
 * replacement for FileMaker.PerformScript
 */
declare function performScript(script: string, param: string): void;

/**
 * register a FM script name and the function to call instead when that script
 * is called via FileMaker.PerformScript
 * @param scriptName - FM script name
 * @param functionToCall - JS function to call instead
 * @param functionToCall.param - param you'd pass to FileMaker
 */
declare function mockScript(scriptName: string, functionToCall: {
    param: string;
}): void;

