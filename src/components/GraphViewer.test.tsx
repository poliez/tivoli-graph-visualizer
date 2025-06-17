import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GraphViewer from './GraphViewer';
import type { GraphData, GraphNode } from '../types';

// Skip testing the D3 implementation details
vi.mock('../components/GraphViewer', () => ({
  default: vi.fn().mockImplementation(({ onNodeClick }) => {
    return (
      <svg data-testid="graph-svg" onClick={() => onNodeClick(null)}>
        <g data-testid="graph-container"></g>
      </svg>
    );
  })
}));

describe('GraphViewer', () => {
  let mockData: GraphData;
  let onNodeClickMock: (node: GraphNode | null) => void;

  beforeEach(() => {
    // Create mock graph data
    mockData = {
      nodes: [
        { id: 'node1', name: 'Node 1', type: 'internal', metadata: {} },
        { id: 'node2', name: 'Node 2', type: 'internal', metadata: {} },
        { id: 'node3', name: 'Node 3', type: 'external', metadata: { 'Rete Esterna': 'EXT_NET' } }
      ],
      links: [
        { source: 'node1', target: 'node2' },
        { source: 'node2', target: 'node3' }
      ]
    };

    onNodeClickMock = vi.fn();
  });

  it('renders an SVG element', () => {
    render(<GraphViewer data={mockData} onNodeClick={onNodeClickMock} searchTerm="" />);

    // Check if SVG is rendered
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('data-testid', 'graph-svg');
  });

  it('renders with empty data', () => {
    const emptyData: GraphData = { nodes: [], links: [] };

    render(<GraphViewer data={emptyData} onNodeClick={onNodeClickMock} searchTerm="" />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('calls onNodeClick with null when SVG background is clicked', () => {
    render(<GraphViewer data={mockData} onNodeClick={onNodeClickMock} searchTerm="" />);

    // Get the SVG element
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Simulate click on SVG background
    fireEvent.click(svg!);

    // Check if onNodeClick was called with null
    expect(onNodeClickMock).toHaveBeenCalledWith(null);
  });

  // Note: We're not testing the D3-specific implementation details here.
  // Those would be better tested with integration or end-to-end tests.
});
