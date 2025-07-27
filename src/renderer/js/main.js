// DOM Elements
const appContainer = document.getElementById('app');
const homeView = document.getElementById('home-view');
const toolViews = document.getElementById('tool-views');

// Import components using dynamic import
let PDFMerger;
let PDFSplitter;
let PDFCompressor;

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

// Initialize the PDF Splitter UI
async function initPDFSplitter() {
  try {
    // Dynamically import the PDFSplitter component
    const PDFSplitterModule = await import('./components/PDFSplitter.js');
    PDFSplitter = PDFSplitterModule.default;
    
    // Create PDF Splitter instance and get its element
    const pdfSplitter = new PDFSplitter();
    const pdfSplitterElement = pdfSplitter.render();
    
    // Set current tool
    currentTool = 'split';
    
    // Clear any existing content and append the PDF Splitter UI
    toolViews.innerHTML = '';
    toolViews.appendChild(pdfSplitterElement);
    
    // Add back button
    addBackButton();
    
    // Add theme toggle if it exists
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      toolViews.appendChild(themeToggle);
    }
    
  } catch (error) {
    console.error('Error initializing PDF Splitter:', error);
    alert('Failed to load PDF Splitter. Please check the console for details.');
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
    
    // Set current tool
    currentTool = 'merge';
    
    // Clear any existing content and append the PDF Merger UI
    toolViews.innerHTML = '';
    toolViews.appendChild(pdfMergerElement);
    
    // Add back button
    addBackButton();
    
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

// Initialize the PDF Compressor UI
async function initPDFCompressor() {
  try {
    // Dynamically import the PDFCompressor component
    const PDFCompressorModule = await import('./components/PDFCompressor.js');
    PDFCompressor = PDFCompressorModule.default;
    
    // Create PDF Compressor instance and render it
    const pdfCompressor = new PDFCompressor();
    const pdfCompressorElement = pdfCompressor.render();
    
    // Set current tool
    currentTool = 'compress';
    
    // Clear any existing content and append the PDF Compressor UI
    toolViews.innerHTML = '';
    toolViews.appendChild(pdfCompressorElement);
    
    // Add back button
    addBackButton();
    
    // Add theme toggle if it exists
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
  } catch (error) {
    console.error('Error initializing PDF Compressor:', error);
    appContainer.innerHTML = `
      <div class="p-6 text-center">
        <h2 class="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Error Initializing PDF Compressor</h2>
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
async function showToolView(toolName) {
  try {
    currentView = 'tool';
    homeView.classList.add('hidden');
    toolViews.classList.remove('hidden');
    
    // Initialize the appropriate tool
    if (toolName.toLowerCase() === 'merge pdf' || toolName === 'merge') {
      await initPDFMerger();
    } else if (toolName.toLowerCase() === 'split pdf' || toolName === 'split') {
      await initPDFSplitter();
    } else if (toolName.toLowerCase() === 'compress pdf' || toolName === 'compress') {
      await initPDFCompressor();
    }
    // Add other tool initializations here
    
  } catch (error) {
    console.error(`Error showing ${toolName} view:`, error);
    alert(`Failed to load ${toolName} tool. Please try again.`);
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
        const toolName = card.id.replace('-', ' ');
        showToolView(toolName);
      });
    });
    
    // Set up back button
    const backButton = document.getElementById('backButton');
    if (backButton) {
      backButton.addEventListener('click', showHomeView);
    }
    
    // Initialize tools when their cards are clicked
    const mergePdfCard = document.getElementById('merge-pdf');
    if (mergePdfCard) {
      mergePdfCard.addEventListener('click', async () => {
        await showToolView('merge');
      });
    }
    
    const splitPdfCard = document.getElementById('split-pdf');
    if (splitPdfCard) {
      splitPdfCard.addEventListener('click', async () => {
        await showToolView('split');
      });
    }
    
    const compressPdfCard = document.getElementById('compress-pdf');
    if (compressPdfCard) {
      compressPdfCard.addEventListener('click', async () => {
        await showToolView('compress');
      });
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
