!function(e,o){"object"==typeof exports&&"object"==typeof module?module.exports=o():"function"==typeof define&&define.amd?define([],o):"object"==typeof exports?exports.FMMock=o():e.FMMock=o()}(this,(function(){return function(){"use strict";var e={d:function(o,t){for(var r in t)e.o(t,r)&&!e.o(o,r)&&Object.defineProperty(o,r,{enumerable:!0,get:t[r]})},o:function(e,o){return Object.prototype.hasOwnProperty.call(e,o)},r:function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},o={};e.r(o),e.d(o,{mockScript:function(){return r}});var t=function(e,o,t){var r,n,i=null===(n=null===(r=window.FileMaker)||void 0===r?void 0:r.mockedScripts)||void 0===n?void 0:n[e.toLowerCase()];if(void 0===i)throw new Error("The script '".concat(e,"' is not registered."));setTimeout((function(){i(o,t)}),1)},r=function(e,o){if("function"!=typeof o)throw new Error("must pass in a real function");"object"==typeof window.FileMaker&&window.FileMaker.isMock||(window.FileMaker={isMock:!0,mockedScripts:{},PerformScriptWithOption:function(e,o,r){return t(e,o,r)},PerformScript:function(e,o){return function(e,o){t(e,o,0)}(e,o)}}),window.FileMaker.mockedScripts[e.toLowerCase()]=o};return o}()}));