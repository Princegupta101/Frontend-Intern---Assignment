# Form Builder

A dynamic form builder application built with React Remix, Tailwind CSS, and Zustand.

## Features
- Drag-and-drop interface for adding and reordering form fields
- Supported field types: Text, Textarea, Dropdown, Checkbox, Date
- Field configuration (label, placeholder, required, help text, options)
- Real-time preview with responsive views (Desktop, Tablet, Mobile)
- Multi-step form support with validation
- Auto-save to localStorage
- Dark/Light theme toggle
- Shareable form links
- View form submissions
- Undo functionality

## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Build for production: `npm run build`
5. Start production server: `npm run start`

## Deployment
- Deployed on [Vercel/Netlify/Your Preferred Platform]
- Live URL: [Insert live URL here]
- Video walkthrough: [Insert video link here]

## Usage
1. Navigate to `/builder` to create a new form
2. Drag and drop fields from the sidebar
3. Configure field properties in the configuration panel
4. Preview the form in different device views
5. Save the form to generate a shareable link
6. Access the form filler view via the shareable link
7. View submissions at `/responses/:formId`

## Tech Stack
- React Remix
- Tailwind CSS
- Zustand
- react-beautiful-dnd
- TypeScript