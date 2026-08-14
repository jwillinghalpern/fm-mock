import FMGofer from 'fm-gofer';
import { mockGoferScript, mockScript, restoreMocks } from '../src/fm-mock';

// store originals to make restoring them easier later.
const windowFileMaker = window.FileMaker;
const restoreWindowFileMaker = () => {
  window.FileMaker = windowFileMaker;
};

const deleteWindowFileMaker = () => {
  // @ts-expect-error removing the global is exactly what we're simulating
  delete window.FileMaker;
};

describe('mocking window.FileMaker', () => {
  beforeEach(() => {
    deleteWindowFileMaker();
  });
  afterEach(() => {
    restoreWindowFileMaker();
  });

  it('should add isMock and mockedScripts props', () => {
    mockScript('my script', () => {});
    expect(window.FileMaker.isMock).toBe(true);
    expect(typeof window.FileMaker.mockedScripts).toBe('object');
    expect(typeof window.FileMaker.PerformScript).toBe('function');
    expect(typeof window.FileMaker.PerformScriptWithOption).toBe('function');
  });

  it('should stash the original window.FileMaker when it is not a mock', () => {
    const original = { hello: 123 };
    // @ts-expect-error partial FileMaker object, only used for identity
    window.FileMaker = original;
    mockScript('my script', () => {});
    expect(window.FileMaker.isMock).toBe(true);
    expect(window.FileMaker.originalFileMaker).toBe(original);
  });

  it('should exit early if already mocked', () => {
    const sentinel = { hello: 123 };
    window.FileMaker = {
      ...window.FileMaker,
      isMock: true,
      mockedScripts: {},
      originalFileMaker: sentinel,
    };
    mockScript('my script', () => {});
    // had it re-mocked, originalFileMaker would now point at the previous mock
    expect(window.FileMaker.originalFileMaker).toBe(sentinel);
  });

  it('should route PerformScript to the mocked script', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    mockScript('My Script', spy);
    window.FileMaker.PerformScript('My Script', 'my param');
    vi.runAllTimers();
    expect(spy).toHaveBeenCalledWith('my param');
    vi.useRealTimers();
  });

  it('should route PerformScriptWithOption to the mocked script', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    mockScript('My Script', spy);
    window.FileMaker.PerformScriptWithOption('My Script', 'my param', 3);
    vi.runAllTimers();
    expect(spy).toHaveBeenCalledWith('my param');
    vi.useRealTimers();
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
    deleteWindowFileMaker();
    mockScript('my script', () => {});
    expect(window.FileMaker.isMock).toBe(true);
  });

  it('should store functions keyed by script name in mockedScripts', () => {
    const spy = vi.fn();
    const myScript = 'My Script';
    mockScript(myScript, spy);
    // the function will be wrapped, so check that it's stored by calling it, rather than via .toBe()
    window.FileMaker.mockedScripts[myScript.toLowerCase()]('my param');
    expect(spy).toHaveBeenCalledWith('my param');
  });

  it('should log the parameters if that option is set', () => {
    // the mocked FileMaker.PerformScript runs setTimeout with 1ms delay, so must run timers to completion to test
    vi.useFakeTimers();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const spy = vi.fn();
    mockScript('my script', spy, { logParams: true });
    window.FileMaker.PerformScript('my script', 'hello world');
    vi.runAllTimers();
    expect(spy).toHaveBeenCalledWith('hello world');
    expect(consoleSpy).toHaveBeenCalledWith('param:', 'hello world');
    consoleSpy.mockRestore();
    vi.useRealTimers();
  });

  it('should delay the function if that option is set', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const options = { delay: 1000 };
    mockScript('my script', spy, options);
    window.FileMaker.PerformScript('my script');
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1001);
    expect(spy).toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('mockGoferScript', () => {
  afterEach(() => {
    restoreWindowFileMaker();
  });

  it('should return a string', async () => {
    mockGoferScript('My Script', { resultFromFM: 'hello world' });
    await expect(FMGofer.PerformScript('My Script')).resolves.toBe(
      'hello world',
    );
  });
  it('should return a number as string', async () => {
    mockGoferScript('My Script', { resultFromFM: 42 });
    await expect(FMGofer.PerformScript('My Script')).resolves.toBe('42');
  });
  it('should return an object stringified', async () => {
    mockGoferScript('My Script', { resultFromFM: { hello: 'world' } });
    await expect(FMGofer.PerformScript('My Script')).resolves.toBe(
      '{"hello":"world"}',
    );
  });
  it('should return an array stringified', async () => {
    mockGoferScript('My Script', { resultFromFM: [1, 2, 3] });
    await expect(FMGofer.PerformScript('My Script')).resolves.toBe('[1,2,3]');
  });
  it('should return no result and still resolve', async () => {
    mockGoferScript('My Script');
    await expect(FMGofer.PerformScript('My Script')).resolves.toBeUndefined();
  });
  it('should run a synchronous function to produce result', async () => {
    const spy = vi.fn().mockReturnValue('hello world');
    mockGoferScript('My Script', { resultFromFM: spy });
    await expect(FMGofer.PerformScript('My Script')).resolves.toBe(
      'hello world',
    );
  });
  it('should run an asynchronous function to produce result', async () => {
    const spy = vi.fn().mockResolvedValue('hello world');
    mockGoferScript('My Script', { resultFromFM: spy });
    await expect(FMGofer.PerformScript('My Script')).resolves.toBe(
      'hello world',
    );
  });
  it('should support dynamic importing files, and json should be returned stringified', async () => {
    mockGoferScript('My Script', { resultFromFM: () => import('./mock.json') });
    const imported = JSON.stringify(await import('./mock.json'));
    await expect(FMGofer.PerformScript('My Script')).resolves.toBe(imported);
  });
  it('should honor options.delay', async () => {
    vi.useFakeTimers();
    const spy = vi.fn().mockReturnValue('hello world');
    mockGoferScript('My Script', {
      resultFromFM: spy,
      delay: 1000,
    });
    const prom = FMGofer.PerformScript('My Script');
    expect(spy).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(500);
    expect(spy).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(503);
    expect(spy).toHaveBeenCalled();
    const res = await prom;
    expect(res).toBe('hello world');
    vi.useRealTimers();
  });
  it('should honor options.logParams', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockGoferScript('My Script', {
      resultFromFM: 'hello world',
      logParams: true,
    });
    await FMGofer.PerformScript('My Script', 'hello world');
    expect(consoleSpy).toHaveBeenCalledTimes(3);
    consoleSpy.mockRestore();
  });
  it('should return error when options.returnError', async () => {
    mockGoferScript('My Script', {
      resultFromFM: 'sorry bucko',
      returnError: true,
    });
    await expect(FMGofer.PerformScript('My Script')).rejects.toBe(
      'sorry bucko',
    );
  });

  it('should reject if resultFromFM throws', async () => {
    mockGoferScript('My Script', {
      resultFromFM: () => {
        throw 'sorry bucko';
      },
    });
    await expect(FMGofer.PerformScript('My Script')).rejects.toBe(
      'sorry bucko',
    );
  });

  it('should reject and stringify result', async () => {
    mockGoferScript('My Script', {
      resultFromFM: () => {
        throw 123;
      },
    });
    await expect(FMGofer.PerformScript('My Script')).rejects.toBe('123');
  });

  it('should reject if resultFromFM throws an Error object and return Error.message', async () => {
    mockGoferScript('My Script', {
      resultFromFM: () => {
        throw new Error('sorry bucko');
      },
    });
    await expect(FMGofer.PerformScript('My Script')).rejects.toBe(
      'sorry bucko',
    );
  });
});

