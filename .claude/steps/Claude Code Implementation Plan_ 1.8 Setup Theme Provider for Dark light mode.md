# Claude Code Implementation Plan: 1.8 Setup Theme Provider for Dark/Light Mode

## Objective
Implement a theme provider to allow users to switch between dark and light modes, enhancing user experience.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Provide dark/light mode functionality. This involves installing `next-themes`, configuring `tailwind.config.js` for dark mode, and creating a `ThemeProvider` component.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: `next-themes` Installation**: Verify `next-themes` is listed in `package.json` dependencies.
    *   **Test Case 2: Tailwind Dark Mode Configuration**: Check `tailwind.config.js` for `darkMode: 'class'`.
    *   **Test Case 3: Theme Provider Existence**: Verify `src/lib/providers/theme-provider.tsx` exists.
    *   **Test Case 4: Theme Switching Functionality**: (Requires E2E test) Simulate clicking a theme toggle button and assert that the `html` tag gains/loses the `dark` class, and a component with `dark:` styles changes appearance.

3.  **Implement the Task**: 
    *   Install `next-themes`:
        ```bash
        npm install next-themes
        ```
    *   Modify `tailwind.config.js` to enable dark mode:
        ```javascript
        // tailwind.config.js
        /** @type {import(\'tailwindcss\').Config} */
        module.exports = {
          darkMode: [\'class\'], // Add this line
          content: [
            \'./app/**/*.{js,ts,jsx,tsx,mdx}\',
            \'./pages/**/*.{js,ts,jsx,tsx,mdx}\',
            \'./components/**/*.{js,ts,jsx,tsx,mdx}\',
            \'./src/**/*.{js,ts,jsx,tsx,mdx}\',
          ],
          theme: {
            extend: {},
          },
          plugins: [],
        }
        ```
    *   Create `src/lib/providers/theme-provider.tsx`:
        ```typescript
        // src/lib/providers/theme-provider.tsx
        \'use client\';

        import * as React from \'react\';
        import { ThemeProvider as NextThemesProvider } from \'next-themes\';
        import { type ThemeProviderProps } from \'next-themes/dist/types\';

        export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
          return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
        }
        ```
    *   Wrap your `RootLayout` in `src/app/layout.tsx` with `ThemeProvider`:
        ```typescript
        // src/app/layout.tsx
        import type { Metadata } from \'next\';
        import { Inter } from \'next/font/google\';
        import \'./globals.css\';
        import Header from \'@/components/layout/header\';
        import Footer from \'@/components/layout/footer\';
        import { ThemeProvider } from \'@/lib/providers/theme-provider\'; // Import ThemeProvider

        const inter = Inter({ subsets: [\'latin\'] });

        export const metadata: Metadata = {
          title: \'DealRoom Network\',
          description: \'Professional networking platform for real estate deal makers\',
        };

        export default function RootLayout({
          children,
        }: { 
          children: React.ReactNode;
        }) {
          return (
            <html lang=\

