const Store = require("electron-store");

// 注意:electron-store 8 的 schema(ajv 校验)在 Electron 33 内置 Node 下会栈溢出,
// 改用 defaults(不走 ajv);最小值校验已在 platelet.js 的设置窗口逻辑中处理。
const store = new Store({
  defaults: {
    hitokoto: 3000
  }
});
