/**
 * @jest-environment jsdom
 */

import 'regenerator-runtime/runtime';
import {
  // @ts-ignore
  __get__,
  // @ts-ignore
  __set__,
  mockGoferScript,
  mockScript,
  restoreMocks,
} from '../src/fm-mock';
import FMGofer from 'fm-gofer';

// store originals to make restoring them easier later.
const windowFileMaker = window.FileMaker;
const restoreWindowFileMaker = () => {
  window.FileMaker = windowFileMaker;
};

const performScriptWithOption = __get__('performScriptWithOption');
const performScript = __get__('performScript');
const fmIsMock = __get__('fmIsMock');
const mockFileMaker = __get__('mockFileMaker');

const fn = () => 'hello world';
mockScript('My Script', fn);

describe('fmIsMock', () => {
  afterEach(() => {
    restoreWindowFileMaker();
  });
  it('should return false if window.FileMaker not object', () => {
    // @ts-ignore
    delete window.FileMaker;
    expect(fmIsMock()).toBe(false);
  });
  it('should return true when mock', () => {
    window.FileMaker = { ...window.FileMaker, isMock: true };
    expect(fmIsMock()).toBe(true);
  });
  it('should return false when not mocked', () => {
    // @ts-ignore
    window.FileMaker = {};
    expect(fmIsMock()).toBe(false);
  });
});

describe('mockFileMaker', () => {
  beforeEach(() => {
    // @ts-ignore
    delete window.FileMaker;
  });
  afterEach(() => {
    restoreWindowFileMaker();
  });

  afterAll(() => {
    __set__('fmIsMock', fmIsMock);
  });

  it('should exit early if already mocked', () => {
    const fake = jest.fn().mockReturnValue(true);
    __set__('fmIsMock', fake);
    mockFileMaker();
    expect(fake).toHaveBeenCalledTimes(1);
    expect(window.FileMaker).toBeUndefined();
  });

  it('should add isMock and mockedScripts props', () => {
    const fake = jest.fn().mockReturnValue(false);
    __set__('fmIsMock', fake);
    mockFileMaker();
    expect(window.FileMaker.isMock).toBe(true);
    expect(typeof window.FileMaker.mockedScripts).toBe('object');
    expect(typeof window.FileMaker.PerformScript).toBe('function');
    expect(typeof window.FileMaker.PerformScriptWithOption).toBe('function');
  });

  it('should replace PerformScript and PerformScriptWithOption', () => {
    const fmIsMockFake = jest.fn().mockReturnValue(false);
    __set__('fmIsMock', fmIsMockFake);
    const psSpy = jest.fn();
    const pswoSpy = jest.fn();
    __set__('performScript', psSpy);
    __set__('performScriptWithOption', pswoSpy);
    mockFileMaker();
    const myScript = 'my script';
    const myParam = 'my param';
    const myOption = 3;
    window.FileMaker.PerformScript(myScript, myParam);
    window.FileMaker.PerformScriptWithOption(myScript, myParam, myOption);
    expect(psSpy).toHaveBeenCalledWith(myScript, myParam);
    expect(pswoSpy).toHaveBeenCalledWith(myScript, myParam, myOption);
    __set__('performScript', performScript);
    __set__('performScriptWithOption', performScriptWithOption);
  });
});

