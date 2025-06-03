const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Simple error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (e) {
  console.log('Squirrel startup not available, continuing...');
}

let mainWindow;

function createWindow() {
  try {
    console.log('Creating main window...');
    
    // Get the path to the preload script
    const preloadPath = path.join(__dirname, '../shared/preload.js');
    console.log('Using preload script from:', preloadPath);

    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,  // Disable for security
        contextIsolation: true,  // Enable for security
        preload: preloadPath,    // Use preload script
        webviewTag: true,
        enableRemoteModule: false // Disable for security
      },
      show: false, // Don't show until ready-to-show
      // icon: path.join(__dirname, '../renderer/assets/icon.png'),
    });


    // Load the index.html file
    const indexPath = path.join(__dirname, '../renderer/index.html');
    console.log('Loading index.html from:', indexPath);
    
    mainWindow.loadFile(indexPath)
      .then(() => {
        console.log('Index.html loaded successfully');
        // Show window when content is loaded
        mainWindow.show();
      })
      .catch(err => {
        console.error('Failed to load index.html:', err);
      });

    // Open the DevTools in development
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
    
    // Handle window closed
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
    
    // Handle any window errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load window:', errorCode, errorDescription);
    });
    
    console.log('Main window created successfully');
  } catch (error) {
    console.error('Error creating window:', error);
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log('App is ready, creating window...');
  
  // Set up IPC handlers before creating the window
  setupIpcHandlers();
  
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch(err => {
  console.error('Error in app.whenReady:', err);
});

// Set up IPC handlers
function setupIpcHandlers() {
  // Simple ping-pong for testing
  ipcMain.handle('ping', () => 'pong from main process!');
  
  // Handle messages from renderer
  ipcMain.on('toMain', (event, data) => {
    console.log('Received from renderer:', data);
    
    // Send a response back
    if (mainWindow) {
      mainWindow.webContents.send('fromMain', {
        response: 'Hello from main process!',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  console.log('IPC handlers set up successfully');
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Log when the app is about to quit
app.on('will-quit', () => {
  console.log('App is quitting...');
});

// Handle any unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
