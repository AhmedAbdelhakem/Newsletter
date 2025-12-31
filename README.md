# Newsletter Builder 📧

A powerful, drag-and-drop newsletter builder built with **React** and **Editor.js**. Design responsive, email-ready HTML templates with advanced layout capabilities, global styling options, and real-time preview, then export or send test emails directly.

![Newsletter Builder Preview]

## 🚀 Key Features

*   **Drag & Drop Interface**: Intuitive block-based editor powered by [Editor.js](https://editorjs.io/).
*   **Rich Content Blocks**:
    *   **Text & Headings**: Rich text formatting with custom typography.
    *   **Images**: Custom width, border radius, and shadow controls.
    *   **Videos**: Embed video files (mp4, webm) with poster images.
    *   **Buttons**: Fully customizable colors, padding, radius, alignment, and full-width options.
    *   **Divider & Spacer**: Layout utilities for spacing and separation.
*   **Advanced Layout System**:
    *   **Rows**: Full-width sections with background color/image/video and padding support.
    *   **Columns**: 2 or 3 column layouts.
    *   **Nested Layouts**: Create rows and columns **inside** columns for complex grids.
*   **Global Styling & Theming**:
    *   **Page Background**: Set a global background color, image, or video for the email outer wrapper.
    *   **Content Background**: Set a specific background for the email content card.
    *   **Dark Mode Support**: Enable dark mode and define custom dark-themed colors (Page, Content, Text) to ensure perfect rendering in dark-mode clients.
*   **Live Preview, Export & Testing**:
    *   **Instant Preview**: See your changes in real-time.
    *   **Export HTML**: Download the production-ready HTML file.
    *   **Copy Code**: One-click button to copy HTML to clipboard.
    *   **Email Testing**: Integrated integration with **Nodemailer** to send test emails to Ethereal (fake inbox) or Gmail.

## 🛠️ Tech Stack

*   **Frontend**: React.js, Vite
*   **Editor Engine**: Editor.js (Custom Block implementations)
*   **Icons**: Lucide React
*   **Backend**: Node.js, Express (for email sending API)
*   **Email Engine**: Nodemailer
*   **Styling**: Vanilla CSS (Scoped & Injected)

## 📂 Project Structure

```
.
├── email-server.mjs      # Node.js backend for sending emails
├── public/               # Static assets
├── src/
│   ├── blocks/           # Custom Editor.js Block Components
│   │   ├── ButtonBlock.js
│   │   ├── ColumnsBlock.js  # Handles Rows, Columns, and Nested Layouts
│   │   ├── DividerBlock.js
│   │   ├── ImageUrlBlock.js
│   │   ├── SpacerBlock.js
│   │   └── VideoBlock.js    # Video embedding block
│   ├── components/       # React UI Components
│   │   ├── BlockPalette.jsx # Sidebar with drag-and-drop blocks
│   │   ├── Editor.jsx       # Editor.js wrapper & configuration
│   │   ├── PageSettings.jsx # Global Style & Dark Mode settings panel
│   │   ├── Preview.jsx      # Live HTML preview
│   │   ├── Toolbar.jsx      # Bottom toolbar (Export/Copy/Reset)
│   │   └── SendTestModal.jsx
│   ├── utils/
│   │   └── emailRenderer.js # Converts Editor data to Email-safe HTML table layout
│   ├── App.jsx           # Main application layout
│   └── main.jsx          # Entry point
└── package.json
```

## 🏁 Getting Started

### Prerequisites

*   Node.js (v14 or higher)
*   npm

### Installation

1.  Clone the repository.
2.  Install dependencies:

```bash
npm install
```

### Running the Application

You need to run both the Frontend (Vite) and the Backend (Email Server) concurrently.

**1. Start the Frontend:**

```bash
npm run dev
```
*Accessible at `http://localhost:5173`*

**2. Start the Backend (for Test Emails):**

```bash
node email-server.mjs
```
*Runs on `http://localhost:3001`*

## 📧 Email Configuration

The application uses **Ethereal Email** by default, which creates a fake inbox for every test email sent—perfect for development without spamming real accounts. The link to the fake inbox is logged in the browser console and server terminal.

To send real emails via **Gmail**, create a `.env` file (or set environment variables) with:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-google-app-password
```
*(Note: Use an App Password, not your login password. Go to Google Account > Security > 2-Step Verification > App Passwords)*

## 📖 Usage Guide

1.  **Add Blocks**: Drag items from the **Blocks** palette on the left into the Editor area.
2.  **Global Styles**: Click the **"Global Style"** tab in the sidebar to set:
    *   Page Background (Outer area)
    *   Content Background (Inner card)
    *   Dark Mode Colors
3.  **Create Layouts**:
    *   Drag a **Columns** block for side-by-side content.
    *   **Customize**: Click the gear/settings icons on blocks to adjust padding, background colors, and alignment.
    *   **Nest**: Inside a column, click "Add Item" and select **"Row"** to create a nested grid.
4.  **Preview**: Check the **Preview** pane on the right to see how it looks.
5.  **Send Test**: Click **"Send Test"** in the Preview pane, enter an email, and check your inbox (or the Ethereal link returned).
6.  **Export**:
    *   **Export HTML**: Download the file.
    *   **Copy HTML**: Copy the code to clipboard.

## 🧩 Modifying & Extending

*   **New Blocks**: Create a new class in `src/blocks/` and register it in `src/components/Editor.jsx`.
*   **Renderer**: Update `src/utils/emailRenderer.js` to define how the new block converts to HTML table structures.

---
*Built with ❤️ using React & Editor.js*
