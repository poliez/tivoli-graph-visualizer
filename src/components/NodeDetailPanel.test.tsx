import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NodeDetailPanel from './NodeDetailPanel';
import type { GraphNode } from '../types';

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

  it('renders correctly with node details', () => {
    render(<NodeDetailPanel node={mockNode} onClose={() => {}} />);

    // Check if the node name is displayed in the header
    expect(screen.getByText('Dettagli: Test Job')).toBeInTheDocument();

    // Check if metadata is displayed
    expect(screen.getByText('Nome Job')).toBeInTheDocument();
    expect(screen.getByText('Test Job', { selector: 'dd' })).toBeInTheDocument();

    expect(screen.getByText('Tipo')).toBeInTheDocument();
    expect(screen.getByText('COMMAND', { selector: 'dd' })).toBeInTheDocument();

    expect(screen.getByText('Descrizione')).toBeInTheDocument();
    expect(screen.getByText('A test job', { selector: 'dd' })).toBeInTheDocument();

    expect(screen.getByText('Istruzioni')).toBeInTheDocument();
    expect(screen.getByText('Some instructions', { selector: 'dd' })).toBeInTheDocument();
  });

  it('does not display D3-specific properties', () => {
    render(<NodeDetailPanel node={mockNode} onClose={() => {}} />);

    // D3 properties should not be displayed
    expect(screen.queryByText('x')).not.toBeInTheDocument();
    expect(screen.queryByText('y')).not.toBeInTheDocument();
    expect(screen.queryByText('vx')).not.toBeInTheDocument();
    expect(screen.queryByText('vy')).not.toBeInTheDocument();
    expect(screen.queryByText('index')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(<NodeDetailPanel node={mockNode} onClose={onCloseMock} />);

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

    render(<NodeDetailPanel node={nodeWithEmptyValues} onClose={() => {}} />);

    // Check if empty values are displayed as 'N/D'
    expect(screen.getByText('Empty Property')).toBeInTheDocument();
    expect(screen.getByText('N/D', { selector: 'dd' })).toBeInTheDocument();

    expect(screen.getByText('Undefined Property')).toBeInTheDocument();
    // There should be at least one 'N/D' value
    const ndValues = screen.getAllByText('N/D', { selector: 'dd' });
    expect(ndValues.length).toBeGreaterThan(0);
  });
});