describe('mockScript', () => {
  afterEach(() => {
    restoreWindowFileMaker();
  });

  it('should throw an error if function is not provided', () => {
    // @ts-expect-error testing invalid second param
    expect(() => mockScript('my script')).toThrow();
  });

  it("should throw an error if function isn't a function", () => {
    // @ts-expect-error testing invalid second param
    expect(() => mockScript('my script', 'not a function')).toThrow();
  });

  it('should mock FileMaker if not already mocked', () => {
    // @ts-ignore
    window.FileMaker = { mockedScripts: {} };
    const spy = jest.fn();
    __set__('mockFileMaker', spy);
    mockScript('my script', () => {});
    expect(spy).toHaveBeenCalled();
    __set__('mockFileMaker', mockFileMaker);
  });

  it('should store functions keyed by script name in mockedScripts', () => {
    // @ts-ignore
    window.FileMaker = { isMock: true, mockedScripts: {} };
    __set__('mockFileMaker', jest.fn().mockReturnValue(undefined));
    const spy = jest.fn();
    const myScript = 'My Script';
    const myScriptLower = myScript.toLowerCase();
    mockScript(myScript, spy);
    // the function will be wrapped, so check that it's stored by calling it, rather than via .toBe()
    window.FileMaker.mockedScripts[myScriptLower]();
    expect(spy).toHaveBeenCalled();
    __set__('mockFileMaker', mockFileMaker);
  });

  it('should log the parameters if that option is set', () => {
    // the mocked FileMaker.PerformScript runs setTimeout with 1ms delay, so must run timers to completion to test
    jest.useFakeTimers();
    const consoleSpy = jest.spyOn(console, 'log');
    const spy = jest.fn();
    mockScript('my script', spy, { logParams: true });
    window.FileMaker.PerformScript('my script', 'hello world');
    jest.runAllTimers();
    expect(spy).toHaveBeenCalledWith('hello world');
    expect(consoleSpy).toHaveBeenCalledWith('param:', 'hello world');
    consoleSpy.mockRestore();
    jest.useRealTimers();
  });

  it('should delay the function if that option is set', () => {
    jest.useFakeTimers();
    const spy = jest.fn();
    const options = { delay: 1000 };
    mockScript('my script', spy, options);
    window.FileMaker.PerformScript('my script');
    expect(spy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1001);
    expect(spy).toHaveBeenCalled();
    jest.useRealTimers();
  });
});

