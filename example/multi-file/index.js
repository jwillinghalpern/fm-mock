import './f1';
import './f2';

window.globalFunction = () => {
  const yellow = '\x1b[33m%s\x1b[0m';
  console.log(yellow, 'globalFunction called');
};

window.FileMaker.PerformScript('Script 1');
window.FileMaker.PerformScript('Script 2');

console.log(
  `Explanation: "Script 1" and "Script 2" are registered as mocks within two separate JS files, but both should be callable in any context in your app by using window.Filemaker.PerformScript('Your Script'). This is useful if mocking a lot of scripts and you want to organize your scripts into separate files.\n`
);
