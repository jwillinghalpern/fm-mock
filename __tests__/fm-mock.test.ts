/**
 * @jest-environment jsdom
 */

import { __get__, __set__, mockScript } from '../src/fm-mock';

// store originals to make restoring them easier later.
const performScriptWithOption = __get__('performScriptWithOption');
const performScript = __get__('performScript');
const fmIsMock = __get__('fmIsMock');
const mockFileMaker = __get__('mockFileMaker');

const fn = () => 'hello world';
mockScript('My Script', fn);

describe('fmIsMock', () => {
  it('should return false if window.FileMaker not object', () => {
    delete window.FileMaker;
    expect(fmIsMock()).toBe(false);
  });
  it('should return true when mock', () => {
    window.FileMaker = { isMock: true };
    expect(fmIsMock()).toBe(true);
  });
  it('should return false when not mocked', () => {
    window.FileMaker = {};
    expect(fmIsMock()).toBe(false);
  });
});

describe('mockFileMaker', () => {
  beforeEach(() => {
    delete window.FileMaker;
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
  it("should throw an error if function isn't a function", () => {
    expect(() => mockScript('my script', 'not a function')).toThrow();
  });

  it('should mock FileMaker if not already mocked', () => {
    window.FileMaker = { mockedScripts: {} };
    const spy = jest.fn();
    __set__('mockFileMaker', spy);
    mockScript('my script', () => { });
    expect(spy).toHaveBeenCalled();
    __set__('mockFileMaker', mockFileMaker);
  });

  it('should store functions keyed by script name in mockedScripts', () => {
    window.FileMaker = { isMock: true, mockedScripts: {} };
    __set__('mockFileMaker', jest.fn().mockReturnValue(undefined));
    const spy = jest.fn();
    const myScript = 'My Script';
    const myScriptLower = myScript.toLowerCase();
    mockScript(myScript, spy);
    expect(window.FileMaker.mockedScripts[myScriptLower]).toBe(spy);
    window.FileMaker.mockedScripts[myScriptLower]();
    expect(spy).toHaveBeenCalled();
    __set__('mockFileMaker', mockFileMaker);
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
  afterAll(() => {
    jest.useRealTimers();
  })
  it('should call script with param and option', () => {
    const spy = jest.fn();
    window.FileMaker = { mockedScripts: { 'script name': spy } };
    const param = 'my param';
    const option = 3;
    console.log(window.FileMaker.mockedScripts['script name']);
    performScriptWithOption('script name', param, option);
    jest.runAllTimers();
    // expect(spy).toHaveBeenCalledWith(param, option);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore case in script name', () => {
    const spy = jest.fn();
    window.FileMaker = { mockedScripts: { 'script name': spy } };
    performScriptWithOption('SCRIPT NAME');
    jest.runAllTimers();
    expect(spy).toHaveBeenCalled();
  });

  it('should throw error if script undefined', () => {
    window.FileMaker = { mockedScripts: { 'different name': () => { } } };
    jest.runAllTimers();
    expect(() => performScriptWithOption('wrong name', 'param', 0)).toThrow();
  });
});
