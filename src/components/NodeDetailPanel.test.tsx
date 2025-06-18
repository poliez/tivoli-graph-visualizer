import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NodeDetailPanel from './NodeDetailPanel';
import type { GraphNode, GraphData } from '../types';

describe('NodeDetailPanel', () => {
  const mockNode: GraphNode = {
    id: 'JOB1',
    name: 'Test Job',
    type: 'internal',
    metadata: {
      'Nome Job': 'Test Job',
      'Tipo': 'COMMAND',
      'Descrizione': 'A test job',
      'Istruzioni': 'Some instructions',
      // D3 properties that should be filtered out
      x: 100,
      y: 200,
      vx: 0.5,
      vy: -0.3,
      index: 1
    }
  };

  const mockExternalNode: GraphNode = {
    id: 'EXT_JOB1',
    name: 'External Job 1',
    type: 'external',
    metadata: {
      'Nome Job': 'External Job 1',
      'Net': 'EXT_NET'
    }
  };

  const mockGraphData: GraphData = {
    nodes: [
      mockNode,
      mockExternalNode,
      {
        id: 'JOB2',
        name: 'Another Job',
        type: 'internal',
        metadata: {}
      }
    ],
    links: [
      {
        source: 'JOB1',
        target: 'EXT_JOB1'
      }
    ]
  };

  it('renders correctly with node details', () => {
    render(<NodeDetailPanel node={mockNode} graphData={mockGraphData} onClose={() => {}} />);

    // Check if the node name is displayed in the header
    expect(screen.getByText('Dettagli: Test Job')).toBeInTheDocument();

    // Check if metadata is displayed
    expect(screen.getByText('Nome Job', { selector: 'dt' })).toBeInTheDocument();
    expect(screen.getByText('Test Job', { selector: 'dd' })).toBeInTheDocument();

    expect(screen.getByText('Tipo', { selector: 'dt' })).toBeInTheDocument();
    expect(screen.getByText('COMMAND', { selector: 'dd' })).toBeInTheDocument();

    expect(screen.getByText('Descrizione', { selector: 'dt' })).toBeInTheDocument();
    expect(screen.getByText('A test job', { selector: 'dd' })).toBeInTheDocument();

    expect(screen.getByText('Istruzioni', { selector: 'dt' })).toBeInTheDocument();
    expect(screen.getByText('Some instructions', { selector: 'dd' })).toBeInTheDocument();
  });

  it('does not display D3-specific properties', () => {
    render(<NodeDetailPanel node={mockNode} graphData={mockGraphData} onClose={() => {}} />);

    // D3 properties should not be displayed
    expect(screen.queryByText('x')).not.toBeInTheDocument();
    expect(screen.queryByText('y')).not.toBeInTheDocument();
    expect(screen.queryByText('vx')).not.toBeInTheDocument();
    expect(screen.queryByText('vy')).not.toBeInTheDocument();
    expect(screen.queryByText('index')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(<NodeDetailPanel node={mockNode} graphData={mockGraphData} onClose={onCloseMock} />);

    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);

    // Check if onClose was called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('handles empty or undefined metadata values', () => {
    const nodeWithEmptyValues: GraphNode = {
      id: 'JOB2',
      name: 'Empty Job',
      type: 'internal',
      metadata: {
        'Empty Property': '',
        'Undefined Property': undefined
      }
    };

    render(<NodeDetailPanel node={nodeWithEmptyValues} graphData={mockGraphData} onClose={() => {}} />);

    // Check if empty values are displayed as 'N/D'
    expect(screen.getByText('Empty Property')).toBeInTheDocument();
    expect(screen.getByText('N/D', { selector: 'dd' })).toBeInTheDocument();

    expect(screen.getByText('Undefined Property')).toBeInTheDocument();
    // There should be at least one 'N/D' value
    const ndValues = screen.getAllByText('N/D', { selector: 'dd' });
    expect(ndValues.length).toBeGreaterThan(0);
  });

  it('displays external dependencies when they exist', () => {
    render(<NodeDetailPanel node={mockNode} graphData={mockGraphData} onClose={() => {}} />);

    // Check if the external dependencies section is displayed
    expect(screen.getByText('Dipendenze Esterne')).toBeInTheDocument();

    // Check if the external dependency is listed
    expect(screen.getByText('External Job 1')).toBeInTheDocument();
  });

  it('does not display external dependencies section when none exist', () => {
    // Create a graph with no external dependencies for the node
    const graphWithNoExternalDeps: GraphData = {
      nodes: [mockNode],
      links: []
    };

    render(<NodeDetailPanel node={mockNode} graphData={graphWithNoExternalDeps} onClose={() => {}} />);

    // The external dependencies section should not be displayed
    expect(screen.queryByText('Dipendenze Esterne')).not.toBeInTheDocument();
  });
});
