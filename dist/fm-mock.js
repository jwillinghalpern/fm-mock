!function(o,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.FMMock=e():o.FMMock=e()}(this,(function(){return function(){"use strict";var o={d:function(e,t){for(var r in t)o.o(t,r)&&!o.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},o:function(o,e){return Object.prototype.hasOwnProperty.call(o,e)},r:function(o){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(o,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(o,"__esModule",{value:!0})}},e={};function t(o){return(t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o})(o)}o.r(e),o.d(e,{mockScript:function(){return n}});var r=function(o,e,t){var r=window.FileMaker.mockedScripts[o.toLowerCase()];if(void 0===r)throw new Error("The script '".concat(o,"' is not registered."));r(e,t)},n=function(o,e){if("function"!=typeof e)throw new Error("must pass in a real function");"object"===t(window.FileMaker)&&window.FileMaker.isMock||(window.FileMaker={isMock:!0,mockedScripts:{},PerformScriptWithOption:function(o,e,t){return r(o,e,t)},PerformScript:function(o,e){return function(o,e){r(o,e,0)}(o,e)}}),window.FileMaker.mockedScripts[o.toLowerCase()]=e};return e}()}));