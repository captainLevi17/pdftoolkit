# 📄 SPEC.md - PDF Toolkit Desktop Application

---

## 🧩 Overview

**PDF Toolkit** is a lightweight, AI-assisted Windows desktop application built with **Electron**, **Tailwind CSS**, and **Node.js**. It provides essential PDF manipulation tools in a single user-friendly interface. The app is designed to run offline, with performance, simplicity, and security in mind.

---

## 🖥️ Platform

- **Operating System**: Windows 10 and above
- **Architecture**: x64
- **Format**: Portable `.exe` and Installer version

---

## 📦 Tech Stack

| Layer            | Tech                         |
|------------------|------------------------------|
| UI               | HTML + Tailwind CSS          |
| Logic/Frontend   | JavaScript (Electron renderer) |
| Backend          | Node.js (Electron main process) |
| PDF Processing   | `pdf-lib`, `pdfjs`, `sharp`, `mammoth`, etc. |
| Packaging        | `electron-builder`           |

---

## 🔧 Core Features

### 1. PDF Merger
- Select multiple PDFs
- Drag-and-drop to reorder
- Merge into a single PDF
- Output location selection

### 2. PDF Splitter
- Select PDF
- Choose pages or range (e.g. 1–3, 5, 7–9)
- Output each selection as a separate PDF

### 3. PDF Compressor
- Accepts one or more PDF files
- Compress images and remove metadata
- Offer quality settings (Low / Medium / High)

### 4. PDF to JPG
- Select a PDF
- Export each page as separate high-quality JPG images
- Choose output folder

### 5. JPG to PDF
- Select one or more JPG/PNG images
- Reorder before converting
- Merge into one PDF

### 6. PDF to Word
- Convert .pdf file into editable .docx format
- Use open-source libraries or external CLI/API tools
- Preserve text and simple formatting (bold, italics, headings)

---

## 🧭 Navigation & UI Layout

- **Sidebar or Top Nav**:
  - Home
  - Merge PDF
  - Split PDF
  - Compress PDF
  - PDF to JPG
  - JPG to PDF
  - PDF to Word
  - Settings

- **Main Pane**:
  - Dynamic UI with file pickers, drag-and-drop zones, action buttons, and progress bars
  - Display file previews and process logs

---

## 🛠 App Settings

- Theme toggle (light/dark)
- Default output folder
- Retain last used folders
- Check for updates (manual)

---

## 🔐 Security

- Disable `nodeIntegration` in renderer
- Enable `contextIsolation`
- Sanitize file paths and file types
- No internet access unless explicitly required (e.g., update check)
- Use secure temp directories

---

## 🚀 Packaging & Distribution

- Use `electron-builder` to generate:
  - `.exe` portable version
  - `.exe` installer with optional desktop/start menu shortcut
- Add icon and branding
- (Optional) Code signing with digital certificate

---

## 🧪 Testing Plan

- Manual testing for each tool with various files
- Edge cases: corrupted PDFs, non-image files, large files
- Verify output file quality and correctness
- Automated tests (optional) with `Jest` or `Spectron`

---

## 📈 Future Enhancements

- Drag-and-drop support in all modules
- Batch processing for all tools
- OCR support for scanned PDFs
- Multilingual UI
- Cloud sync or integration (Dropbox, Google Drive)

---

## 📂 File Structure (Planned)

