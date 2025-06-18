# Tivoli Workload Graph Visualizer

A client-side web application designed to analyze and visualize workflows (Nets) from IBM Tivoli Workload Scheduler. The application accepts a set of structured `.csv` files as input, analyzes them, and generates an interactive directed graph of the dependencies between various jobs.

## Features

- Upload and parse CSV files from Tivoli Workload Scheduler
- Interactive graph visualization with D3.js
- Filter nodes by type and exclusion lists
- Search and highlight specific nodes
- Detailed node information panel
- Zoom, pan, and drag functionality

## Live Demo

You can access the live application at: [https://poliez.github.io/tivoli-graph-visualizer/](https://poliez.github.io/tivoli-graph-visualizer/)

## Development

### Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/poliez/tivoli-graph-visualizer.git
   cd tivoli-graph-visualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Deployment

This project is configured to automatically deploy to GitHub Pages when changes are pushed to the main branch. The deployment is handled by a GitHub Actions workflow.

### Manual Deployment

If you need to deploy manually, you can run:

```bash
npm run build
```

Then deploy the `dist` directory to your web server.

## Technology Stack

- [Vite](https://vitejs.dev/) - Build tool and development server
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [D3.js](https://d3js.org/) - Data visualization library
- [Papa Parse](https://www.papaparse.com/) - CSV parsing library
