// DOM Elements
const appContainer = document.getElementById('app');
const homeView = document.getElementById('home-view');
const toolViews = document.getElementById('tool-views');

// Import components using dynamic import
let PDFMerger;

// Navigation state
let currentView = 'home';

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

// Initialize the PDF Merger UI
async function initPDFMerger() {
  try {
    // Dynamically import the PDFMerger component
    const PDFMergerModule = await import('./components/PDFMerger.js');
    PDFMerger = PDFMergerModule.default;
    
    // Create PDF Merger instance and get its element
    const pdfMerger = new PDFMerger();
    const pdfMergerElement = pdfMerger.render();
    
    // Clear any existing content and append the PDF Merger UI
    toolViews.innerHTML = '';
    toolViews.appendChild(pdfMergerElement);
    
    // Add back button
    const backButton = document.createElement('button');
    backButton.className = 'fixed top-4 left-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors';
    backButton.innerHTML = '← Back to Home';
    backButton.addEventListener('click', showHomeView);
    toolViews.insertBefore(backButton, toolViews.firstChild);
    
    // Add theme toggle if it exists
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
  } catch (error) {
    console.error('Error initializing PDF Merger:', error);
    appContainer.innerHTML = `
      <div class="p-6 text-center">
        <h2 class="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Error Initializing PDF Merger</h2>
        <p class="text-gray-700 dark:text-gray-300">${error.message}</p>
        <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Reload Application
        </button>
      </div>
    `;
  }
}

// Toggle between light and dark theme
function toggleTheme() {
  try {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
  } catch (error) {
    console.error('Error toggling theme:', error);
  }
}

// Show home view
function showHomeView() {
  homeView.classList.remove('hidden');
  toolViews.classList.add('hidden');
  currentView = 'home';
  document.title = 'PDF Toolkit';
}

// Show tool view
function showToolView(toolName) {
  homeView.classList.add('hidden');
  toolViews.classList.remove('hidden');
  currentView = toolName;
  document.title = `${toolName} | PDF Toolkit`;
  
  // Initialize the specific tool if needed
  if (toolName === 'merge-pdf') {
    initPDFMerger();
  }
}

// Initialize the app
function init() {
  console.log('Initializing app...');
  
  try {
    initTheme();
    
    // Set up event listeners for tool cards
    document.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', () => {
        const toolId = card.id || 'tool';
        showToolView(toolId);
      });
    });
    
    // Check if electron API is available
    if (window.electron) {
      console.log('Electron API available, initializing IPC...');
      
      // Test the ping-pong IPC
      window.electron.invoke('ping')
        .then((response) => {
          console.log('Ping successful! Response:', response);
        })
        .catch((error) => {
          console.warn('Ping failed:', error.message);
        });
      
    } else {
      console.warn('Electron API not available, running in browser context?');
      // Show a warning in the UI
      const warning = document.createElement('div');
      warning.className = 'fixed top-4 right-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 p-4 rounded-md';
      warning.textContent = 'Running in browser mode. Some features may be limited.';
      document.body.appendChild(warning);
    }
    
    // Show home view by default
    showHomeView();
  } catch (error) {
    console.error('Error during initialization:', error);
    appContainer.innerHTML = `
      <div class="p-6 text-center">
        <h2 class="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Application Error</h2>
        <p class="text-gray-700 dark:text-gray-300 mb-4">${error.message}</p>
        <button onclick="window.location.reload()" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Reload Application
        </button>
      </div>
    `;
  }
}

// Start the app when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // In case the document is already loaded
  setTimeout(init, 100);
}

// Export for testing if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init };
}
