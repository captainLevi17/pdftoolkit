export default class PDFMerger {
  constructor() {
    this.files = [];
    this.initializeElements();
    this.setupEventListeners();
  }

  initializeElements() {
    this.container = document.createElement('div');
    this.container.className = 'p-6 max-w-4xl mx-auto';
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Merge PDFs</h2>
        
        <!-- File Drop Zone -->
        <div id="dropZone" class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div class="space-y-2">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-gray-600 dark:text-gray-300">
              <span class="font-medium text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              PDF files (MAX. 20MB each)
            </p>
          </div>
          <input id="fileInput" type="file" class="hidden" multiple accept=".pdf" />
        </div>

        <!-- File List -->
        <div id="fileList" class="space-y-3 mb-6">
          <!-- Files will be listed here -->
          <p id="noFilesMessage" class="text-gray-500 dark:text-gray-400 text-center py-4">
            No files selected. Add PDFs to merge them.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-between items-center">
          <div class="space-x-2">
            <button id="addMoreBtn" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" disabled>
              Add More Files
            </button>
            <button id="clearAllBtn" class="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50" disabled>
              Clear All
            </button>
          </div>
          <button id="mergeBtn" class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50" disabled>
            Merge PDFs
          </button>
        </div>

        <!-- Progress Bar -->
        <div id="progressContainer" class="mt-6 hidden">
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Merging...</span>
            <span id="progressPercentage" class="text-sm font-medium text-gray-500 dark:text-gray-400">0%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div id="progressBar" class="bg-indigo-600 h-2.5 rounded-full" style="width: 0%"></div>
          </div>
        </div>

        <!-- Result Message -->
        <div id="resultMessage" class="mt-4 hidden">
          <div id="successMessage" class="p-4 mb-4 text-sm text-green-700 bg-green-100 dark:bg-green-200 rounded-lg hidden">
            <span class="font-medium">Success!</span> <span id="successText"></span>
          </div>
          <div id="errorMessage" class="p-4 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-200 rounded-lg hidden">
            <span class="font-medium">Error!</span> <span id="errorText"></span>
          </div>
        </div>
      </div>
    `;

    // Cache DOM elements
    this.dropZone = this.container.querySelector('#dropZone');
    this.fileInput = this.container.querySelector('#fileInput');
    this.fileList = this.container.querySelector('#fileList');
    this.noFilesMessage = this.container.querySelector('#noFilesMessage');
    this.addMoreBtn = this.container.querySelector('#addMoreBtn');
    this.clearAllBtn = this.container.querySelector('#clearAllBtn');
    this.mergeBtn = this.container.querySelector('#mergeBtn');
    this.progressContainer = this.container.querySelector('#progressContainer');
    this.progressBar = this.container.querySelector('#progressBar');
    this.progressPercentage = this.container.querySelector('#progressPercentage');
    this.resultMessage = this.container.querySelector('#resultMessage');
    this.successMessage = this.container.querySelector('#successMessage');
    this.errorMessage = this.container.querySelector('#errorMessage');
    this.successText = this.container.querySelector('#successText');
    this.errorText = this.container.querySelector('#errorText');
  }

  setupEventListeners() {
    // File input change
    this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
    
    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, this.preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, () => this.highlight(), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, () => this.unhighlight(), false);
    });

    this.dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      this.handleFiles(files);
    });

    // Click on drop zone to open file dialog
    this.dropZone.addEventListener('click', () => {
      this.fileInput.click();
    });

    // Buttons
    this.addMoreBtn.addEventListener('click', () => this.fileInput.click());
    this.clearAllBtn.addEventListener('click', () => this.clearAllFiles());
    this.mergeBtn.addEventListener('click', () => this.mergePDFs());

    // IPC listeners for merge progress and completion
    if (window.electron) {
      window.electron.receive('merge-progress', (progress) => {
        this.updateProgress(progress);
      });
    }
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  highlight() {
    this.dropZone.classList.add('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-900/20');
  }

  unhighlight() {
    this.dropZone.classList.remove('border-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-900/20');
  }

  async handleFiles(files) {
    const newFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    
    if (newFiles.length === 0) {
      this.showError('Please select valid PDF files.');
      return;
    }

    // Validate file sizes (max 20MB each)
    const maxSize = 20 * 1024 * 1024; // 20MB
    const invalidFiles = newFiles.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      this.showError(`Some files exceed the 20MB limit: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Add new files to the list
    this.files = [...this.files, ...newFiles];
    this.updateFileList();
    this.updateUIState();
  }

  updateFileList() {
    // Clear the file list
    this.fileList.innerHTML = '';
    
    if (this.files.length === 0) {
      this.noFilesMessage.classList.remove('hidden');
      return;
    }
    
    this.noFilesMessage.classList.add('hidden');
    
    // Add each file to the list
    this.files.forEach((file, index) => {
      const fileElement = document.createElement('div');
      fileElement.className = 'flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md';
      fileElement.innerHTML = `
        <div class="flex items-center space-x-3">
          <svg class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs" title="${file.name}">
            ${file.name}
          </span>
          <span class="text-xs text-gray-500">
            ${this.formatFileSize(file.size)}
          </span>
        </div>
        <div class="flex space-x-2">
          <button class="move-up-btn p-1 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400" data-index="${index}" title="Move up">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button class="move-down-btn p-1 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400" data-index="${index}" title="Move down">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button class="remove-btn p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400" data-index="${index}" title="Remove">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      `;
      
      // Add event listeners for the buttons
      const moveUpBtn = fileElement.querySelector('.move-up-btn');
      const moveDownBtn = fileElement.querySelector('.move-down-btn');
      const removeBtn = fileElement.querySelector('.remove-btn');
      
      moveUpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.moveFile(index, 'up');
      });
      
      moveDownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.moveFile(index, 'down');
      });
      
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeFile(index);
      });
      
      this.fileList.appendChild(fileElement);
    });
  }

  moveFile(index, direction) {
    if (direction === 'up' && index > 0) {
      // Swap with previous file
      [this.files[index], this.files[index - 1]] = [this.files[index - 1], this.files[index]];
      this.updateFileList();
    } else if (direction === 'down' && index < this.files.length - 1) {
      // Swap with next file
      [this.files[index], this.files[index + 1]] = [this.files[index + 1], this.files[index]];
      this.updateFileList();
    }
  }

  removeFile(index) {
    this.files.splice(index, 1);
    this.updateFileList();
    this.updateUIState();
  }

  clearAllFiles() {
    this.files = [];
    this.updateFileList();
    this.updateUIState();
    this.hideResult();
  }

  updateUIState() {
    const hasFiles = this.files.length > 0;
    this.addMoreBtn.disabled = !hasFiles;
    this.clearAllBtn.disabled = !hasFiles;
    this.mergeBtn.disabled = this.files.length < 2;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async mergePDFs() {
    if (this.files.length < 2) {
      this.showError('Please select at least 2 PDFs to merge.');
      return;
    }

    try {
      // Show progress
      this.showProgress();
      this.hideResult();
      
      // Convert File objects to paths
      const filePaths = this.files.map(file => file.path);
      
      // Show save dialog to get output path
      const result = await window.electron.invoke('show-save-dialog', {
        title: 'Save Merged PDF',
        defaultPath: 'merged.pdf',
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (result.canceled) {
        this.hideProgress();
        return;
      }
      
      const outputPath = result.filePath;
      
      // Start the merge process
      const mergeResult = await window.electron.invoke('merge-pdfs', {
        filePaths,
        outputPath
      });
      
      if (mergeResult.success) {
        this.showSuccess(`PDFs merged successfully!`, outputPath);
      } else {
        throw new Error(mergeResult.message || 'Failed to merge PDFs');
      }
    } catch (error) {
      console.error('Error merging PDFs:', error);
      this.showError(error.message || 'An error occurred while merging PDFs');
    } finally {
      this.hideProgress();
    }
  }

  showProgress() {
    this.progressContainer.classList.remove('hidden');
    this.mergeBtn.disabled = true;
    this.addMoreBtn.disabled = true;
    this.clearAllBtn.disabled = true;
  }

  hideProgress() {
    this.progressContainer.classList.add('hidden');
    this.updateUIState();
  }

  updateProgress(progress) {
    const percentage = Math.round(progress * 100);
    this.progressBar.style.width = `${percentage}%`;
    this.progressPercentage.textContent = `${percentage}%`;
  }

  showSuccess(message, outputPath) {
    this.successText.textContent = message;
    
    // Add or update the open file button
    let openButton = this.successMessage.querySelector('.open-file-btn');
    if (!openButton) {
      openButton = document.createElement('button');
      openButton.className = 'mt-3 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2';
      openButton.innerHTML = `
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Open File</span>
      `;
      openButton.addEventListener('click', async () => {
        try {
          await window.electron.invoke('open-file', outputPath);
        } catch (error) {
          console.error('Error opening file:', error);
          this.showError('Could not open the file. It may have been moved or deleted.');
        }
      });
      this.successMessage.appendChild(openButton);
    }
    
    this.successMessage.classList.remove('hidden');
    this.errorMessage.classList.add('hidden');
    this.resultMessage.classList.remove('hidden');
  }

  showError(message) {
    this.errorText.textContent = message;
    this.errorMessage.classList.remove('hidden');
    this.successMessage.classList.add('hidden');
    this.resultMessage.classList.remove('hidden');
  }

  hideResult() {
    this.resultMessage.classList.add('hidden');
  }

  render() {
    return this.container;
  }
}

// No need for module.exports with ES modules
