export default class PDFSplitter {
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
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Split PDF</h2>
        
        <!-- File Drop Zone -->
        <div id="splitDropZone" class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div class="space-y-2">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-gray-600 dark:text-gray-300">
              <span class="font-medium text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              PDF file (MAX. 20MB)
            </p>
          </div>
          <input id="splitFileInput" type="file" class="hidden" accept=".pdf" />
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

        <!-- Split Options -->
        <div id="splitOptions" class="hidden space-y-4 mb-6">
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200">Split Options</h3>
            
            <!-- Output Directory Selection -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Output Directory</label>
                <button id="selectOutputDir" class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                  Change
                </button>
              </div>
              <div class="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span id="outputPath" class="text-sm text-gray-700 dark:text-gray-300 truncate flex-1" title="Select output directory">
                  ${window.electron ? 'Select output directory...' : 'Default download location'}
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Files will be saved to this directory</p>
            </div>
            
            <div class="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div class="flex flex-col space-y-2">
              <label class="inline-flex items-center">
                <input type="radio" name="splitType" value="range" class="form-radio text-indigo-600 dark:text-indigo-400" checked>
                <span class="ml-2 text-gray-700 dark:text-gray-300">Extract page range</span>
              </label>
              <div id="rangeOptions" class="ml-6 space-y-2">
                <div class="flex items-center space-x-2">
                  <span class="text-gray-700 dark:text-gray-300">From</span>
                  <input type="number" id="fromPage" min="1" value="1" class="w-20 px-2 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                  <span class="text-gray-700 dark:text-gray-300">to</span>
                  <input type="number" id="toPage" min="1" value="1" class="w-20 px-2 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                </div>
              </div>
            </div>
            <div class="flex flex-col space-y-2">
              <label class="inline-flex items-center">
                <input type="radio" name="splitType" value="single" class="form-radio text-indigo-600 dark:text-indigo-400">
                <span class="ml-2 text-gray-700 dark:text-gray-300">Extract single page</span>
              </label>
              <div id="singlePageOption" class="ml-6 hidden">
                <input type="number" id="singlePage" min="1" value="1" class="w-20 px-2 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600">
              </div>
            </div>
            <div class="flex flex-col space-y-2">
              <label class="inline-flex items-center">
                <input type="radio" name="splitType" value="all" class="form-radio text-indigo-600 dark:text-indigo-400">
                <span class="ml-2 text-gray-700 dark:text-gray-300">Extract all pages (individual files)</span>
              </label>
            </div>
          </div>
        </div>

            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3">
          <button id="cancelSplitBtn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50">
            Cancel
          </button>
          <button id="splitBtn" class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50" disabled>
            Split PDF
          </button>
        </div>

        <!-- Progress Bar -->
        <div id="progressContainer" class="mt-6 hidden">
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Processing...</span>
            <span id="progressPercent" class="text-sm font-medium text-gray-700 dark:text-gray-300">0%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div id="progressBar" class="bg-indigo-600 h-2.5 rounded-full" style="width: 0%"></div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const dropZone = this.container.querySelector('#splitDropZone');
    const fileInput = this.container.querySelector('#splitFileInput');
    const changeFileBtn = this.container.querySelector('#changeFileBtn');
    const splitBtn = this.container.querySelector('#splitBtn');
    const cancelBtn = this.container.querySelector('#cancelSplitBtn');
    const selectOutputDirBtn = this.container.querySelector('#selectOutputDir');
    const splitTypeRadios = this.container.querySelectorAll('input[name="splitType"]');
    
    // Output directory selection
    if (selectOutputDirBtn) {
      selectOutputDirBtn.addEventListener('click', async () => {
        try {
          const result = await window.electron.invoke('select-directory', this.outputPath || '');
          if (result && !result.canceled && result.filePaths && result.filePaths[0]) {
            this.outputPath = result.filePaths[0];
            this.updateOutputPathDisplay();
            this.saveOutputPath();
          }
        } catch (error) {
          console.error('Error selecting directory:', error);
        }
      });
    }
    
