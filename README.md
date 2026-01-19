# Newsletter Builder 📧

A professional, high-fidelity **Newsletter Builder** powered by **React**, **Tailwind CSS v4**, and **Editor.js**. Design stunning, responsive, email-ready HTML templates with a smooth drag-and-drop workspace, real-time preview, and integrated email testing.

![Newsletter Builder Preview]

## ✨ Key Features

*   **Premium UI/UX**: A clean, modern interface built with **Tailwind CSS v4** featuring a 3-column workspace (Blocks, Editor, Preview).
*   **Intuitive Drag & Drop**: Block-based editing powered by [Editor.js](https://editorjs.io/).
*   **History Management**: Full **Undo/Redo** support for a seamless design experience.
*   **Flexible Layouts**:
    *   **Advanced Columns**: Side-by-side content (up to 3 columns) with nesting support.
    *   **Rows**: Full-width sections with background colors, images, and video support.
*   **Global Design System**:
    *   **Theming**: Set global background colors and card styles.
    *   **Typography**: Deep tunes for font weight, size, and alignment.
    *   **Dark Mode**: Native support for dark-mode email clients with customizable color overrides.
*   **Live Preview & Interactivity**:
    *   **Resizable Workspace**: Drag to expand your editor or preview pane.
    *   **Device Toggles**: Instant Desktop vs. Mobile view switching.
*   **Production-Ready Output**:
    *   **Export HTML**: Download battle-tested, table-based HTML.
    *   **Direct Testing**: Integrated **Nodemailer** integration to send test emails instantly.

## 🛠️ Tech Stack

*   **Frontend**: React 19, Vite
*   **Styling**: **Tailwind CSS v4** (Utility-first, high-fidelity design)
*   **Editor**: Editor.js (Custom Block implementations)
*   **Backend**: Node.js, Express (Email sending API)
*   **Email**: Nodemailer
*   **Icons**: Lucide React

## 🏁 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm

### Installation

1.  Clone the repository.
2.  Install dependencies:

```bash
npm install
```

### Running the Application

This project requires running the frontend and the email server concurrently.

**1. Start the Frontend & Tailwind Watcher:**

```bash
npm run dev
```
*Wait for Tailwind to compile. Access at `http://localhost:5173`*

**2. Start the Backend Email Server:**

```bash
node email-server.mjs
```
*Accessible at `http://localhost:3001`*

## 📂 Project Structure

```
├── email-server.mjs      # Node.js backend for sending emails
├── src/
│   ├── blocks/           # Custom Editor.js Block Components
│   ├── tunes/            # Editor.js Block Tunes (Alignment, Typography)
│   ├── components/       # Main UI Components (Header, Palette, Preview, etc.)
│   ├── utils/            # Email-safe HTML rendering logic
│   ├── input.css         # Tailwind v4 entry point
│   ├── main.jsx          # Entry point
│   └── App.jsx           # Application Layout & State
└── tailwind.config.js    # Tailwind configuration
```

## 📖 Usage Guide

1.  **Build Your Layout**: Drag blocks from the left panel into the editor.
2.  **Customize Content**: Click any block to reveal controls for typography, colors, and layout.
3.  **Manage Design**: Use the **Global Style** settings for page-wide colors and dark mode support.
4.  **Test & Export**: Resize the preview pane to check responsiveness, then **Export HTML** or **Send Test** to see it in action.

---
*Built for professional email design.*