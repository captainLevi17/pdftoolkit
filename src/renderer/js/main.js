// DOM Elements
const toolCards = document.querySelectorAll('.tool-card');

// Theme toggle functionality
function initTheme() {
  try {
    // Check for saved theme preference or use system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (error) {
    console.error('Error initializing theme:', error);
  }
}

// Handle tool card clicks
function setupToolCards() {
  toolCards.forEach(card => {
    card.addEventListener('click', () => {
      try {
        const toolName = card.querySelector('h2').textContent;
        console.log(`Selected tool: ${toolName}`);
        // Will implement tool-specific functionality later
        alert(`${toolName} functionality coming soon!`);
      } catch (error) {
        console.error('Error handling tool card click:', error);
      }
    });
  });
}

// Initialize the app
function init() {
  console.log('Initializing app...');
  
  try {
    initTheme();
    setupToolCards();
    
    // Check if electron API is available
    if (window.electron) {
      console.log('Electron API available, checking IPC...');
      
      // Test the ping-pong IPC
      console.log('Sending ping to main process...');
      
      window.electron.invoke('ping')
        .then((response) => {
          console.log('Ping successful! Response:', response);
          
          // Test receiving messages
          window.electron.receive('fromMain', (data) => {
            console.log('Received from main:', data);
          });
          
          // Test sending a message
          window.electron.send('toMain', { message: 'Hello from renderer!' });
          
        })
        .catch((error) => {
          console.warn('Ping failed:', error.message);
        });
    } else {
      console.warn('Electron API not available, running in browser context?');
    }
  } catch (error) {
    console.error('Error during initialization:', error);
  }
}

// Start the app when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // In case the document is already loaded
  setTimeout(init, 100);
}
