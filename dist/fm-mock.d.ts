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
declare const mockScript: (scriptName: string, functionToCall: (param: string) => void) => void;
/**
 * Mocks a script intended to be called via FMGofer. If `resultFromFM` is a function(both async or sync work), it will be executed with the parameter passed to `FMGofer.PerformScript[WithOption]`, and the result will be returned by the mock script. The other types will be stringified and returned as-is, simulating the behavior of FileMaker's `Perform JavaScript In Web Viewer` step, which always passes function parameters as strings.
 *
 * @param scriptName - The name of the FM script to mock.
 * @param resultFromFM - The result FM will return. This can be an object, array, number, string, or a function that accepts a single parameter and returns a result.
 * @param options - Optional configuration options for the mock script.
 * @param options.delay - The delay (in milliseconds) before executing the callback function. Defaults to 0. Use to simulate slow FM scripts.
 * @param options.returnError - If true, the FMGofer.PerformScript[WithOption] call will reject instead of resolve.
 * @param options.logParams - Specifies whether to log the parameters that will be received by FM.
 */
declare const mockGoferScript: (scriptName: string, resultFromFM: Record<string, unknown> | any[] | number | string | ResultFunction | AsyncResultFunction, options?: {
    delay?: number | undefined;
    returnError?: boolean | undefined;
    logParams?: boolean | undefined;
} | undefined) => void;
declare type ResultFunction = (parameter: string) => string | number | Record<string, unknown> | void;
declare type AsyncResultFunction = (...args: Parameters<ResultFunction>) => Promise<ReturnType<ResultFunction>>;
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
export { mockScript, mockGoferScript };
