// DOM Elements
import PDFMerger from './components/PDFMerger.js';
import PDFSplitter from './components/PDFSplitter.js';
import PDFCompressor from './components/PDFCompressor.js';
import PDFToJPG from './components/PDFToJPG.js';

// DOM Elements
const appContainer = document.getElementById('app');
const homeView = document.getElementById('home-view');
const toolViews = document.getElementById('tool-views');

// Tool Registry
const toolRegistry = {
  'pdf-merger': { component: PDFMerger, name: 'PDF Merger' },
  'pdf-splitter': { component: PDFSplitter, name: 'PDF Splitter' },
  'pdf-compressor': { component: PDFCompressor, name: 'PDF Compressor' },
  'pdf-to-jpg': { component: PDFToJPG, name: 'PDF to JPG' },
};

// Navigation state
let currentView = 'home';
let currentTool = null;

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
async function showToolView(toolId) {
  const toolInfo = toolRegistry[toolId];
  if (!toolInfo) {
    console.error(`Tool with ID '${toolId}' not found.`);
    showHomeView();
    return;
  }

  try {
    currentView = 'tool';
    currentTool = toolId;
    homeView.classList.add('hidden');

    const ToolComponent = toolInfo.component;
    const toolInstance = new ToolComponent();
    const toolElement = toolInstance.render();

    toolViews.innerHTML = '';
    toolViews.appendChild(toolElement);
    addBackButton();
    toolViews.classList.remove('hidden');
    document.title = `${toolInfo.name} - PDF Toolkit`;

  } catch (error) {
    console.error(`Error showing ${toolInfo.name} view:`, error);
    alert(`Failed to load ${toolInfo.name} tool. Please try again.`);
    showHomeView();
  }
}

// Add back button to tool view
function addBackButton() {
  const backButton = document.createElement('button');
  backButton.className = 'fixed top-4 left-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors';
  backButton.innerHTML = '← Back to Home';
  backButton.addEventListener('click', showHomeView);
  toolViews.insertBefore(backButton, toolViews.firstChild);
}

// Initialize the app
async function init() {
  try {
    // Initialize theme
    initTheme();
    
    // Set up theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Set up navigation
    document.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', () => {
        const toolId = card.id;
        if (toolRegistry[toolId]) {
          showToolView(toolId);
        } else {
          console.warn(`No tool registered for ID: ${toolId}`)
        }
      });
    });
    
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