describe('restoreMocks', () => {
  let fmBefore: typeof window.FileMaker;
  beforeEach(() => {
    // @ts-expect-error because I just need to do a referential equality check
    window.FileMaker = { hello: 123 };
    fmBefore = window.FileMaker;
  });
  afterEach(() => {
    restoreWindowFileMaker();
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

describe('PerformScript', () => {
  afterEach(() => {
    restoreWindowFileMaker();
    vi.useRealTimers();
  });

  it('should use default option 0', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    // register through the public API, then swap in a bare spy so we can
    // observe the option argument that mockScript's wrapper discards
    mockScript('My Script', () => {});
    window.FileMaker.mockedScripts['my script'] = spy;
    window.FileMaker.PerformScript('My Script', 'My Param');
    vi.runAllTimers();
    expect(spy).toHaveBeenCalledWith('My Param', 0);
  });
});

describe('PerformScriptWithOption', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    deleteWindowFileMaker();
    // seed a mock so window.FileMaker exists, then drive mockedScripts directly
    mockScript('placeholder', () => {});
  });

  afterEach(() => {
    restoreWindowFileMaker();
    vi.useRealTimers();
  });

  it('should call script with param and option', () => {
    const spy = vi.fn();
    window.FileMaker.mockedScripts['script name'] = spy;
    const param = 'my param';
    const option = 3;
    window.FileMaker.PerformScriptWithOption('script name', param, option);
    vi.runAllTimers();
    expect(spy).toHaveBeenCalledWith(param, option);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should ignore case in script name', () => {
    const spy = vi.fn();
    window.FileMaker.mockedScripts['script name'] = spy;
    window.FileMaker.PerformScriptWithOption('SCRIPT NAME');
    vi.runAllTimers();
    expect(spy).toHaveBeenCalled();
  });

  it('should throw error if script undefined', () => {
    window.FileMaker.mockedScripts['different name'] = () => {};
    vi.runAllTimers();
    expect(() =>
      window.FileMaker.PerformScriptWithOption('wrong name', 'param', 0),
    ).toThrow();
  });
});
