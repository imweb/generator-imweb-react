var fsAccess = require('fs-access');
var path = require('path');
var spawn = require('child_process').spawn;

// Return location of chrome.exe file for a given Chrome directory (available: "Chrome", "Chrome SxS").
function getChromeExe(chromeDirName) {
  // Only run these checks on win32
  if (process.platform !== 'win32') {
    return null;
  }
  var windowsChromeDirectory, i, prefix;
  var suffix = '\\Google\\' + chromeDirName + '\\Application\\chrome.exe';
  var prefixes = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']];

  for (i = 0; i < prefixes.length; i++) {
    prefix = prefixes[i];
    try {
      windowsChromeDirectory = path.join(prefix, suffix);
      fsAccess.sync(windowsChromeDirectory);
      return windowsChromeDirectory;
    } catch (e) {}
  }

  return windowsChromeDirectory;
}

function getChromeDarwin(defaultPath) {
  if (process.platform !== 'darwin') {
    return null;
  }

  try {
    var homePath = path.join(process.env.HOME, defaultPath);
    fsAccess.sync(homePath);
    return homePath;
  } catch (e) {
    return defaultPath;
  }
}

// console.log('>>>>', getChromeExe('Chrome'));
// var spawn = require('child_process').spawn;
// var chrome = spawn(getChromeExe('Chrome'), [
//     '--disable-extensions-file-access-check',
//     'http://wang.oa.com/h5/?f1=21878&f2=1&pn=%E6%B5%8B%E8%AF%951#/rum/speed'
// ]);

// chrome.stdout.on('data', function(data) {
//     console.log('标准输出：\n' + data);
// });

// chrome.stderr.on('data', function(data) {
//     console.log('标准错误输出：\n' + data);
// });

// chrome.on('exit', function(code, signal) {
//     console.log('子进程已退出，代码：' + code);
// });

module.exports = {
  chrome: function(url) {
    chromeCMD =
      process.platform === 'darwin'
        ? getChromeDarwin('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        : getChromeExe('Chrome');

    var chrome = spawn(chromeCMD, [url]);

    // chrome.stdout.on('data', function(data) {
    //     console.log('chrome 标准输出：\n' + data);
    // });

    chrome.stderr.on('data', function(data) {
      console.log('\nchrome 标准错误输出：\n' + data + '\n');
    });

    // chrome.on('exit', function(code, signal) {
    //     console.log('chrome 子进程已退出，代码：' + code);
    // });
  },
};
