const { contextBridge, ipcRenderer } = require('electron');

// Whitelist of valid channels for IPC communication
const validChannels = {
  send: ['toMain', 'merge-progress', 'split-progress'],
  receive: ['fromMain', 'merge-progress', 'split-progress'],
  invoke: [
    'ping',
    'show-save-dialog',
    'merge-pdfs',
    'show-error-dialog',
    'show-success-dialog',
    'open-file',
    'open-folder',
    'get-page-count',
    'split-pdf',
    'select-directory',
    'save-file',
    'save-file-to-path',
    'get-preference',
    'set-preference'
  ]
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Send a message to the main process
  send: (channel, data) => {
    if (validChannels.send.includes(channel)) {
      ipcRenderer.send(channel, data);
    } else {
      console.warn(`Attempted to send on invalid channel: ${channel}`);
    }
  },
  
  // Receive messages from the main process
  receive: (channel, func) => {
    if (validChannels.receive.includes(channel)) {
      // Strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    } else {
      console.warn(`Attempted to receive on invalid channel: ${channel}`);
    }
  },
  
  // Invoke an IPC method and return a promise
  invoke: async (channel, ...args) => {
    if (validChannels.invoke.includes(channel)) {
      try {
        return await ipcRenderer.invoke(channel, ...args);
      } catch (error) {
        console.error(`Error invoking ${channel}:`, error);
        throw error;
      }
    }
    console.warn(`Attempted to invoke invalid channel: ${channel}`);
    return Promise.reject(new Error(`Invalid channel: ${channel}`));
  },
  
  // Check if a channel is valid
  isChannelValid: (type, channel) => {
    return validChannels[type]?.includes(channel) || false;
  },
  
  // Get all valid channels (for debugging)
  getValidChannels: () => {
    return { ...validChannels };
  }
});

// Log when the preload script is loaded
console.log('Preload script loaded successfully');
