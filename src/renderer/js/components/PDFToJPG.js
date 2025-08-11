export default class PDFToJPG {
  constructor() {
    this.file = null;
    this.initializeElements();
    this.setupEventListeners();
  }

  initializeElements() {
    this.container = document.createElement('div');
    this.container.className = 'p-6 max-w-4xl mx-auto';
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Convert PDF to JPG</h2>

        <!-- File Drop Zone -->
        <div id="dropZone" class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div class="space-y-2">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p id="dropZoneText" class="text-gray-600 dark:text-gray-300">
              <span class="font-medium text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop a PDF
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">PDF file (MAX. 50MB)</p>
          </div>
          <input id="fileInput" type="file" class="hidden" accept=".pdf" />
        </div>

        <!-- Options -->
        <div id="optionsContainer" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 hidden">
          <div>
            <label for="formatSelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Format</label>
            <select id="formatSelect" class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5">
              <option value="jpeg">JPG</option>
              <option value="png">PNG</option>
            </select>
          </div>
          <div>
            <label for="qualitySelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Quality</label>
            <select id="qualitySelect" class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5">
              <option value="150">Low (150 DPI)</option>
              <option value="300" selected>Medium (300 DPI)</option>
              <option value="600">High (600 DPI)</option>
            </select>
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex justify-end">
          <button id="convertBtn" class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50" disabled>
            Convert
          </button>
        </div>

        <!-- Progress Bar -->
        <div id="progressContainer" class="mt-6 hidden">
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Converting...</span>
            <span id="progressPercentage" class="text-sm font-medium text-gray-500 dark:text-gray-400">0%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div id="progressBar" class="bg-indigo-600 h-2.5 rounded-full" style="width: 0%"></div>
          </div>
        </div>

        <!-- Result Message -->
        <div id="resultMessage" class="mt-4 hidden"></div>
      </div>
    `;

    // Cache DOM elements
    this.dropZone = this.container.querySelector('#dropZone');
    this.dropZoneText = this.container.querySelector('#dropZoneText');
    this.fileInput = this.container.querySelector('#fileInput');
    this.optionsContainer = this.container.querySelector('#optionsContainer');
    this.formatSelect = this.container.querySelector('#formatSelect');
    this.qualitySelect = this.container.querySelector('#qualitySelect');
    this.convertBtn = this.container.querySelector('#convertBtn');
    this.progressContainer = this.container.querySelector('#progressContainer');
    this.progressBar = this.container.querySelector('#progressBar');
    this.progressPercentage = this.container.querySelector('#progressPercentage');
    this.resultMessage = this.container.querySelector('#resultMessage');
  }

  setupEventListeners() {
    this.fileInput.addEventListener('change', (e) => this.handleFile(e.target.files[0]));
    
    this.dropZone.addEventListener('click', () => this.fileInput.click());

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
      const file = dt.files[0];
      this.handleFile(file);
    });

    this.convertBtn.addEventListener('click', () => this.convertPdf());
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

  handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
      this.showError('Please select a valid PDF file.');
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      this.showError('File exceeds the 50MB limit.');
      return;
    }

    this.file = file;
    this.updateUIForFile();
  }

  updateUIForFile() {
    this.dropZoneText.innerHTML = `
      <span class="font-medium text-green-600 dark:text-green-400">Selected:</span> 
      <span class="truncate max-w-xs" title="${this.file.name}">${this.file.name}</span>
    `;
    this.dropZone.classList.add('border-green-500');
    this.optionsContainer.classList.remove('hidden');
    this.convertBtn.disabled = false;
    this.hideResult();
  }

  async convertPdf() {
    if (!this.file) {
      this.showError('Please select a PDF file first.');
      return;
    }

    try {
      this.showProgress();
      this.hideResult();

      const options = {
        filePath: this.file.path,
        format: this.formatSelect.value,
        quality: this.qualitySelect.value
      };

      const result = await window.electron.invoke('convert-pdf-to-images', options);

      if (result.success) {
        this.showSuccess(`Successfully converted PDF to ${result.imageCount} image(s) in:`, result.outputDir);
      } else {
        throw new Error(result.error || 'Failed to convert PDF.');
      }
    } catch (error) {
      console.error('Error converting PDF:', error);
      this.showError(error.message || 'An unknown error occurred.');
    } finally {
      this.hideProgress();
    }
  }

  showProgress() {
    this.progressContainer.classList.remove('hidden');
    this.convertBtn.disabled = true;
  }

  hideProgress() {
    this.progressContainer.classList.add('hidden');
    this.convertBtn.disabled = false;
  }

  showSuccess(message, outputDir) {
    this.resultMessage.innerHTML = `
      <div class="p-4 mb-4 text-sm text-green-700 bg-green-100 dark:bg-green-200 rounded-lg">
        <span class="font-medium">Success!</span> ${message}
        <button class="open-folder-btn mt-2 px-3 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-md hover:bg-green-300 dark:hover:bg-green-700">Open Folder</button>
      </div>
    `;
    this.resultMessage.classList.remove('hidden');

    this.resultMessage.querySelector('.open-folder-btn').addEventListener('click', () => {
      window.electron.send('open-folder', outputDir);
    });
  }

  showError(message) {
    this.resultMessage.innerHTML = `
      <div class="p-4 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-200 rounded-lg">
        <span class="font-medium">Error!</span> ${message}
      </div>
    `;
    this.resultMessage.classList.remove('hidden');
  }

  hideResult() {
    this.resultMessage.classList.add('hidden');
  }

  render() {
    return this.container;
  }
}
