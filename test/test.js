/* eslint-disable no-undef */
import { assert } from 'chai';
import FMMock from '../src/fm-mock';

const fmMock = new FMMock();
const scriptName = 'My Script';
const res = 'hello world';
const fn = () => res;
fmMock.registerScript('My Script', fn);

describe('FMMock', () => {
  describe('constructor', () => {
    it('should return an object with fmScripts obj', () => {
      assert.hasAllKeys(fmMock, ['fmScripts'], 'missing some keys');
    });
  });
  describe('registerScripts', () => {
    it('should add a script to fmScripts', () => {
      assert.strictEqual(
        fmMock.fmScripts[scriptName],
        fn,
        "function didn't match"
      );
      assert.strictEqual(
        fmMock.fmScripts[scriptName](),
        fn(),
        "output didn't match"
      );
    });
  });
  describe('window.FileMaker.PerformScript', () => {
    it('should call the mock script', () => {
      assert.strictEqual(
        window.FileMaker.PerformScript(scriptName),
        fmMock.performScriptWithOption(scriptName),
        'function did not return same result'
      );
    });
  });
});
