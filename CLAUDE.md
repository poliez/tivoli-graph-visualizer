# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production (outputs to dist/)
- `npm run preview` - Preview production build locally

**Code Quality:**
- `npm run lint` - Run ESLint on TypeScript/TSX files

**Testing:**
- `npm run test` - Run all tests once with Vitest
- `npm run test:watch` - Run tests in watch mode

## Architecture Overview

This is a client-side React application that analyzes and visualizes IBM Tivoli Workload Scheduler data through interactive directed graphs.

### Core Flow
1. **File Upload & Parsing** (`src/services/graphProcessor.ts`): Users upload CSV files which are parsed using Papa Parse
2. **Graph Generation**: Two modes available:
   - Full graph with all dependencies (internal/external)
   - External predecessors only mode (jobs with external dependencies)
3. **Visualization** (`src/components/GraphViewer.tsx`): Interactive D3.js-based graph with zoom, pan, drag
4. **Filtering & Search**: Filter by operation type, exclude nodes, search for specific jobs

### Key Components Structure
- **App.tsx**: Main orchestrator with multi-phase workflow (upload → configure → generate → visualize)
- **FileUploader**: Handles CSV file uploads with classification by filename keywords
- **ExclusionSelector**: Multi-select interface for excluding specific jobs
- **OperationTypeFilter**: Filter jobs by type (JOB, LOG, JOBZC, etc.)
- **GraphViewer**: D3.js force-directed graph visualization
- **NodeDetailPanel**: Sidebar showing detailed node information
- **SearchBar**: Filters graph to show only nodes connected to searched job

### Data Processing Pipeline
1. **parseAllFiles()**: Parses 4 required CSV types (operations, internal relations, external predecessors/successors) plus optional operator instructions and additional external files
2. **buildGraphFromParsedData()** or **buildExternalPredecessorsGraph()**: Converts parsed data to graph structure
3. **filterGraph()**: Implements bidirectional graph traversal for search functionality

### File Classification System
The app auto-classifies uploaded CSV files by filename keywords:
- "Operazioni" → operations data
- "Relazioni Interne" → internal dependencies  
- "Relazioni Esterne Predecessori" → external predecessor dependencies
- "Relazioni Esterne Successori" → external successor dependencies
- "Operator Instructions" → operator instructions (optional)

### TypeScript Types
All data structures are strongly typed in `src/types/index.ts`:
- `GraphNode`: Extends D3 simulation node with metadata
- `GraphData`: Complete graph structure (nodes + links)
- `ParsedData`: Intermediate parsed CSV data
- Various CSV data interfaces (OperationData, InternalRelationData, etc.)

### Testing Setup
- Uses Vitest with jsdom environment
- Testing Library for React components
- Jest DOM matchers configured in `src/test/setup.ts`
- All components have corresponding `.test.tsx` files

### Build & Deployment
- Vite for build tooling and dev server
- TypeScript with strict configuration
- ESLint with React hooks and refresh plugins
- Configured for GitHub Pages deployment (base path conditional on GITHUB_PAGES env var)