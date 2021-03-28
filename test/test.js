/* eslint-disable no-undef */
import { assert } from 'chai';
import { applyMock, registerScript } from '../src/fm-mock';

applyMock();
const scriptName = 'My Script';
const fn = () => 'hello world';
registerScript('My Script', fn);

describe('mock window.FileMaker', () => {
  it('isMock should be true', () => {
    assert.isTrue(window.FileMaker.isMock, 'isMock not true');
  });
  it('registeredScripts should be an object', () => {
    assert.isObject(window.FileMaker.registeredScripts);
  });
  it('PerformScirpt should be a function', () => {
    assert.isFunction(window.FileMaker.PerformScript);
  });
  it('PerformScriptWithOption should be a function', () => {
    assert.isFunction(window.FileMaker.PerformScriptWithOption);
  });
});
describe('registerScript', () => {
  it('should add a script to window.FileMaker.registeredScripts', () => {
    assert.strictEqual(
      window.FileMaker.registeredScripts[scriptName],
      fn,
      "function didn't match"
    );
    assert.strictEqual(
      window.FileMaker.registeredScripts[scriptName](),
      fn(),
      "fn output didn't match"
    );
  });
});
describe('window.FileMaker.PerformScript', () => {
  it('should call the mock script', () => {
    assert.strictEqual(
      window.FileMaker.PerformScript(scriptName),
      // fmMock.performScriptWithOption(scriptName),
      fn(),
      'function did not return same result'
    );
  });
});
