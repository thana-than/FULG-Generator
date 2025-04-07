const { app, BrowserWindow } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('disable-backgrounding-occluded-windows', 'true');
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('ignore-gpu-blacklist');

function createWindow() {
    const home = `file://${path.join(__dirname, 'index.html')}`;

    const win = new BrowserWindow({
        width: 773,
        height: 1080,
        transparent: true,
        frame: false,
        resizable: true,
        hasShadow: false,
        minimizable: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: false,
            backgroundThrottling: false,
            // devTools: false
        }
    });

    win.loadURL(home);

    win.webContents.on('will-navigate', (event, newUrl) => {
        if (newUrl.includes('access_token')) {
            event.preventDefault();

            const token = new URLSearchParams(new URL(newUrl).hash.substring(1)).get('access_token');
            if (token) {
                const url = new URL(home);
                url.searchParams.set("access_token", token);
                win.loadURL(url.toString());
            }
        }
    });

    win.on('minimize', (event) => {
        event.preventDefault();
        setTimeout(() => {
            win.restore();  //* Bring it back
        }, 10);
    });
}

app.whenReady().then(createWindow);