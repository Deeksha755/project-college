# React Quiz App with Admin Panel

A React quiz app built with Vite that supports a quiz view and an admin panel for managing quiz questions.

## Features

- React-based UI with quiz and admin tabs
- Loads initial quiz questions from `public/quiz-data.json`
- Supports adding and removing quiz questions in the admin panel
- Stores admin changes in localStorage for browser persistence
- Shows immediate correct/incorrect feedback during the quiz
- Displays a results summary at the end of the quiz

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the URL shown by Vite in your browser.

## Deploy to Vercel

1. Connect this repository to Vercel.
2. Set the build command to:
   ```bash
   npm run build
   ```
3. Set the output directory to:
   ```bash
   dist
   ```

Vercel will use the `vercel.json` build settings for deployment.

## Notes

- The admin panel is accessible via the `Admin` tab.
- Changes are saved in browser storage and will remain until localStorage is cleared.
- The app is responsive and works on desktop and mobile browsers.
