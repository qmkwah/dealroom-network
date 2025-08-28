# Claude Code Implementation Plan: 1.7 Create Basic Layout Components (Header, Footer, Navigation)

## Objective
Develop fundamental layout components to establish the overall page structure and navigation.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Create reusable layout components. This involves creating React components and integrating them into `src/app/layout.tsx`.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Component File Existence**: Verify `src/components/layout/header.tsx`, `src/components/layout/footer.tsx`, and `src/components/layout/navigation.tsx` exist.
    *   **Test Case 2: Layout Integration**: Check that `src/app/layout.tsx` imports and renders these components.
    *   **Test Case 3: Basic Content Rendering**: Write a simple test (e.g., using React Testing Library or Playwright) to assert that specific text (e.g., `Header` or `Footer` text) from these components appears on the page.

3.  **Implement the Task**: 
    *   Create `src/components/layout/header.tsx`:
        ```typescript
        // src/components/layout/header.tsx
        import React from 'react';

        export default function Header() {
          return (
            <header className="bg-gray-800 text-white p-4">
              <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">DealRoom Network</h1>
                {/* Add navigation links here later */}
              </div>
            </header>
          );
        }
        ```
    *   Create `src/components/layout/footer.tsx`:
        ```typescript
        // src/components/layout/footer.tsx
        import React from 'react';

        export default function Footer() {
          return (
            <footer className="bg-gray-800 text-white p-4 mt-8">
              <div className="container mx-auto text-center text-sm">
                &copy; {new Date().getFullYear()} DealRoom Network. All rights reserved.
              </div>
            </footer>
          );
        }
        ```
    *   Create `src/components/layout/navigation.tsx` (initially empty, to be populated later):
        ```typescript
        // src/components/layout/navigation.tsx
        import React from 'react';

        export default function Navigation() {
          return (
            <nav>
              {/* Navigation links will go here */}
            </nav>
          );
        }
        ```
    *   Update `src/app/layout.tsx` to include `Header` and `Footer`:
        ```typescript
        // src/app/layout.tsx
        import type { Metadata } from 'next';
        import { Inter } from 'next/font/google';
        import './globals.css';
        import Header from '@/components/layout/header';
        import Footer from '@/components/layout/footer';

        const inter = Inter({ subsets: ['latin'] });

        export const metadata: Metadata = {
          title: 'DealRoom Network',
          description: 'Professional networking platform for real estate deal makers',
        };

        export default function RootLayout({
          children,
        }: { 
          children: React.ReactNode;
        }) {
          return (
            <html lang="en">
              <body className={inter.className}>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow container mx-auto p-4">
                    {children}
                  </main>
                  <Footer />
                </div>
              </body>
            </html>
          );
        }
        ```

4.  **Run Tests & Verify**: Run `npm run dev` and visually inspect the page in the browser to confirm the header and footer are present. For automated testing, a simple Playwright test could assert the presence of specific text within the header/footer elements on the page.


