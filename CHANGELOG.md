# Changelog

All notable changes to the PDF Toolkit project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2025-07-28
### Added
- PDF Compressor feature with adjustable compression levels (low, medium, high)
- Support for customizing compression settings (image quality, metadata removal, DPI settings)
- Client-side PDF processing using PDF.js and pdf-lib
- Progress tracking during PDF compression with visual feedback
- File size comparison between original and compressed PDF
- Option to open or locate the compressed file after processing
- Persistent storage of compression settings and preferences
- Responsive UI with dark mode support
- Support for both drag-and-drop and file selection
- Detailed error handling and user feedback
- Fallback mechanisms for different compression scenarios
- Support for image-heavy PDFs with configurable DPI settings
- Automatic cleanup of temporary files
- Integration with system file explorer for opening files/folders

## [0.4.0] - 2025-07-23
### Added
- PDF Splitter feature with page range selection
- Support for extracting single pages, page ranges, or all pages
- Drag-and-drop file upload for PDF splitting
- Progress tracking during PDF splitting
- Enhanced success/error notifications with smooth animations
- Output directory selection for saving split PDF files
- Persistent storage of user's preferred output directory
- Improved error handling and user feedback
- Support for both main process and client-side PDF processing
- Fallback mechanism for PDF processing when main process is unavailable

## [0.3.0] - 2025-07-22
### Added
- PDF Merger feature with drag-and-drop support
- File selection and reordering interface
- Progress tracking during PDF merging
- Success/error notifications with user feedback
- "Open File" button to view merged PDFs
- Secure IPC communication between main and renderer processes
- Preload script for safe API exposure
- Error handling and logging system
- Theme support (light/dark mode)
- Development tools integration

### Fixed
- Resolved IPC channel whitelisting issues
- Fixed module loading in renderer process
- Improved error handling for file operations

### Changed
- Updated Electron configuration for better security
- Improved project structure and code organization
- Enhanced error handling and debugging
- Updated documentation

## [0.2.0] - 2025-06-03
### Added
- Basic Electron application structure with main and renderer processes
- Tailwind CSS integration with PostCSS
- Basic UI layout with responsive design
- Development environment setup with hot-reloading
- Build configuration for production
- Project documentation (README.md, CHANGELOG.md)
- Git configuration (.gitignore, .gitattributes)

### Fixed
- N/A

### Removed
- N/A

---
## [0.1.0] - 2025-06-03
### Added
- Initial project setup
- Basic documentation
- Development environment configuration

---
*Note: This changelog will be updated as the project progresses.*
