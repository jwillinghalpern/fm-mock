!function(e,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports.FMMock=n():e.FMMock=n()}(this,(function(){return function(){"use strict";var e={d:function(n,o){for(var r in o)e.o(o,r)&&!e.o(n,r)&&Object.defineProperty(n,r,{enumerable:!0,get:o[r]})},o:function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},r:function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},n={};e.r(n),e.d(n,{mockGoferScript:function(){return i},mockScript:function(){return t},restoreMocks:function(){return r}});var o=function(e,n,o){var r,t,i=null===(t=null===(r=window.FileMaker)||void 0===r?void 0:r.mockedScripts)||void 0===t?void 0:t[e.toLowerCase()];if(void 0===i)throw new Error("The script '".concat(e,"' is not registered."));setTimeout((function(){i(n,o)}),1)},r=function(){window.FileMaker.isMock&&(window.FileMaker=window.FileMaker.originalFileMaker)},t=function(e,n,r){if("function"!=typeof n)throw new Error("must pass in a real function");!function(){if("object"!=typeof window.FileMaker||!window.FileMaker.isMock){var e=window.FileMaker;window.FileMaker={originalFileMaker:e,isMock:!0,mockedScripts:{},PerformScriptWithOption:function(e,n,r){return o(e,n,r)},PerformScript:function(e,n){return function(e,n){o(e,n,0)}(e,n)}}}}(),window.FileMaker.mockedScripts[e.toLowerCase()]=function(e){var o=function(){(null==r?void 0:r.logParams)&&console.log("param:",e),n(e)};(null==r?void 0:r.delay)?setTimeout(o,r.delay):o()}},i=function(e,n){t(e,(function(e){var o,r,t,i,c=JSON.parse(e),a=c.callbackName,l=c.promiseID,u=c.parameter;(null==n?void 0:n.logParams)&&(console.log("callbackName:",a),console.log("promiseID:",l),console.log("parameter:",u)),o=void 0,r=void 0,i=function(){var e,o,r,t,i;return function(e,n){var o,r,t,i,c={label:0,sent:function(){if(1&t[0])throw t[1];return t[1]},trys:[],ops:[]};return i={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function a(i){return function(a){return function(i){if(o)throw new TypeError("Generator is already executing.");for(;c;)try{if(o=1,r&&(t=2&i[0]?r.return:i[0]?r.throw||((t=r.return)&&t.call(r),0):r.next)&&!(t=t.call(r,i[1])).done)return t;switch(r=0,t&&(i=[2&i[0],t.value]),i[0]){case 0:case 1:t=i;break;case 4:return c.label++,{value:i[1],done:!1};case 5:c.label++,r=i[1],i=[0];continue;case 7:i=c.ops.pop(),c.trys.pop();continue;default:if(!((t=(t=c.trys).length>0&&t[t.length-1])||6!==i[0]&&2!==i[0])){c=0;continue}if(3===i[0]&&(!t||i[1]>t[0]&&i[1]<t[3])){c.label=i[1];break}if(6===i[0]&&c.label<t[1]){c.label=t[1],t=i;break}if(t&&c.label<t[2]){c.label=t[2],c.ops.push(i);break}t[2]&&c.ops.pop(),c.trys.pop();continue}i=n.call(e,c)}catch(e){i=[6,e],r=0}finally{o=t=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,a])}}}(this,(function(c){switch(c.label){case 0:e=null==n?void 0:n.resultFromFM,r=(null==n?void 0:n.returnError)||!1,c.label=1;case 1:return c.trys.push([1,5,,6]),"function"!=typeof e?[3,3]:[4,e(u)];case 2:return t=c.sent(),[3,4];case 3:t=e,c.label=4;case 4:return o=t,[3,6];case 5:return i=c.sent(),r=!0,o=i instanceof Error?i.message:i,[3,6];case 6:return["object","number"].includes(typeof o)&&(o=JSON.stringify(o)),window[a](l,o,r),[2]}}))},new((t=void 0)||(t=Promise))((function(e,n){function c(e){try{l(i.next(e))}catch(e){n(e)}}function a(e){try{l(i.throw(e))}catch(e){n(e)}}function l(n){var o;n.done?e(n.value):(o=n.value,o instanceof t?o:new t((function(e){e(o)}))).then(c,a)}l((i=i.apply(o,r||[])).next())}))}),{delay:null==n?void 0:n.delay})};return n}()}));