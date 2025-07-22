const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { PDFDocument } = require('pdf-lib');
const PDFUtils = require('../utils/pdfUtils');

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
  
    createWindow();
  
  // Set up IPC handlers after window is created
  setupIpcHandlers();

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
  // Test IPC handler
  ipcMain.handle('ping', () => 'pong');
  
  // Show save dialog
  ipcMain.handle('show-save-dialog', async (event, options) => {
    if (!mainWindow) return { canceled: true };
    
    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: options.title || 'Save File',
        defaultPath: options.defaultPath || 'untitled.pdf',
        filters: options.filters || [
          { name: 'PDF Files', extensions: ['pdf'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['createDirectory', 'showOverwriteConfirmation']
      });
      
      return result;
    } catch (error) {
      console.error('Error showing save dialog:', error);
      return { canceled: true, error: error.message };
    }
  });
  
  // Merge PDFs handler
  ipcMain.handle('merge-pdfs', async (event, { filePaths, outputPath }) => {
    if (!mainWindow || !filePaths || filePaths.length < 2) {
      return { 
        success: false, 
        message: 'At least 2 PDFs are required for merging' 
      };
    }
    
    try {
      // Validate input files
      for (const filePath of filePaths) {
        try {
          await fs.access(filePath, fs.constants.R_OK);
        } catch (error) {
          return { 
            success: false, 
            message: `Cannot access file: ${path.basename(filePath)}` 
          };
        }
      }
      
      // Check if output directory exists and is writable
      const outputDir = path.dirname(outputPath);
      try {
        await fs.access(outputDir, fs.constants.W_OK);
      } catch (error) {
        return { 
          success: false, 
          message: `Cannot write to output directory: ${outputDir}` 
        };
      }
      
      // Create progress callback
      const progressCallback = (progress) => {
        if (mainWindow) {
          mainWindow.webContents.send('merge-progress', progress);
        }
      };
      
      // Merge the PDFs
      const result = await PDFUtils.mergePDFs(filePaths, outputPath, progressCallback);
      
      // Ensure the output file was created
      try {
        await fs.access(outputPath, fs.constants.F_OK);
      } catch (error) {
        return { 
          success: false, 
          message: 'Failed to create output file. Check permissions and try again.' 
        };
      }
      
      return result;
      
    } catch (error) {
      console.error('Error merging PDFs:', error);
      return { 
        success: false, 
        message: error.message || 'An error occurred while merging PDFs' 
      };
    }
  });
  
  // Show error dialog
  ipcMain.handle('show-error-dialog', async (event, { title, message }) => {
    if (!mainWindow) return;
    
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: title || 'Error',
      message: message || 'An unknown error occurred',
      buttons: ['OK']
    });
  });
  
  // Show success dialog
  ipcMain.handle('show-success-dialog', async (event, { title, message }) => {
    if (!mainWindow) return;
    
    await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: title || 'Success',
      message: message || 'Operation completed successfully',
      buttons: ['OK']
    });
  });
  
  // Open file in default application
  ipcMain.handle('open-file', async (event, filePath) => {
    try {
      const { shell } = require('electron');
      await shell.openPath(filePath);
      return { success: true };
    } catch (error) {
      console.error('Error opening file:', error);
      return { success: false, message: error.message };
    }
  });
  
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
