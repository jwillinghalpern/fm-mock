/* eslint-disable no-unused-expressions */
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import FMMock, { mockScript } from '../src/fm-mock';

const { describe, it, beforeEach, after } = require('mocha');

const { __get__, __set__ } = FMMock;
const { expect } = chai;
chai.use(sinonChai);

// store originals to make restoring them easier later.
const performScriptWithOption = __get__('performScriptWithOption');
const performScript = __get__('performScript');
const fmIsMock = __get__('fmIsMock');
const mockFileMaker = __get__('mockFileMaker');

// create a virtual window
global.window = {};

const fn = () => 'hello world';
mockScript('My Script', fn);

describe('fmIsMock', () => {
  it('should return false if window.FileMaker not object', () => {
    delete window.FileMaker;
    expect(fmIsMock()).to.be.false;
  });
  it('should return true when mock', () => {
    window.FileMaker = { isMock: true };
    expect(fmIsMock()).to.be.true;
  });
  it('should return false when not mocked', () => {
    window.FileMaker = {};
    expect(fmIsMock()).to.be.false;
  });
});

describe('mockFileMaker', () => {
  beforeEach(() => {
    delete window.FileMaker;
  });

  after(() => {
    __set__('fmIsMock', fmIsMock);
  });

  it('should exit early if already mocked', () => {
    const fake = sinon.fake.returns(true);
    __set__('fmIsMock', fake);
    mockFileMaker();
    expect(fake).to.have.been.calledOnce;
    expect(window.FileMaker).to.be.undefined;
  });

  it('should add isMock and mockedScripts props', () => {
    const fake = sinon.fake.returns(false);
    __set__('fmIsMock', fake);
    mockFileMaker();
    const keys = [
      'isMock',
      'mockedScripts',
      'PerformScript',
      'PerformScriptWithOption',
    ];
    expect(window.FileMaker).to.have.keys(keys);
    expect(window.FileMaker.isMock).to.be.true;
    expect(window.FileMaker.mockedScripts).to.be.an('object');
    expect(window.FileMaker.PerformScript).to.be.a('function');
    expect(window.FileMaker.PerformScriptWithOption).to.be.a('function');
  });

  it('should replace PerformScript and PerformScriptWithOption', () => {
    const fake = sinon.fake.returns(false);
    __set__('fmIsMock', fake);
    const psSpy = sinon.spy();
    const pswoSpy = sinon.spy();
    __set__('performScript', psSpy);
    __set__('performScriptWithOption', pswoSpy);
    mockFileMaker();
    const myScript = 'my script';
    const myParam = 'my param';
    const myOption = 3;
    // call scripts and check if spies were called
    window.FileMaker.PerformScript(myScript, myParam);
    window.FileMaker.PerformScriptWithOption(myScript, myParam, myOption);
    expect(psSpy).to.have.been.calledOnceWith(myScript, myParam);
    expect(pswoSpy).to.have.been.calledOnceWith(myScript, myParam, myOption);
    __set__('performScript', performScript);
    __set__('performScriptWithOption', performScriptWithOption);
  });
});

describe('mockScript', () => {
  it("should throw an error if function isn't a function", () => {
    expect(() => mockScript('my script', 'not a function')).to.throw(Error);
  });
  it('should mock FileMaker if not already mocked', () => {
    window.FileMaker = { mockedScripts: {} };
    const spy = sinon.spy();
    __set__('mockFileMaker', spy);
    mockScript('my script', () => {});
    expect(spy).to.have.been.calledOnce;
    __set__('mockFileMaker', mockFileMaker);
  });
  it('should store functions keyed by script name in mockedScripts', () => {
    window.FileMaker = { isMock: true, mockedScripts: {} };
    __set__('mockFileMaker', sinon.fake.returns(undefined));
    const spy = sinon.spy();
    const myScript = 'My Script';
    // fm-mock stores scripts as lowercase to make them case-insensitive like FM
    const myScriptLower = myScript.toLowerCase();
    mockScript(myScript, spy);
    expect(window.FileMaker.mockedScripts[myScriptLower]).to.equal(spy);
    window.FileMaker.mockedScripts[myScriptLower]();
    expect(spy).to.have.been.calledOnce;
    __set__('mockFileMaker', mockFileMaker);
  });
});

describe('performScript', () => {
  it('should use default option 0', () => {
    const spy = sinon.spy();
    const script = 'My Script';
    const param = 'My Param';
    const option = 0;
    __set__('performScriptWithOption', spy);
    performScript(script, param);
    expect(spy).to.have.been.calledOnceWith(script, param, option);
    __set__('performScriptWithOption', performScriptWithOption);
  });
});

describe('performScriptWithOption', () => {
  it('should call script with param and option', () => {
    const spy = sinon.spy();
    window.FileMaker = { mockedScripts: { 'script name': spy } };
    const param = 'my param';
    const option = 3;
    performScriptWithOption('script name', param, option);
    expect(spy).to.have.been.calledOnceWith(param, option);
  });
  it('should ignore case in script name', () => {
    const spy = sinon.spy();
    window.FileMaker = { mockedScripts: { 'script name': spy } };
    performScriptWithOption('SCRIPT NAME');
    expect(spy).to.have.been.calledOnce;
  });
  it('should throw error if script undefined', () => {
    window.FileMaker = { mockedScripts: { 'different name': () => {} } };
    expect(() => performScriptWithOption('wrong name', 'param', 0)).to.throw(
      Error
    );
  });
});
