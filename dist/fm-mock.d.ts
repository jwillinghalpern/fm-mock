/**
 * replacement for FileMaker.PerformScriptWithOption
 * @function
 * @private
 *
 * @param {string} script
 * @param {string} param
 * @param {number} option
 */
declare const performScriptWithOption: (script: string, param?: any, option?: ScriptOption | undefined) => void;
/**
 * replacement for FileMaker.PerformScript
 * @function
 * @private
 *
 * @param {string} script
 * @param {string} param
 */
declare const performScript: (script: string, param?: any) => void;
/**
 * register a FM script name and the function to call instead when that script
 * is called via FileMaker.PerformScript
 * @function
 *
 * @param {string} scriptName FM script name
 * @param {function} functionToCall JS function to call instead
 * @param {string} functionToCall.param param you'd pass to FileMaker
 */
declare const mockScript: (scriptName: string, functionToCall: Function) => void;
export { mockScript };
declare type ScriptOption = 0 | 1 | 2 | 3 | 4 | 5 | '0' | '1' | '2' | '3' | '4' | '5';
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
