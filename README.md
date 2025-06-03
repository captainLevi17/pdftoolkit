# PDF Toolkit

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A lightweight, AI-assisted Windows desktop application for PDF manipulation built with Electron, Tailwind CSS, and Node.js. The application features a modern, responsive UI with secure IPC communication between the main and renderer processes.

## 📋 Features

- Merge multiple PDFs into one
- Split PDFs into multiple files
- Compress PDFs to reduce file size
- Convert PDFs to JPG images
- Convert JPG/PNG images to PDF
- Convert PDFs to Word documents

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Git (for version control)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pdftoolkit.git
   cd pdftoolkit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the CSS:
   ```bash
   npm run build:css
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   This will start the Electron app in development mode with DevTools open for debugging.

### Development Workflow

- The application uses a secure IPC communication pattern between the main and renderer processes
- Main process code is in `src/main/`
- Renderer process code is in `src/renderer/`
- Shared code and preload scripts are in `src/shared/`
- Run `npm run build:css` after making changes to Tailwind CSS configuration

## 🔒 Security

The application follows security best practices:

- Context Isolation: Enabled
- Node Integration: Disabled in renderer
- Preload Script: Used to safely expose limited Node.js APIs
- CSP: Implemented to prevent XSS attacks
- File Path Validation: Prevents directory traversal attacks

## 🐛 Debugging

1. **Main Process**: Check the terminal where you ran `npm run dev`
2. **Renderer Process**: Use DevTools (View → Toggle Developer Tools)
3. **IPC Debugging**: Logs are available in both main and renderer processes

## 🛠 Development

### Project Structure

```
pdftoolkit/
├── src/
│   ├── main/           # Electron main process
│   │   └── index.js    # Main process entry point
│   ├── renderer/       # Electron renderer process (UI)
│   │   ├── assets/     # Static assets (images, icons, etc.)
│   │   ├── css/        # Tailwind and custom styles
│   │   ├── js/         # Frontend JavaScript
│   │   └── index.html  # Main HTML file
│   └── shared/         # Shared code between processes
│       └── preload.js  # Preload script for secure IPC
├── .gitignore          # Git ignore file
├── package.json        # Project configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
├── README.md           # This file
├── spec.md            # Project specification
└── TODO.md            # Development roadmap
```

### Available Scripts

- `npm run dev` - Start development server with hot-reload for CSS and auto-reload for Electron
- `npm run build:css` - Build the production CSS
- `npm run build` - Build the application for production
- `npm start` - Start the production application
- `npm test` - Run tests (to be implemented)

## 📦 Dependencies

### Main Dependencies

- `electron`: Core framework for building cross-platform desktop apps
- `electron-builder`: Package and build a distributable app
- `tailwindcss`: Utility-first CSS framework
- `pdf-lib`: PDF manipulation library
- `sharp`: High-performance image processing
- `mammoth`: Convert Word documents to HTML/Markdown

### Development Dependencies

- `electron-reloader`: Hot reload for Electron during development
- `concurrently`: Run multiple commands concurrently
- `cross-env`: Set environment variables cross-platform
- `autoprefixer`: Add vendor prefixes to CSS rules
- `postcss`: CSS processing

## 🏗 Project Status

- **Current Version**: 0.2.0 (See [CHANGELOG.md](CHANGELOG.md) for details)
- **Development Phase**: Core application setup complete, implementing PDF features
- **Next Steps**: Implement PDF manipulation features (merging, splitting, etc.)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before making a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏗 Building for Production

To create a production build:

```bash
# Build the CSS
npm run build:css

# Build the application
npm run build

# The output will be in the 'release' directory
```

## 📝 Documentation

- [Project Specification](spec.md) - Detailed project requirements and specifications
- [Development Roadmap](todo.md) - Current progress and upcoming features
- [Changelog](CHANGELOG.md) - History of changes and releases

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

📅 Last updated: June 3, 2025
