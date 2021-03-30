/* eslint-disable no-undef */
import { assert } from 'chai';
import { mockScript } from '../src/fm-mock';

const scriptName = 'My Script';
const scriptNameLowerCase = scriptName.toLowerCase();
const fn = () => 'hello world';
mockScript('My Script', fn);

describe('mock window.FileMaker', () => {
  it('isMock should be true', () => {
    assert.isTrue(window.FileMaker.isMock, 'isMock not true');
  });
  it('mockedScripts should be an object', () => {
    assert.isObject(window.FileMaker.mockedScripts);
  });
  it('PerformScirpt should be a function', () => {
    assert.isFunction(window.FileMaker.PerformScript);
  });
  it('PerformScriptWithOption should be a function', () => {
    assert.isFunction(window.FileMaker.PerformScriptWithOption);
  });
});
describe('mockScript', () => {
  it('should add a script to window.FileMaker.mockedScripts', () => {
    assert.strictEqual(
      window.FileMaker.mockedScripts[scriptNameLowerCase],
      fn,
      "function didn't match"
    );
    assert.strictEqual(
      // fm-mock lowercases script names to make case-insensitive
      window.FileMaker.mockedScripts[scriptNameLowerCase](),
      fn(),
      "fn output didn't match"
    );
  });
});
describe('window.FileMaker.PerformScript', () => {
  it('should return undefined, regardless of mock fn return', () => {
    assert.isUndefined(window.FileMaker.PerformScript(scriptName));
  });
});
