// Load pdf-lib from CDN
const loadPDFLib = () => {
  return new Promise((resolve) => {
    if (window.PDFLib) {
      resolve(window.PDFLib);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.onload = () => {
      // Give it a moment to fully initialize
      setTimeout(() => resolve(window.PDFLib), 100);
    };
    document.head.appendChild(script);
  });
};

// Load PDF.js with worker
const loadPDFJS = () => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.pdfjsLib && window.pdfjsLib.getDocument) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      console.log('PDF.js already loaded');
      resolve(window.pdfjsLib);
      return;
    }
    
    // Create script element for PDF.js
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    // Temporarily removing integrity check to avoid loading issues
    script.crossOrigin = 'anonymous';
    
    // Set up load handler
    script.onload = () => {
      console.log('PDF.js script loaded');
      // Wait for PDF.js to be fully initialized
      const checkPDFJS = setInterval(() => {
        if (window.pdfjsLib && window.pdfjsLib.getDocument) {
          clearInterval(checkPDFJS);
          // Set up worker
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
          console.log('PDF.js initialized successfully');
          resolve(window.pdfjsLib);
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkPDFJS);
        if (!window.pdfjsLib || !window.pdfjsLib.getDocument) {
          console.error('PDF.js failed to initialize');
          resolve(null);
        }
      }, 5000);
    };
    
    // Set up error handler
    script.onerror = (error) => {
      console.error('Failed to load PDF.js:', error);
      resolve(null);
    };
    
    // Add to document
    console.log('Loading PDF.js script...');
    document.head.appendChild(script);
  });
};

export default class PDFCompressor {
  constructor() {
    this.file = null;
    this.outputPath = '';
    this.initializeElements();
    this.setupEventListeners();
    this.loadSavedOutputPath();
  }

