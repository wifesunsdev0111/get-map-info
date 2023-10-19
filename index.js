const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");

let mainWindow;
app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1035,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadURL(`${app.getAppPath()}\\build\\index.html`);
});

ipcMain.on("number", (event, value) => {
  console.log(value);
});

ipcMain.on("open-file-dialog", (event) => {
  dialog
    .showSaveDialog(mainWindow, {
      title: "Select Download Path",
      defaultPath: app.getPath("downloads")
    })
    .then((result) => {
      if (!result.canceled) {
        event.reply("selected-file", result.filePath);
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

ipcMain.handle("open-success-dialog", async (event, args) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"]
  });

  const baseFolderPath = result.filePaths[0];
  const registryFolderName = "successful";
  const registryPath = path.join(baseFolderPath, registryFolderName);

  if (!fs.existsSync(registryPath)) {
    // Create the registry directory
    fs.mkdirSync(registryPath);

    // Perform any additional initialization steps here
    return registryPath;
  } else {
    return baseFolderPath;
  }
});

ipcMain.handle("open-exception-dialog", async (event, args) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"]
  });

  const baseFolderPath = result.filePaths[0];
  const registryFolderName = "exception";
  const registryPath = path.join(baseFolderPath, registryFolderName);

  if (!fs.existsSync(registryPath)) {
    // Create the registry directory
    fs.mkdirSync(registryPath);
    return registryPath;
  } else {
    return baseFolderPath;
  }
});

ipcMain.handle("save-success-file", async (event, args) => {
  const { successPath, mapData } = args;
  try {
    fs.writeFileSync(successPath, mapData);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
});

ipcMain.handle("save-exception-file", async (event, args) => {
  const { exceptionPath, mapData } = args;
  try {
    fs.writeFileSync(exceptionPath, mapData);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
});
