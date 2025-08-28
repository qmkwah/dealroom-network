# Claude Code Implementation Plan: 1.2 Setup Tailwind CSS with Custom Configuration

## Objective
Integrate Tailwind CSS into the Next.js project and configure it for custom styling, including `tailwind.config.js` and `globals.css`.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Integrate Tailwind CSS. This involves installing necessary packages, initializing Tailwind, and configuring `tailwind.config.js` and `globals.css`.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Tailwind Configuration File**: Verify `tailwind.config.js` exists and contains the correct `content` array for Next.js files.
    *   **Test Case 2: Global CSS Import**: Check that `src/app/globals.css` imports Tailwind's base, components, and utilities.
    *   **Test Case 3: Basic Tailwind Class Application**: Create a temporary component (e.g., `src/app/test-tailwind.tsx`) and apply a simple Tailwind class (e.g., `text-blue-500`). Then, write a test (e.g., using a simple DOM check in a Playwright test later) to confirm the style is applied. For now, this can be a visual inspection.

3.  **Implement the Task**: Execute the following shell commands and file modifications:
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```
    Then, modify `tailwind.config.js` to include the content paths:
    ```javascript
    // tailwind.config.js
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
        extend: {},
      },
      plugins: [],
    }
    ```
    Finally, update `src/app/globals.css`:
    ```css
    /* src/app/globals.css */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    /* Add any custom global styles here */
    ```

4.  **Run Tests & Verify**: Check the file contents and visually inspect a component with Tailwind classes applied after running `npm run dev`.