describe('mockGoferScript', () => {
  afterEach(() => {
    restoreWindowFileMaker();
  });

  it('should return a string', () => {
    mockGoferScript('My Script', { resultFromFM: 'hello world' });
    expect(FMGofer.PerformScript('My Script')).resolves.toBe('hello world');
  });
  it('should return a number as string', () => {
    mockGoferScript('My Script', { resultFromFM: 42 });
    expect(FMGofer.PerformScript('My Script')).resolves.toBe('42');
  });
  it('should return an object stringified', () => {
    mockGoferScript('My Script', { resultFromFM: { hello: 'world' } });
    expect(FMGofer.PerformScript('My Script')).resolves.toBe(
      '{"hello":"world"}'
    );
  });
  it('should return an array stringified', () => {
    mockGoferScript('My Script', { resultFromFM: [1, 2, 3] });
    expect(FMGofer.PerformScript('My Script')).resolves.toBe('[1,2,3]');
  });
  it('should return no result and still resolve', () => {
    mockGoferScript('My Script');
    expect(FMGofer.PerformScript('My Script')).resolves.toBeUndefined();
  });
  it('should run a synchronous function to produce result', () => {
    const spy = jest.fn().mockReturnValue('hello world');
    mockGoferScript('My Script', { resultFromFM: spy });
    expect(FMGofer.PerformScript('My Script')).resolves.toBe('hello world');
  });
  it('should run an asynchronous function to produce result', () => {
    const spy = jest.fn().mockResolvedValue('hello world');
    mockGoferScript('My Script', { resultFromFM: spy });
    expect(FMGofer.PerformScript('My Script')).resolves.toBe('hello world');
  });
  it('should support dynamic importing files, and json should be returned stringified', async () => {
    mockGoferScript('My Script', { resultFromFM: () => import('./mock.json') });
    const imported = JSON.stringify(await import('./mock.json'));
    expect(FMGofer.PerformScript('My Script')).resolves.toBe(imported);
  });
  it('should honor options.delay', async () => {
    jest.useFakeTimers();
    const spy = jest.fn().mockReturnValue('hello world');
    mockGoferScript('My Script', {
      resultFromFM: spy,
      delay: 1000,
    });
    const prom = FMGofer.PerformScript('My Script');
    expect(spy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(500);
    expect(spy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(503);
    expect(spy).toHaveBeenCalled();
    const res = await prom;
    expect(res).toBe('hello world');
    jest.useRealTimers();
  });
  it('should honor options.logParams', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    mockGoferScript('My Script', {
      resultFromFM: 'hello world',
      logParams: true,
    });
    await FMGofer.PerformScript('My Script', 'hello world');
    expect(consoleSpy).toHaveBeenCalledTimes(3);
    consoleSpy.mockRestore();
  });
  it('should return error when options.returnError', () => {
    mockGoferScript('My Script', {
      resultFromFM: 'sorry bucko',
      returnError: true,
    });
    expect(FMGofer.PerformScript('My Script')).rejects.toBe('sorry bucko');
  });

  it('should reject if resultFromFM throws', () => {
    mockGoferScript('My Script', {
      resultFromFM: () => {
        throw 'sorry bucko';
      },
    });
    const res = FMGofer.PerformScript('My Script');
    return expect(res).rejects.toBe('sorry bucko');
  });

  it('should reject and stringify result', () => {
    mockGoferScript('My Script', {
      resultFromFM: () => {
        throw 123;
      },
    });
    const res = FMGofer.PerformScript('My Script');
    return expect(res).rejects.toBe('123');
  });

  it('should reject if resultFromFM throws an Error object and return Error.message', () => {
    mockGoferScript('My Script', {
      resultFromFM: () => {
        throw new Error('sorry bucko');
      },
    });
    const res = FMGofer.PerformScript('My Script');
    return expect(res).rejects.toBe('sorry bucko');
  });
});

describe('restoreMocks', () => {
  let fmBefore: typeof window.FileMaker;
  beforeEach(() => {
    // @ts-expect-error because I just need to do a referential equality check
    window.FileMaker = { hello: 123 };
    fmBefore = window.FileMaker;
  });
  it('should do nothing if not mocked', () => {
    restoreMocks();
    expect(window.FileMaker).toEqual(fmBefore);
  });
  it('should restore window.FileMaker', () => {
    mockScript('My Script', () => {});
    expect(window.FileMaker).not.toEqual(fmBefore);
    restoreMocks();
    expect(window.FileMaker).toEqual(fmBefore);
  });
});

describe('performScript', () => {
  it('should use default option 0', () => {
    const spy = jest.fn();
    const script = 'My Script';
    const param = 'My Param';
    const option = 0;
    __set__('performScriptWithOption', spy);
    performScript(script, param);
    expect(spy).toHaveBeenCalledWith(script, param, option);
    __set__('performScriptWithOption', performScriptWithOption);
  });
});

describe('performScriptWithOption', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    restoreWindowFileMaker();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should call script with param and option', () => {
    const spy = jest.fn();
    window.FileMaker = {
      ...window.FileMaker,
      mockedScripts: { 'script name': spy },
    };
    const param = 'my param';
    const option = 3;
    performScriptWithOption('script name', param, option);
    jest.runAllTimers();
    expect(spy).toHaveBeenCalledWith(param, option);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore case in script name', () => {
    const spy = jest.fn();
    window.FileMaker = {
      ...window.FileMaker,
      mockedScripts: { 'script name': spy },
    };
    performScriptWithOption('SCRIPT NAME');
    jest.runAllTimers();
    expect(spy).toHaveBeenCalled();
  });

  it('should throw error if script undefined', () => {
    window.FileMaker = {
      ...window.FileMaker,
      mockedScripts: { 'different name': () => {} },
    };
    jest.runAllTimers();
    expect(() => performScriptWithOption('wrong name', 'param', 0)).toThrow();
  });
});
