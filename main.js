const path = require("path");
const { app, BrowserWindow, TouchBar, ipcMain, screen } = require("electron");
const { TouchBarButton } = TouchBar;
const Store = require("electron-store");

// 渲染进程的 store.js 通过 ipcRenderer.sendSync 与主进程通信,必须先注册处理器
Store.initRenderer();

const MAIN_WIDTH = 320;
const MAIN_HEIGHT = 350;

const spin = new TouchBarButton({
  label: "👻 血小板 けっしょうばん",
  backgroundColor: "#7851A9",
  click: () => {
    console.log("血小板");
  }
});

let spins = [spin];

const touchBar = new TouchBar({
  items: spins
});

let mainWindow, settingWindow;

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.bounds;
  mainWindow = new BrowserWindow({
    width: MAIN_WIDTH,
    height: MAIN_HEIGHT,
    title: "platelet",
    hasShadow: false,
    transparent: true,
    resizable: app.isPackaged ? false : true,
    frame: false,
    focusable: true,
    alwaysOnTop: true,
    show: false,
    x: width - MAIN_WIDTH,
    y: height - MAIN_HEIGHT,
    webPreferences: {
      devTools: app.isPackaged ? false : true,
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false
    }
  });
  mainWindow.on("closed", () => (mainWindow = null));
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.setTouchBar(touchBar);
  });
}

function createSettingWindow() {
  if (settingWindow) {
    settingWindow.show();
    return
  }
  settingWindow = new BrowserWindow({
    height: 300,
    width: 400,
    parent: mainWindow,
    frame: false,
    focusable: true,
    resizable: app.isPackaged ? false : true,
    hasShadow: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false
    },
    show: false
  });
  settingWindow.loadFile(path.join(__dirname, "setting.html"));
  settingWindow.show();
}

app.on("ready", () => createWindow());

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

if (process.platform === "darwin") {
  app.setAboutPanelOptions({
    applicationName: "血小板",
    applicationVersion: app.getVersion(),
    copyright: "Copyright 2018",
    credits: "Amor"
  });
}

ipcMain.on("show-setting-window", () => {
  createSettingWindow();
});

ipcMain.on("hide-setting-window", event => {
  settingWindow.hide()
});

ipcMain.on("setting-hitokoto", (event, data) => {
  mainWindow.webContents.send("setting-hitokoto", data);
});

// 渲染进程 JS 拖拽:去掉 -webkit-app-region: drag 后,由渲染进程上报位移来移动窗口
ipcMain.on("platelet-move", (event, dx, dy) => {
  if (!mainWindow) return;
  const [x, y] = mainWindow.getPosition();
  mainWindow.setPosition(x + dx, y + dy);
});
