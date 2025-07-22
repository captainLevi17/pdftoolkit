const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

class PDFUtils {
  /**
   * Merge multiple PDFs into a single PDF with progress tracking
   * @param {Array<string>} pdfPaths - Array of paths to PDF files
   * @param {string} outputPath - Path where the merged PDF will be saved
   * @param {Function} [progressCallback] - Optional callback for progress updates (0-1)
   * @returns {Promise<{success: boolean, message: string, outputPath: string}>}
   */
  static async mergePDFs(pdfPaths, outputPath, progressCallback) {
    const updateProgress = (progress) => {
      if (typeof progressCallback === 'function') {
        progressCallback(progress);
      }
    };

    try {
      if (!pdfPaths || !Array.isArray(pdfPaths) || pdfPaths.length === 0) {
        throw new Error('No PDF files provided for merging');
      }

      if (pdfPaths.length < 2) {
        throw new Error('At least 2 PDFs are required for merging');
      }

      updateProgress(0);
      
      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();
      const totalFiles = pdfPaths.length;
      let processedFiles = 0;

      // Process each PDF file
      for (const [index, pdfPath] of pdfPaths.entries()) {
        try {
          // Read the PDF file
          const pdfBytes = await fs.readFile(pdfPath);
          
          // Load the PDF document
          const pdfDoc = await PDFDocument.load(pdfBytes);
          
          // Copy all pages from the current PDF to the merged PDF
          const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          pages.forEach(page => mergedPdf.addPage(page));
          
          // Update progress based on files processed
          processedFiles++;
          updateProgress(processedFiles / (totalFiles + 1)); // +1 for the final save step
          
        } catch (error) {
          console.error(`Error processing ${pdfPath}:`, error);
          throw new Error(`Failed to process ${path.basename(pdfPath)}: ${error.message}`);
        }
      }

      // Save the merged PDF
      updateProgress(0.95); // Almost done, just saving now
      const mergedPdfBytes = await mergedPdf.save();
      await fs.writeFile(outputPath, mergedPdfBytes);
      
      updateProgress(1); // Done!

      return {
        success: true,
        message: 'PDFs merged successfully',
        outputPath: outputPath
      };
    } catch (error) {
      console.error('Error merging PDFs:', error);
      // Ensure progress is set to 1 on error to reset any progress indicators
      updateProgress(1);
      
      return {
        success: false,
        message: error.message || 'Failed to merge PDFs',
        outputPath: null
      };
    }
  }

  /**
   * Validate if a file is a valid PDF
   * @param {string} filePath - Path to the file
   * @returns {Promise<boolean>}
   */
  static async isValidPDF(filePath) {
    try {
      const bytes = await fs.readFile(filePath);
      await PDFDocument.load(bytes);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = PDFUtils;
