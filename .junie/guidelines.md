# Tivoli Workload Graph Visualizer - Developer Documentation

## Table of Contents

1. [Introduction](#1-introduction)
2. [Philosophy & Technology Choices](#2-philosophy--technology-choices)
    1. [Vite (with esbuild)](#vite-with-esbuild)
    2. [React](#react)
    3. [TypeScript](#typescript)
    4. [D3.js](#d3js)
3. [Prerequisites](#3-prerequisites)
4. [Installation & Setup](#4-installation--setup)
5. [Available Scripts](#5-available-scripts)
6. [Project Structure](#6-project-structure)
7. [Architecture & Data Flow](#7-architecture--data-flow)
8. [Key Components](#8-key-components)
9. [Potential Future Improvements](#9-potential-future-improvements)
10. [Coding Guidelines](#10-coding-guidelines)
    1. [General Principles](#general-principles)
    2. [TypeScript](#typescript-1)
    3. [React](#react-1)
    4. [Styling](#styling)
    5. [Linting & Formatting](#linting--formatting)
    6. [Git & Commits](#git--commits)
    7. [Documentation](#documentation)
    8. [Writing Tests](#writing-tests)

## 1\. Introduction

The **Tivoli Workload Graph Visualizer** is a client-side web application designed to analyze and visualize workflows (Nets) from IBM Tivoli Workload Scheduler. The application accepts a set of structured `.csv` files as input, analyzes them, and generates an interactive directed graph of the dependencies between various jobs.

The primary goal is to provide a visual analysis tool that allows users to quickly understand the structure of complex flows, identify critical dependencies, and debug chains of operations.

## 2\. Philosophy & Technology Choices

The application was built following modern front-end development principles, with a focus on performance, maintainability, and an excellent Developer Experience (DX).

* ### Vite (with esbuild)

    * **Why?** Instead of complex configurations like Webpack, Vite was chosen for its incredible speed during development. It leverages native ES modules in the browser and uses **esbuild** (written in Go) for bundling, making it orders of magnitude faster. This results in a nearly instant dev server startup and lightning-fast Hot Module Replacement (HMR), maximizing productivity.

* ### React

    * **Why?** React is the leading library for building declarative, component-based user interfaces. Its mental model (`UI = f(state)`) makes managing complex state (like graph data, user selections, etc.) predictable and easy to debug. The use of hooks (`useState`, `useEffect`, `useMemo`) allows for clean, functional management of state logic and side effects.

* ### TypeScript

    * **Why?** For a data-driven application like this, type safety is not a luxury, but a necessity. TypeScript prevents an entire class of runtime errors, drastically improves autocompletion and code navigation, and serves as living documentation for our data structures (`GraphNode`, `GraphLink`). It makes refactoring safer and onboarding new developers onto the project much easier.

* ### D3.js

    * **Why?** While many "out-of-the-box" charting libraries exist, none offer the flexibility and granular control of D3.js. Since our goal was to create a *custom* and interactive visualization (with drag-and-drop, zoom, highlighting), D3 was the perfect choice. It has been integrated within a React component, letting React manage the main DOM and D3 control the SVG elements inside the graph.

## 3\. Prerequisites

To build and run this project, you must have the following software installed on your machine:

* **Node.js**: The latest LTS (Long-Term Support) version is recommended. You can download it from [nodejs.org](https://nodejs.org/).
* **npm** (Node Package Manager): This is installed automatically with Node.js.

## 4\. Installation & Setup

Follow these steps to get the project running locally:

1.  **Clone the repository:**

    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd tivoli-graph-visualizer
    ```

2.  **Install project dependencies:**
    This command will read the `package.json` file and download all required libraries (React, D3, etc.) into the `node_modules` folder.

    ```bash
    npm install
    ```

3.  **Start the development server:**
    This command will launch the application in development mode with HMR enabled.

    ```bash
    npm run dev
    ```

    The application will be accessible at `http://localhost:5173` (or another port indicated in the terminal).

## 5\. Available Scripts

The `package.json` file defines the following scripts:

* `npm run dev`: Starts the application in development mode.
* `npm run build`: Compiles and optimizes the application for production. The static files will be generated in the `dist/` folder.
* `npm run lint`: Runs ESLint for static code analysis to find potential issues.
* `npm run preview`: Starts a local server to preview the production build. This should be used after running `npm run build`.

## 6\. Project Structure

The codebase is organized to enforce a separation of concerns.

```
.
├── dist/                   # Output directory for the production build
├── node_modules/           # Project dependencies
├── public/                 # Public static assets
└── src/
    ├── components/         # Reusable React components
    │   ├── ExclusionSelector.tsx
    │   ├── FileUploader.tsx
    │   ├── GraphViewer.tsx
    │   ├── NodeDetailPanel.tsx
    │   └── SearchBar.tsx
    ├── services/           # Business logic and data processing
    │   └── graphProcessor.ts
    ├── types/              # TypeScript definitions and interfaces
    │   └── index.ts
    ├── App.css             # Global styles and main layout
    ├── App.tsx             # Root component that orchestrates the application
    └── main.tsx            # Application entry point
```

## 7\. Architecture & Data Flow

The application follows a two-phase flow, decoupling file analysis from graph generation.

**Phase 1: Loading and Analysis**

1.  The user interacts with `FileUploader.tsx` to select the CSV files.
2.  `FileUploader` notifies `App.tsx` (`handleFilesSelected`).
3.  `App.tsx` invokes the `parseAllFiles` function from `graphProcessor.ts`.
4.  `parseAllFiles` reads and parses the CSVs into JSON objects.
5.  `App.tsx` receives the parsed data, saves it to the `parsedData` state, and invokes `extractAllNodeNames` to populate the list of all discovered nodes (`allNodeNames`).
6.  The UI updates, showing the `ExclusionSelector` component populated with the list of all nodes.

**Phase 2: Configuration and Visualization**

1.  The user interacts with `ExclusionSelector.tsx` to choose which nodes to exclude. The selections are saved in the `excludedNodes` state of `App.tsx`.
2.  The user clicks "Generate Graph," invoking `handleGenerateGraph` in `App.tsx`.
3.  `handleGenerateGraph` calls the `buildGraphFromParsedData` function (from `graphProcessor.ts`), passing the parsed data and the list of excluded nodes.
4.  `buildGraphFromParsedData` constructs the final `{ nodes, links }` data structure.
5.  `App.tsx` saves this structure to the `fullGraphData` state and passes it to the `GraphViewer.tsx` component.
6.  `GraphViewer.tsx` uses D3.js to render the interactive graph.

## 8\. Key Components

* **`App.tsx`**: The "brain" of the application. It holds most of the main state, manages the two-phase flow, and enables communication between components.
* **`graphProcessor.ts`**: This is a service, not a component. It contains the "pure" and most complex logic: parsing CSV files and transforming that data into a graph structure. It is intentionally kept separate from the UI.
* **`GraphViewer.tsx`**: The most visually complex component. It encapsulates all D3.js logic for the force-directed graph simulation, rendering SVG nodes/links, and handling user interactions (zoom, pan, drag, click).
* **`ExclusionSelector.tsx`**: An interactive UI component that allows the user to configure the graph easily and intuitively, significantly improving the user experience compared to a plain text input.

## 9\. Potential Future Improvements

The project is solid, but there is always room for improvement:

* **Testing**: Add unit tests for the logic in `graphProcessor.ts` using a framework like [Vitest](https://vitest.dev/). Introduce integration tests for components with [React Testing Library](https://testing-library.com/).
* **Performance on Very Large Graphs**: For graphs with thousands of nodes, SVG rendering can become slow. One could explore rendering to `<canvas>` or WebGL (using libraries like `d3-force-webgl`) for superior performance.
* **Saving/Loading Configuration**: Allow the user to save their list of excluded nodes to a configuration file (`.json`) and reload it in future sessions.
* **Advanced Color-Coding**: Allow nodes to be colored based on specific metadata (e.g., by job `Type` or `Workstation ID`).

## 10\. Coding Guidelines

To maintain code quality and consistency, all contributors are expected to follow these guidelines.

### General Principles
* **Readability First**: Write code that is easy for other humans to understand. Code is read far more often than it is written.
* **Consistency**: Follow the existing patterns and conventions in the codebase. If you introduce a new pattern, document the reasoning.
* **KISS (Keep It Simple, Stupid)**: Avoid over-engineering. Choose the simplest solution that effectively solves the problem.
* **Never commit commented-out code**: If code is no longer needed, remove it. Use version control to retrieve it if necessary.
* **Never commit code that is not tested**: Ensure all new code is covered by tests before committing.

### TypeScript
* **Avoid `any`**: Using `any` defeats the purpose of TypeScript. Use it only as an absolute last resort and add a `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comment explaining why it was necessary. Prefer `unknown` for type-safe unknowns.
* **`interface` vs `type`**:
    * Use `interface` when defining the shape of objects or classes. They are easier to extend.
    * Use `type` for creating union types, intersection types, or aliases for primitive types.
* **Be Explicit**: Explicitly type function return values and complex variables to improve clarity.

### React
* **Functional Components & Hooks**: All new components MUST be functional components using Hooks. Do not write new Class-based components.
* **Component Naming**: Component files and functions must use `PascalCase` (e.g., `MyComponent.tsx`).
* **Props**:
    * Define component props in an `interface` or `type` with a `Props` suffix (e.g., `GraphViewerProps`).
    * Destructure props in the function signature for clarity and easy access.
    ```tsx
    // Good
    const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
      // ...
    };
    ```
* **State Management**: Keep state as local as possible. Lift state up to the nearest common ancestor only when it needs to be shared between components. In this project, `App.tsx` acts as the main state orchestrator.
* **Separation of Concerns**: Keep components focused on rendering JSX. Extract complex, non-rendering logic into custom hooks (`use...`) or helper functions in the `src/services` directory. See `graphProcessor.ts` as the primary example of this principle.

### Styling
* **CSS Naming Convention**: The project currently uses global CSS in `App.css` with a BEM-like naming convention (e.g., `node-detail-sidebar`, `panel-header`, `list-item`). New styles should follow this pattern for consistency.
* **Scoped Styles**: If a new component requires complex and heavily scoped styling, consider using CSS Modules (`*.module.css`) to prevent style conflicts.

### Linting & Formatting
* **Automatic Formatting**: The project is configured with ESLint and Prettier to enforce a consistent code style.
* **Rule #1**: **Always format your code before committing.** Most IDEs (like VSCode) can be configured to "Format on Save", which is the recommended workflow. This automates adherence to style rules. You can also run `npm run lint` to manually check for issues.

### Git & Commits
* **Conventional Commits**: Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This makes the project history readable and allows for automated changelog generation.
    * `feat:` A new feature.
    * `fix:` A bug fix.
    * `docs:` Documentation only changes.
    * `style:` Changes that do not affect the meaning of the code (white-space, formatting, etc.).
    * `refactor:` A code change that neither fixes a bug nor adds a feature.
    * `test:` Adding missing tests or correcting existing tests.
    * **Example:** `feat: add drag-and-drop support to file uploader`

### Documentation

* **Treat Documentation as Code**: This is a non-negotiable principle. Outdated documentation can be more misleading than no documentation at all. Any time a code change impacts the architecture, data flow, or user-facing functionality, the corresponding documentation **must** be updated in the same pull request.
    * **New Feature?** Add a section explaining what it does and how it works.
    * **Changing Data Flow or Architecture?** Update the "Architecture & Data Flow" section and the relevant component descriptions.
    * **Adding a dependency or environment variable?** Update the "Prerequisites" section.
    * A pull request is not considered "complete" if its corresponding documentation is missing or inaccurate.
* **Documentation Location**: All project documentation is located in the `.junie/` and `docs` directories. This includes:
    * `.junie/guidelines.md`: Coding guidelines and best practices.

### Writing Tests

Writing tests is crucial for ensuring the application's stability and preventing regressions. This project uses **Vitest** as the test runner and **React Testing Library (RTL)** for testing
components.

* **Philosophy**: We test application behavior, not implementation details. A good test should resemble how a user interacts with the application and should not break if you refactor a component's
  internal logic without changing its observable behavior.

* **What to Test**:
    * **Utility Functions (`/services`)**: Pure logic functions, like those in `graphProcessor.ts`, are perfect candidates for unit tests. Provide them with sample data (including edge cases) and
      assert that the output is correct.
    * **React Components (`/components`)**: Use RTL to test from a user's perspective.
        * Does the component render the correct initial content based on its props?
        * When a user performs an action (e.g., clicks a button, types in a field), does the component respond as expected (e.g., calls a callback function, displays new information)?
        * Is the component accessible? Prioritize finding elements by their accessible role, label, or text content.

* **Example Component Test**: A test for a component like `SearchBar` should verify that a user can type into it and that the `onSearch` callback is eventually fired with the correct value.

    ```tsx
    // src/components/SearchBar.test.tsx
    import { render, screen, fireEvent, waitFor } from '@testing-library/react';
    import { describe, it, expect, vi } from 'vitest';
    import SearchBar from './SearchBar';

    describe('SearchBar', () => {
      it('should call onSearch with the input value after the user stops typing', async () => {
        const onSearchMock = vi.fn();
        render(<SearchBar onSearch={onSearchMock} />);

        const input = screen.getByLabelText('Cerca e Isola Job');
        
        // Simulate user typing
        fireEvent.change(input, { target: { value: 'BNRUN' } });

        // Wait for the debounce timer to complete
        await waitFor(() => {
          expect(onSearchMock).toHaveBeenCalledWith('BNRUN');
        }, { timeout: 400 }); // Timeout should be > debounce time
      });
    });
    ```

* **File Naming**: Test files should be co-located with the file they are testing and named with a `.test.tsx` suffix (e.g., `SearchBar.test.tsx`).

* **Running Tests**: Considering the content of `package.json`:
    ```json
    "scripts": {
      "test": "vitest run",
      "test:watch": "vitest"
    }
    ```
  Then, run tests from the command line:
    ```bash
    # Run all tests once
    npm test

    # Run tests in watch mode for TDD
    npm run test:watch
    ```