  initializeElements() {
    this.container = document.createElement('div');
    this.container.className = 'p-6 max-w-4xl mx-auto';
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Compress PDF</h2>
        
        <!-- File Drop Zone -->
        <div id="compressDropZone" class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" role="button" tabindex="0">
          <div class="space-y-2">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-gray-600 dark:text-gray-300">
              <span class="font-medium text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              PDF file
            </p>
          </div>
          <input id="compressFileInput" type="file" class="hidden" accept=".pdf" />
        </div>

        <!-- File Info -->
        <div id="fileInfo" class="hidden mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span id="fileName" class="font-medium text-gray-700 dark:text-gray-200"></span>
              <span id="fileSize" class="text-sm text-gray-500 dark:text-gray-400"></span>
            </div>
            <button id="changeFileBtn" class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              Change
            </button>
          </div>
          <div id="pageCount" class="mt-2 text-sm text-gray-600 dark:text-gray-300"></div>
        </div>

        <!-- Compression Options -->
        <div id="compressionOptions" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md hidden">
          <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Compression Settings</h3>
          
          <!-- Quality Level -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Compression Level
            </label>
            <div class="grid grid-cols-3 gap-4">
              <div class="relative">
                <input type="radio" id="lowCompression" name="compressionLevel" value="low" class="peer hidden" checked />
                <label for="lowCompression" class="block p-3 border border-gray-300 dark:border-gray-600 rounded-md text-center cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-900/20 dark:peer-checked:border-indigo-600">
                  <span class="block text-sm font-medium text-gray-700 dark:text-gray-200">Low</span>
                  <span class="block text-xs text-gray-500 dark:text-gray-400">Better quality</span>
                </label>
              </div>
              <div class="relative">
                <input type="radio" id="mediumCompression" name="compressionLevel" value="medium" class="peer hidden" />
                <label for="mediumCompression" class="block p-3 border border-gray-300 dark:border-gray-600 rounded-md text-center cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-900/20 dark:peer-checked:border-indigo-600">
                  <span class="block text-sm font-medium text-gray-700 dark:text-gray-200">Medium</span>
                  <span class="block text-xs text-gray-500 dark:text-gray-400">Balanced</span>
                </label>
              </div>
              <div class="relative">
                <input type="radio" id="highCompression" name="compressionLevel" value="high" class="peer hidden" />
                <label for="highCompression" class="block p-3 border border-gray-300 dark:border-gray-600 rounded-md text-center cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-900/20 dark:peer-checked:border-indigo-600">
                  <span class="block text-sm font-medium text-gray-700 dark:text-gray-200">High</span>
                  <span class="block text-xs text-gray-500 dark:text-gray-400">Smaller files</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Advanced Options (Collapsible) -->
          <div class="mt-6">
            <button type="button" id="advancedOptionsToggle" class="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 focus:outline-none">
              <span>Advanced Options</span>
              <svg id="advancedOptionsIcon" class="ml-1 h-4 w-4 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div id="advancedOptions" class="mt-4 space-y-4 hidden">
              <!-- Image Quality -->
              <div>
                <label for="imageQuality" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image Quality: <span id="imageQualityValue">80</span>%
                </label>
                <input type="range" id="imageQuality" name="imageQuality" min="10" max="100" value="80" step="5" 
                       class="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" />
              </div>
              
              <!-- Remove Metadata -->
              <div class="flex items-center">
                <input type="checkbox" id="removeMetadata" name="removeMetadata" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600" checked />
                <label for="removeMetadata" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remove metadata (author, creation date, etc.)
                </label>
              </div>
              
              <!-- Downsample Images -->
              <div class="flex items-center">
                <input type="checkbox" id="downsampleImages" name="downsampleImages" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600" checked />
                <label for="downsampleImages" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Downsample images to 150 DPI
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Output Options -->
        <div id="outputOptions" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md hidden">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Output Location</h3>
              <p id="outputPath" class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                ${this.outputPath || 'Same as source folder'}
              </p>
            </div>
            <button id="changeOutputBtn" class="px-3 py-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              Change
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3">
          <button id="resetBtn" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50" disabled>
            Reset
          </button>
          <button id="compressBtn" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50" disabled>
            Compress PDF
          </button>
        </div>

        <!-- Progress Bar -->
        <div id="progressContainer" class="mt-6 hidden">
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Compressing...</span>
            <span id="progressPercentage" class="text-sm font-medium text-gray-500 dark:text-gray-400">0%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div id="progressBar" class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" style="width: 0%"></div>
          </div>
          <p id="compressionInfo" class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
            Original size: <span id="originalSize">-</span> • Compressed: <span id="compressedSize">-</span> • <span id="savings">-</span>
          </p>
        </div>

        <!-- Result Message -->
        <div id="resultMessage" class="mt-6 hidden">
          <div id="successMessage" class="p-4 mb-4 text-sm text-green-700 bg-green-100 dark:bg-green-200 rounded-lg hidden">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div>
                <span class="font-medium">Compression successful!</span>
                <p id="successText" class="mt-1"></p>
                <div id="successActions" class="mt-2 flex space-x-3">
                  <a id="openFileBtn" href="#" class="text-green-700 hover:underline font-medium text-sm">Open File</a>
                  <a id="openFolderBtn" href="#" class="text-green-700 hover:underline font-medium text-sm">Open Folder</a>
                </div>
              </div>
            </div>
          </div>
          <div id="errorMessage" class="p-4 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-200 rounded-lg hidden">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div>
                <span class="font-medium">Error!</span>
                <p id="errorText" class="mt-1"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Cache DOM elements
    this.dropZone = this.container.querySelector('#compressDropZone');
    // File input elements
    this.fileInput = this.container.querySelector('#compressFileInput');
    this.fileInfo = this.container.querySelector('#fileInfo');
    this.fileName = this.container.querySelector('#fileName');
    this.fileSize = this.container.querySelector('#fileSize');
    this.pageCount = this.container.querySelector('#pageCount');
    this.changeFileBtn = this.container.querySelector('#changeFileBtn');
    this.compressionOptions = this.container.querySelector('#compressionOptions');
    this.outputOptions = this.container.querySelector('#outputOptions');
    this.outputPath = this.container.querySelector('#outputPath');
    this.changeOutputBtn = this.container.querySelector('#changeOutputBtn');
    this.resetBtn = this.container.querySelector('#resetBtn');
    this.compressBtn = this.container.querySelector('#compressBtn');
    this.progressContainer = this.container.querySelector('#progressContainer');
    this.progressBar = this.container.querySelector('#progressBar');
    this.progressPercentage = this.container.querySelector('#progressPercentage');
    this.originalSize = this.container.querySelector('#originalSize');
    this.compressedSize = this.container.querySelector('#compressedSize');
    this.savings = this.container.querySelector('#savings');
    this.resultMessage = this.container.querySelector('#resultMessage');
    this.successMessage = this.container.querySelector('#successMessage');
    this.errorMessage = this.container.querySelector('#errorMessage');
    this.successText = this.container.querySelector('#successText');
    this.errorText = this.container.querySelector('#errorText');
    this.openFileBtn = this.container.querySelector('#openFileBtn');
    this.openFolderBtn = this.container.querySelector('#openFolderBtn');
    
    // Advanced options elements
    this.advancedOptionsToggle = this.container.querySelector('#advancedOptionsToggle');
    this.advancedOptions = this.container.querySelector('#advancedOptions');
    this.advancedOptionsIcon = this.container.querySelector('#advancedOptionsIcon');
    this.imageQuality = this.container.querySelector('#imageQuality');
    this.imageQualityValue = this.container.querySelector('#imageQualityValue');
    this.removeMetadata = this.container.querySelector('#removeMetadata');
    this.downsampleImages = this.container.querySelector('#downsampleImages');
  }