    // Drag and drop handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, this.preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, this.highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, this.unhighlight, false);
    });

    dropZone.addEventListener('drop', this.handleDrop.bind(this), false);
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', this.handleFileSelect.bind(this));
    changeFileBtn?.addEventListener('click', () => fileInput.click());
    
    // Split type radio button handlers
    splitTypeRadios.forEach(radio => {
      radio.addEventListener('change', this.handleSplitTypeChange.bind(this));
    });

    // Page number input validation
    this.container.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('change', this.validatePageNumbers.bind(this));
    });

    // Button handlers
    splitBtn?.addEventListener('click', this.handleSplit.bind(this));
    cancelBtn?.addEventListener('click', this.resetForm.bind(this));
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  highlight() {
    this.classList.add('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-900/20');
  }

  unhighlight() {
    this.classList.remove('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-900/20');
  }

  handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
      this.handleFiles(files);
    }
  }

  handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
      this.handleFiles(files);
    }
  }

  async handleFiles(files) {
    if (files.length === 0) return;
    
    // For now, just take the first file
    const file = files[0];
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.showError('Please select a PDF file');
      return;
    }
    
    // Validate file size (20MB max)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      this.showError('File size exceeds 20MB limit');
      return;
    }
    
    this.file = file;
    this.updateFileInfo(file);
    
    try {
      // Get page count using PDF.js
      const pageCount = await this.getPageCount(file);
      this.updatePageCount(pageCount);
      
      // Enable split options
      this.container.querySelector('#splitOptions').classList.remove('hidden');
      this.container.querySelector('#splitBtn').disabled = false;
      
      // Set max values for page inputs
      const pageInputs = this.container.querySelectorAll('input[type="number"]');
      pageInputs.forEach(input => {
        input.max = pageCount;
        if (input.id === 'toPage') {
          input.value = pageCount;
        }
      });
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      this.showError(
        'Failed to process PDF',
        error.message || 'The file may be corrupted or not a valid PDF.'
      );
      this.resetForm();
    }
  }

  async getPageCount(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          
          // Use the main process to get page count
          if (window.electron) {
            try {
              // Convert ArrayBuffer to regular array for IPC
              const arrayBufferData = Array.from(new Uint8Array(arrayBuffer));
              const pageCount = await window.electron.invoke('get-page-count', arrayBufferData);
              resolve(pageCount);
            } catch (error) {
              console.error('Error getting page count from main process:', error);
              // Fall back to client-side processing if main process fails
              await this.fallbackToClientSideProcessing(arrayBuffer, resolve, reject);
            }
          } else {
            // Fallback to client-side processing if electron API not available
            await this.fallbackToClientSideProcessing(arrayBuffer, resolve, reject);
          }
        } catch (error) {
          console.error('Error processing PDF:', error);
          reject(new Error('Failed to process the PDF file. Please try again.'));
        }
      };
      
      fileReader.onerror = () => {
        reject(new Error('Failed to read the file. The file might be in use or corrupted.'));
      };
      
      fileReader.onabort = () => {
        reject(new Error('File read was cancelled.'));
      };
      
      fileReader.readAsArrayBuffer(file);
    });
  }
  
  async fallbackToClientSideProcessing(arrayBuffer, resolve, reject) {
    try {
      console.warn('Falling back to client-side PDF processing');
      
      // Use dynamic import for pdf-lib
      const { PDFDocument } = await import('pdf-lib');
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        throwOnInvalidObject: false,
        updateMetadata: false
      });
      
      // Get the page count and resolve the promise
      resolve(pdfDoc.getPageCount());
    } catch (error) {
      console.error('Client-side PDF processing failed:', error);
      reject(new Error('Failed to process PDF. The file might be corrupted or in an unsupported format.'));
    }
  }

  async fallbackClientSideSplitPDF(arrayBuffer, fromPage, toPage, splitType, filename, resolve, reject) {
    try {
      // Use dynamic import for pdf-lib
      const { PDFDocument } = await import('pdf-lib');
      
      // Load the source PDF
      const sourcePdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        throwOnInvalidObject: false,
        updateMetadata: false
      });
      
      const pageCount = sourcePdf.getPageCount();
      
      // Validate page range
      fromPage = Math.max(1, Math.min(fromPage, pageCount));
      toPage = Math.min(toPage, pageCount);
      
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Determine which pages to copy
      const pagesToCopy = [];
      
      if (splitType === 'all') {
        // Copy all pages
        for (let i = 0; i < pageCount; i++) {
          pagesToCopy.push(i);
        }
      } else {
        // Copy the specified range (1-based to 0-based conversion)
        for (let i = fromPage - 1; i < toPage; i++) {
          pagesToCopy.push(i);
        }
      }
      
      // Copy pages with progress updates
      const totalPages = pagesToCopy.length;
      const copiedPages = await pdfDoc.copyPages(sourcePdf, pagesToCopy);
      
      // Add pages to the new document with progress updates
      for (let i = 0; i < copiedPages.length; i++) {
        pdfDoc.addPage(copiedPages[i]);
        const progress = 20 + Math.floor(((i + 1) / totalPages) * 70);
        this.updateProgress(progress);
      }
      
      // Save the PDF to a Uint8Array
      this.updateProgress(95);
      const pdfBytes = await pdfDoc.save();
      
      // Create a Blob from the PDF data
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Create and trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      // Update progress to 100%
      this.updateProgress(100);
      
      // Show success message
      this.showSuccess('PDF split successfully!', filename);
      
      resolve({
        success: true,
        filename: filename,
        pages: splitType === 'all' ? 'all' : `${fromPage}-${toPage}`
      });
      
    } catch (error) {
      console.error('Client-side PDF processing failed:', error);
      this.showError(
        'PDF Processing Error',
        'Failed to process the PDF file. Please try again.'
      );
      reject(error);
    } finally {
      this.showProgress(false);
    }
  }

  updateFileInfo(file) {
    const fileInfo = this.container.querySelector('#fileInfo');
    const fileName = this.container.querySelector('#fileName');
    const fileSize = this.container.querySelector('#fileSize');
    
    fileInfo.classList.remove('hidden');
    fileName.textContent = file.name;
    fileSize.textContent = this.formatFileSize(file.size);
    
    // Hide drop zone
    this.container.querySelector('#splitDropZone').classList.add('hidden');
  }
  
  updateOutputPathDisplay() {
    const outputPathElement = this.container.querySelector('#outputPath');
    if (outputPathElement) {
      outputPathElement.textContent = this.outputPath || 'Default download location';
      outputPathElement.title = this.outputPath || 'Default download location';
    }
  }
  
  async loadSavedOutputPath() {
    try {
      if (window.electron) {
        const savedPath = await window.electron.invoke('get-preference', 'outputPath');
        if (savedPath) {
          this.outputPath = savedPath;
          this.updateOutputPathDisplay();
        }
      }
    } catch (error) {
      console.error('Error loading saved output path:', error);
    }
  }
  
  async saveOutputPath() {
    try {
      if (window.electron && this.outputPath) {
        await window.electron.invoke('set-preference', 'outputPath', this.outputPath);
      }
    } catch (error) {
      console.error('Error saving output path:', error);
    }
  }

  updatePageCount(count) {
    const pageCountElement = this.container.querySelector('#pageCount');
    pageCountElement.textContent = `${count} page${count !== 1 ? 's' : ''} in document`;
  }

  handleSplitTypeChange(e) {
    const value = e.target.value;
    const rangeOptions = this.container.querySelector('#rangeOptions');
    const singlePageOption = this.container.querySelector('#singlePageOption');
    
    if (value === 'single') {
      rangeOptions.classList.add('hidden');
      singlePageOption.classList.remove('hidden');
    } else if (value === 'range') {
      rangeOptions.classList.remove('hidden');
      singlePageOption.classList.add('hidden');
    } else {
      // 'all' option
      rangeOptions.classList.add('hidden');
      singlePageOption.classList.add('hidden');
    }
  }

  validatePageNumbers() {
    const fromPage = parseInt(this.container.querySelector('#fromPage').value) || 1;
    const toPage = parseInt(this.container.querySelector('#toPage').value) || 1;
    const singlePage = parseInt(this.container.querySelector('#singlePage')?.value) || 1;
    
    // Get the selected split type
    const selectedType = this.container.querySelector('input[name="splitType"]:checked').value;
    
    if (selectedType === 'range' && fromPage > toPage) {
      this.container.querySelector('#fromPage').value = toPage;
      this.container.querySelector('#toPage').value = fromPage;
    }
  }

  async handleSplit() {
    if (!this.file) return;
    
    const splitType = this.container.querySelector('input[name="splitType"]:checked').value;
    let fromPage, toPage, singlePage;
    
    if (splitType === 'range') {
      fromPage = parseInt(this.container.querySelector('#fromPage').value) || 1;
      toPage = parseInt(this.container.querySelector('#toPage').value) || 1;
      
      if (fromPage > toPage) {
        [fromPage, toPage] = [toPage, fromPage];
      }
    } else if (splitType === 'single') {
      singlePage = parseInt(this.container.querySelector('#singlePage').value) || 1;
      fromPage = singlePage;
      toPage = singlePage;
    } else {
      // 'all' option - will be handled by the backend
      fromPage = 1;
      toPage = 0; // Indicate all pages
    }
    
    // Show progress
    this.showProgress(true);
    
    try {
      // In a real implementation, we would send this to the main process
      // to handle the PDF splitting using a library like pdf-lib
      const result = await this.splitPDF({
        file: this.file,
        fromPage,
        toPage,
        splitType
      });
      
      // Progress is already updated in the splitPDF method
      
    } catch (error) {
      console.error('Error splitting PDF:', error);
      this.showError('Error splitting PDF. Please try again.');
    } finally {
      this.showProgress(false);
    }
  }

  async saveFile(blob, filename) {
    if (window.electron && this.outputPath) {
      try {
        // Convert blob to array buffer
        const arrayBuffer = await new Response(blob).arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Save file using main process
        const result = await window.electron.invoke('save-file', {
          filePath: this.outputPath,
          fileName: filename,
          data: Array.from(uint8Array)
        });
        
        if (result && result.success) {
          return result.filePath;
        }
      } catch (error) {
        console.error('Error saving file:', error);
        throw error;
      }
    }
    
    // Fallback to browser download
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      }, 100);
    });
  }

  async splitPDF({ file, fromPage, toPage, splitType }) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          
          // Generate base filename
          let baseFilename = file.name.replace(/\.pdf$/i, '');
          let filename;
          
          if (splitType === 'all') {
            // For 'all' split type, we'll handle the filename in the loop below
            filename = `${baseFilename}_page_1.pdf`; // Default name if we can't get page count
          } else if (splitType === 'single') {
            filename = `${baseFilename}_page_${fromPage}.pdf`;
          } else {
            filename = `${baseFilename}_pages_${fromPage}_to_${toPage}.pdf`;
          }
          
          // Show progress
          this.showProgress(true);
          this.updateProgress(20);
          
          // Use the main process to split the PDF if available
          if (window.electron) {
            try {
              // For 'all' split type, we need to handle each page separately
              if (splitType === 'all') {
                // First, get the total page count
                const pageCount = await this.getPageCount(file);
                
                // Process each page individually
                for (let i = 1; i <= pageCount; i++) {
                  // Update progress
                  const progress = Math.floor((i / pageCount) * 100);
                  this.updateProgress(progress);
                  
                  // Generate a unique filename for each page
                  const pageFilename = file.name.replace(/\.pdf$/i, `_page_${i}.pdf`);
                  
                  // Process this single page
                  const result = await window.electron.invoke('split-pdf', {
                    arrayBuffer: Array.from(new Uint8Array(arrayBuffer)),
                    fromPage: i,
                    toPage: i,
                    splitType: 'single',
                    filename: pageFilename
                  });
                  
                  // Convert the result to a Uint8Array and trigger download
                  const pdfBytes = new Uint8Array(result);
                  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                  
                  // Save the file using the output directory if specified
                  await this.saveFile(blob, pageFilename);
                }
                
                // Update progress to 100%
                this.updateProgress(100);
                
                // Show success message
                this.showSuccess(`Successfully extracted all ${pageCount} pages!`, '');
                
                resolve({
                  success: true,
                  filename: '',
                  pages: 'all'
                });
                
              } else {
                // For single page or range, use the existing logic
                const result = await window.electron.invoke('split-pdf', {
                  arrayBuffer: Array.from(new Uint8Array(arrayBuffer)),
                  fromPage,
                  toPage,
                  splitType,
                  filename
                });
                
                // Convert the result back to a Uint8Array
                const pdfBytes = new Uint8Array(result);
                
                // Create a Blob from the PDF data
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                
                // Save the file using the output directory if specified
                await this.saveFile(blob, filename);
                
                // Update progress to 100%
                this.updateProgress(100);
                
                // Show success message
                this.showSuccess('PDF split successfully!', filename);
                
                resolve({
                  success: true,
                  filename: filename,
                  pages: splitType === 'all' ? 'all' : `${fromPage}-${toPage}`
                });
              }
              
            } catch (error) {
              console.error('Error during main process PDF processing:', error);
              // Fall back to client-side processing if main process fails
              console.warn('Falling back to client-side PDF processing');
              await this.fallbackClientSideSplitPDF(
                arrayBuffer, 
                fromPage, 
                toPage, 
                splitType, 
                filename, 
                resolve, 
                reject
              );
            }
          } else {
            // Fallback to client-side processing if electron API not available
            console.warn('Electron API not available, using fallback PDF processing');
            await this.fallbackClientSideSplitPDF(
              arrayBuffer, 
              fromPage, 
              toPage, 
              splitType, 
              filename, 
              resolve, 
              reject
            );
          }
        } catch (error) {
          console.error('Error in file processing:', error);
          this.showError(
            'File Processing Error',
            'Failed to process the PDF file. Please try again.'
          );
          reject(error);
        } finally {
          this.showProgress(false);
        }
      };
      
      fileReader.onerror = () => {
        const error = new Error('Failed to read the file. Please try again.');
        this.showError('File Read Error', error.message);
        reject(error);
      };
      
      fileReader.onabort = () => {
        const error = new Error('File read was cancelled.');
        this.showError('Operation Cancelled', error.message);
        reject(error);
      };
      
      // Start reading the file
      fileReader.readAsArrayBuffer(file);
    });
  }

  showProgress(show) {
    const progressContainer = this.container.querySelector('#progressContainer');
    const splitBtn = this.container.querySelector('#splitBtn');
    
    if (show) {
      progressContainer.classList.remove('hidden');
      splitBtn.disabled = true;
      this.updateProgress(0);
    } else {
      progressContainer.classList.add('hidden');
      splitBtn.disabled = false;
    }
  }

  updateProgress(percent) {
    const progressBar = this.container.querySelector('#progressBar');
    const progressPercent = this.container.querySelector('#progressPercent');
    
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
  }

  showSuccess(message, filename = '') {
    // Create a nice success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 dark:bg-green-900/90 text-green-700 dark:text-green-300 p-4 rounded-md shadow-lg z-50 flex items-start space-x-4 max-w-md transform transition-all duration-300';
    notification.style.minWidth = '300px';
    notification.style.transform = 'translateX(120%)';
    notification.style.opacity = '0';
    
    // Add icon
    const icon = document.createElement('div');
    icon.className = 'text-2xl text-green-500 dark:text-green-400 mt-1';
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />' +
    '</svg>';
    
    // Add message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex-1';
    messageDiv.innerHTML = `
      <div class="font-semibold text-green-800 dark:text-green-200">${message}</div>
      ${filename ? `<div class="text-sm text-green-700 dark:text-green-300 mt-1 break-words">Saved to: ${filename}</div>` : ''}
    `;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200 focus:outline-none';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    });
    
    // Add elements to notification
    notification.appendChild(icon);
    notification.appendChild(messageDiv);
    notification.appendChild(closeButton);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Trigger reflow to ensure styles are applied before animation
    void notification.offsetWidth;
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 10);
    
    // Auto-remove after 5 seconds
    const autoRemoveTimer = setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
    
    // Clear timer on hover
    notification.addEventListener('mouseenter', () => {
      clearTimeout(autoRemoveTimer);
    });
    
    // Restart timer when mouse leaves
    notification.addEventListener('mouseleave', () => {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.opacity = '0';
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove();
            }
          }, 300);
        }
      }, 2000);
    });
  }

  showError(message, details = '') {
    // Create a nice error notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-md shadow-lg z-50 flex items-start space-x-4 max-w-md';
    
    // Add icon
    const icon = document.createElement('div');
    icon.className = 'text-2xl mt-1';
    icon.innerHTML = '⚠️';
    
    // Add message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex-1';
    messageDiv.innerHTML = `
      <div class="font-medium">Error: ${message}</div>
      ${details ? `<div class="text-sm opacity-80 mt-1">${details}</div>` : ''}
    `;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 text-xl';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      notification.remove();
    });
    
    // Assemble the notification
    notification.appendChild(icon);
    notification.appendChild(messageDiv);
    notification.appendChild(closeButton);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds (longer for errors)
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 500);
    }, 10000);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  resetForm() {
    // Reset file input
    this.file = null;
    this.container.querySelector('#splitFileInput').value = '';
    
    // Reset UI
    this.container.querySelector('#fileInfo').classList.add('hidden');
    this.container.querySelector('#splitOptions').classList.add('hidden');
    this.container.querySelector('#splitDropZone').classList.remove('hidden');
    this.container.querySelector('#splitBtn').disabled = true;
    
    // Reset form values
    this.container.querySelector('input[name="splitType"][value="range"]').checked = true;
    this.container.querySelector('#fromPage').value = '1';
    this.container.querySelector('#toPage').value = '1';
    this.container.querySelector('#singlePage').value = '1';
    this.container.querySelector('#rangeOptions').classList.remove('hidden');
    this.container.querySelector('#singlePageOption').classList.add('hidden');
    
    // Hide progress
    this.showProgress(false);
  }

  render() {
    return this.container;
  }
}
