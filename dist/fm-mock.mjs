var r={d:(t,i)=>{for(var e in i)r.o(i,e)&&!r.o(t,e)&&Object.defineProperty(t,e,{enumerable:!0,get:i[e]})},o:(r,t)=>Object.prototype.hasOwnProperty.call(r,t)},t={};r.d(t,{Z:()=>i});const i=class{constructor(){this.fmScripts={},this.enable()}enable(){"object"==typeof window.FileMaker&&window.FileMaker.isMock||(window.FileMaker={},window.FileMaker.isMock=!0,window.FileMaker.PerformScriptWithOption=(r,t,i)=>this.performScriptWithOption(r,t,i),window.FileMaker.PerformScript=(r,t)=>this.performScript(r,t))}registerScript(r,t){if("function"!=typeof t)throw new Error("must pass in a real function");this.fmScripts[r]=t}performScriptWithOption(r,t,i){const e=this.fmScripts[r];if(void 0===e)throw new Error(`The script '${r}' is not registered.`);return e(t,i)}performScript(r,t){return this.performScriptWithOption(r,t,0)}};var e=t.Z;export{e as default};