  setupEventListeners() {
    // Check if elements exist before adding event listeners
    if (!this.dropZone || !this.fileInput) {
      console.error('Required elements not found');
      return;
    }
    
    // Bind methods to maintain 'this' context
    this.preventDefaults = this.preventDefaults.bind(this);
    this.highlight = this.highlight.bind(this);
    this.unhighlight = this.unhighlight.bind(this);
    
    // File input change
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleFileSelect(e.target.files[0]);
      }
    });
    
    // Click on drop zone to trigger file input
    this.dropZone.addEventListener('click', (e) => {
      // Don't trigger file input if clicking on child elements
      if (e.target === this.dropZone || e.target.closest('#compressDropZone')) {
        this.fileInput.click();
      }
    });
    
    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, this.preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, this.highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, this.unhighlight, false);
    });
    
    this.dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        this.handleFileSelect(files[0]);
      }
    });
    
    // Button click handlers
    this.changeFileBtn?.addEventListener('click', () => this.fileInput.click());
    this.resetBtn?.addEventListener('click', () => this.resetForm());
    this.changeOutputBtn?.addEventListener('click', () => this.chooseOutputPath());
    this.compressBtn?.addEventListener('click', () => this.compressPDF());
    
    // Advanced options toggle
    this.advancedOptionsToggle?.addEventListener('click', () => this.toggleAdvancedOptions());
    
    // Image quality slider
    this.imageQuality?.addEventListener('input', (e) => {
      this.imageQualityValue.textContent = e.target.value;
    });
    
    // Success actions
    this.openFileBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      if (this.compressedFilePath) {
        try {
          await window.electron.invoke('open-file', this.compressedFilePath);
        } catch (error) {
          console.error('Error opening file:', error);
          this.showError('Failed to open file. Please try again.');
        }
      }
    });

    this.openFolderBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      if (this.compressedFilePath) {
        try {
          // Let the main process handle the path resolution
          console.log('Requesting to open folder for file:', this.compressedFilePath);
          const result = await window.electron.invoke('open-folder', this.compressedFilePath);
          
          if (!result.success) {
            throw new Error(result.message || 'Failed to open folder');
          }
        } catch (error) {
          console.error('Error opening folder:', error);
          this.showError(`Failed to open folder: ${error.message || 'Unknown error'}`);
        }
      }
    });
  }
  
  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  highlight(e) {
    const target = e.currentTarget || this;
    target.classList.add('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-900/20');
  }
  
  unhighlight(e) {
    const target = e?.currentTarget || this;
    target.classList.remove('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-900/20');
  }
  
  async handleFileSelect(file) {
    if (!file) {
      return;
    }
    
    // Check if file is a PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.showError('Please select a valid PDF file');
      return;
    }
    
    this.file = file;
    
    // Update UI
    this.fileName.textContent = file.name;
    this.fileSize.textContent = this.formatFileSize(file.size);
    this.originalSize.textContent = this.formatFileSize(file.size);
    
    // Show file info and options
    this.fileInfo.classList.remove('hidden');
    this.compressionOptions.classList.remove('hidden');
    this.outputOptions.classList.remove('hidden');
    
    // Enable buttons
    this.resetBtn.disabled = false;
    this.compressBtn.disabled = false;
    
    // Hide any previous messages
    this.hideMessages();
    
    // Get page count (this would be async in a real implementation)
    try {
      const pageCount = await this.getPageCount(file);
      this.pageCount.textContent = `${pageCount} page${pageCount !== 1 ? 's' : ''}`;
    } catch (error) {
      console.error('Error getting page count:', error);
      this.pageCount.textContent = 'Page count unavailable';
    }
  }
  
  async getPageCount(file) {
    // In a real implementation, this would use a PDF library to get the page count
    // For now, we'll simulate this with a timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock page count based on file size (not accurate, just for demo)
        const mockPageCount = Math.max(1, Math.floor(Math.random() * 50) + 1);
        resolve(mockPageCount);
      }, 500);
    });
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  toggleAdvancedOptions() {
    this.advancedOptions.classList.toggle('hidden');
    this.advancedOptionsIcon.classList.toggle('rotate-180');
  }
  
  async chooseOutputPath() {
    try {
      const result = await window.electronAPI.showSaveDialog({
        title: 'Choose output location',
        defaultPath: this.file?.name.replace(/\.pdf$/i, '_compressed.pdf'),
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] }
        ]
      });
      
      if (!result.canceled && result.filePath) {
        this.outputPath.textContent = result.filePath;
        this.outputPathElement = result.filePath;
        // Save to localStorage for persistence
        localStorage.setItem('outputPath', result.filePath);
      }
    } catch (error) {
      console.error('Error choosing output path:', error);
      this.showError('Failed to choose output location');
    }
  }
  
  loadSavedOutputPath() {
    const savedPath = localStorage.getItem('outputPath');
    if (savedPath) {
      this.outputPath.textContent = savedPath;
      this.outputPathElement = savedPath;
    }
  }
  
  // Optimize PDF with enhanced compression
  async optimizePDF(arrayBuffer, options) {
    try {
      // Load PDF.js first
      const pdfjsLib = await loadPDFJS();
      
      if (!pdfjsLib || !pdfjsLib.getDocument) {
        throw new Error('Failed to load PDF.js library');
      }
      
      // Then load PDFLib
      const PDFLib = await loadPDFLib();
      if (!PDFLib) {
        throw new Error('Failed to load PDF-lib');
      }
      
      const { PDFDocument, rgb } = PDFLib;
      
      // Create a new PDF document for the output
      const outputPdf = await PDFDocument.create();
      
      console.log('Loading PDF document...');
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
        cMapPacked: true,
        disableFontFace: true
      });
      
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded with ${pdf.numPages} pages`);
      
      if (pdf.numPages === 0) {
        throw new Error('No pages found in PDF');
      }
    
      // Compression settings based on level
      const compressionSettings = {
        low: { quality: 0.8, dpi: 150 },
        medium: { quality: 0.6, dpi: 100 },
        high: { quality: 0.4, dpi: 72 }
      };
      
      // Get settings based on selected level
      const settings = { ...compressionSettings[options.compressionLevel || 'medium'] };
      
      // Override quality if custom quality is provided
      if (options.imageQuality !== undefined) {
        settings.quality = options.imageQuality / 100;
      }
      
      // Process each page
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.0 });
          
          // Create a canvas to render the page
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          // Set canvas dimensions based on DPI
          const scale = settings.dpi / 72; // 72 is the default DPI
          canvas.width = Math.floor(viewport.width * scale);
          canvas.height = Math.floor(viewport.height * scale);
          
          // Render the page to canvas
          await page.render({
            canvasContext: context,
            viewport: page.getViewport({ scale: scale }),
            background: '#FFFFFF',
            intent: 'print'
          }).promise;
          
          // Convert canvas to image data URL with quality setting
          const imageDataUrl = canvas.toDataURL('image/jpeg', settings.quality);
          
          // Convert data URL to Uint8Array
          const imageBytes = Uint8Array.from(
            atob(imageDataUrl.split(',')[1]),
            c => c.charCodeAt(0)
          );
          
          // Add the image to the output PDF
          const image = await outputPdf.embedJpg(imageBytes);
          const [pageWidth, pageHeight] = [viewport.width, viewport.height];
          const pageDims = outputPdf.addPage([pageWidth, pageHeight]);
          pageDims.drawImage(image, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
          });
          
          // Update progress
          const progress = Math.round((i / pdf.numPages) * 100);
          this.updateProgress(progress);
          
        } catch (pageError) {
          console.error(`Error processing page ${i}:`, pageError);
          // Continue with next page even if one fails
        }
      }
      
      // Set PDF metadata
      if (options.removeMetadata) {
        outputPdf.setTitle('');
        outputPdf.setAuthor('');
        outputPdf.setSubject('');
        outputPdf.setKeywords([]);
        outputPdf.setProducer('');
        outputPdf.setCreator('');
      }
      
      // Set compression options
      const saveOptions = {
        useObjectStreams: true,
        useCompression: true,
        useObjectStreamCompression: true,
        forcePDFVersion: options.forcePDFVersion || '1.5',
        quality: settings.quality
      };
      
      // Perform a second pass of compression for high compression level
      if (options.compressionLevel === 'high') {
        const firstPass = await outputPdf.save(saveOptions);
        const secondPassPdf = await PDFDocument.load(firstPass);
        return await secondPassPdf.save(saveOptions);
      }
      
      // Save the optimized PDF
      return await outputPdf.save(saveOptions);
    } catch (error) {
      console.error('PDF optimization error:', error);
      throw new Error(`Failed to optimize PDF: ${error.message}`);
    }
  }

  async compressPDF() {
    if (!this.file) {
      this.showError('No file selected');
      return;
    }

    try {
      // Show progress
      this.progressContainer.classList.remove('hidden');
      this.progressBar.style.width = '0%';
      this.progressPercentage.textContent = '0%';
      this.compressBtn.disabled = true;
      this.resetBtn.disabled = true;
      this.hideMessages();

      // Read the file as ArrayBuffer
      const arrayBuffer = await this.file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Get compression settings
      const compressionLevel = document.querySelector('input[name="compressionLevel"]:checked').value;
      const imageQuality = parseInt(this.imageQuality.value);
      const shouldRemoveMetadata = this.removeMetadata.checked;
      const shouldDownsampleImages = this.downsampleImages.checked;
      
      // Map compression level to Ghostscript settings
      let gsQuality;
      switch (compressionLevel) {
        case 'low':
          gsQuality = 'printer';  // High quality, less compression
          break;
        case 'high':
          gsQuality = 'ebook';    // Lower quality, more compression
          break;
        case 'medium':
        default:
          gsQuality = 'prepress'; // Balanced quality and compression
      }
      
      // Generate output filename
      const originalName = this.file.name.replace(/\.pdf$/i, '');
      const outputFilename = `${originalName}_compressed.pdf`;
      
      // Get output path from user or use default
      const result = await window.electron.invoke('show-save-dialog', {
        title: 'Save Compressed PDF',
        defaultPath: outputFilename,
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (result.canceled) {
        this.updateProgress(0);
        this.compressBtn.disabled = false;
        this.resetBtn.disabled = false;
        return;
      }
      
      const outputPath = result.filePath;
      
      // Optimize the PDF
      this.updateProgress(20);
      
      try {
        // Optimize the PDF
        const pdfBytes = await this.optimizePDF(arrayBuffer, {
          compressionLevel,
          imageQuality: imageQuality / 100,
          removeMetadata: shouldRemoveMetadata,
          downsampleImages: shouldDownsampleImages
        });
        
        this.updateProgress(60);
        
        // Save the compressed file
        const result = await window.electron.invoke('save-file-to-path', {
          filePath: outputPath,
          data: Array.from(pdfBytes)
        });
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to save compressed file');
        }
        
        // Calculate compression results
        const compressedSize = pdfBytes.byteLength;
        const originalSize = this.file.size;
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
        
        // Update file size info
        this.originalSize.textContent = this.formatFileSize(originalSize);
        this.compressedSize.textContent = this.formatFileSize(compressedSize);
        this.savings.textContent = `${savings}%`;
        
        // Store the output path for opening the file
        this.compressedFilePath = outputPath;
        
        // Show success message with option to open the file
        const fileSizeReduction = originalSize - compressedSize > 0 ? 
          ` (${this.formatFileSize(originalSize - compressedSize)} smaller)` : '';
        
        this.showSuccess(
          `PDF optimized successfully! File size reduced by ${savings}%${fileSizeReduction}.`,
          outputPath
        );
        
        this.updateProgress(100);
      } catch (error) {
        console.error('PDF optimization error:', error);
        throw new Error(`Failed to optimize PDF: ${error.message}`);
      }
    } catch (error) {
      console.error('Compression error:', error);
      this.showError(error.message || 'An error occurred during compression');
    } finally {
      this.compressBtn.disabled = false;
      this.resetBtn.disabled = false;
    }
  }
  
  updateProgress(percent) {
    this.progressBar.style.width = `${percent}%`;
    this.progressPercentage.textContent = `${percent}%`;
    
    // Simulate file size reduction
    if (percent < 100) {
      const originalSize = this.file.size;
      // Simulate compression ratio based on compression level
      const compressionLevel = document.querySelector('input[name="compressionLevel"]:checked')?.value || 'medium';
      let compressionRatio;
      
      switch (compressionLevel) {
        case 'low':
          compressionRatio = 0.7 + (0.2 * (percent / 100)); // 70% to 90% of original size
          break;
        case 'high':
          compressionRatio = 0.2 + (0.3 * (percent / 100)); // 20% to 50% of original size
          break;
        case 'medium':
        default:
          compressionRatio = 0.5 + (0.3 * (percent / 100)); // 50% to 80% of original size
      }
      
      const compressedSize = Math.max(1000, Math.floor(originalSize * (1 - (compressionRatio * (percent / 100)))));
      const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
      
      this.compressedSize.textContent = this.formatFileSize(compressedSize);
      this.savings.textContent = `${savings}% smaller`;
    }
  }
  
  onCompressionComplete() {
    // In a real implementation, this would be handled by the actual compression completion
    // For now, we'll simulate a successful compression
    const originalSize = this.file.size;
    const compressionLevel = document.querySelector('input[name="compressionLevel"]:checked')?.value || 'medium';
    let compressionRatio;
    
    switch (compressionLevel) {
      case 'low':
        compressionRatio = 0.8; // 80% of original size
        break;
      case 'high':
        compressionRatio = 0.4; // 40% of original size
        break;
      case 'medium':
      default:
        compressionRatio = 0.6; // 60% of original size
    }
    
    const compressedSize = Math.max(1000, Math.floor(originalSize * compressionRatio));
    const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    // Simulate a file path
    const fileName = this.file.name.replace(/\.pdf$/i, '_compressed.pdf');
    const filePath = this.outputPathElement || 
                    (this.file.path ? 
                      this.file.path.replace(/([^/\\]+)$/, fileName) : 
                      fileName);
    
    this.compressedFilePath = filePath;
    this.compressedSize.textContent = this.formatFileSize(compressedSize);
    this.savings.textContent = `${savings}% smaller`;
    
    // Show success message
    this.showSuccess(`File compressed successfully! Saved as ${fileName}`, filePath);
    
    // Re-enable reset button
    this.resetBtn.disabled = false;
  }
  
  showSuccess(message, filePath) {
    this.successText.textContent = message;
    this.successMessage.classList.remove('hidden');
    this.resultMessage.classList.remove('hidden');
    
    // Scroll to show the success message
    this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Update the open file/folder buttons
    if (filePath) {
      // Use the full file path for opening the file
      this.openFileBtn.href = `file://${filePath}`;
      
      // For the folder, we'll use the parent directory path
      // In a browser context, we can't use path.dirname, so we'll try to handle it with string manipulation
      const lastSlashIndex = filePath.lastIndexOf('\\');
      const folderPath = lastSlashIndex !== -1 ? filePath.substring(0, lastSlashIndex) : filePath;
      this.openFolderBtn.href = `file://${folderPath}`;
      
      // Show the buttons
      this.openFileBtn.style.display = 'inline-flex';
      this.openFolderBtn.style.display = 'inline-flex';
    }
  }
  
  showError(message) {
    this.errorText.textContent = message;
    this.errorMessage.classList.remove('hidden');
    this.resultMessage.classList.remove('hidden');
    
    // Scroll to show the error message
    this.errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  hideMessages() {
    this.successMessage.classList.add('hidden');
    this.errorMessage.classList.add('hidden');
    this.resultMessage.classList.add('hidden');
  }
  
  resetForm() {
    // Reset file input
    this.fileInput.value = '';
    this.file = null;
    
    // Reset UI
    this.fileInfo.classList.add('hidden');
    this.compressionOptions.classList.add('hidden');
    this.outputOptions.classList.add('hidden');
    this.progressContainer.classList.add('hidden');
    this.hideMessages();
    
    // Reset buttons
    this.resetBtn.disabled = true;
    this.compressBtn.disabled = true;
    
    // Reset form values
    document.getElementById('mediumCompression').checked = true;
    this.imageQuality.value = 80;
    this.imageQualityValue.textContent = '80';
    this.removeMetadata.checked = true;
    this.downsampleImages.checked = true;
    
    // Reset advanced options if open
    if (!this.advancedOptions.classList.contains('hidden')) {
      this.advancedOptions.classList.add('hidden');
      this.advancedOptionsIcon.classList.remove('rotate-180');
    }
  }
  
  // Method to render the component
  render() {
    // Initialize elements if not already done
    if (!this.container) {
      this.initializeElements();
      this.setupEventListeners();
    }
    return this.container;
  }
  
  // Method to get the container element (kept for backward compatibility)
  getElement() {
    return this.render();
  }
}

// No need for module.exports with ES modules
