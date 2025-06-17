import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExclusionSelector from './ExclusionSelector';

describe('ExclusionSelector', () => {
  const mockNodeNames = ['JOB1', 'JOB2', 'JOB3', 'SPECIAL_JOB'];
  const mockInitialExclusions = new Set(['JOB3']);
  
  it('renders correctly with node names and initial exclusions', () => {
    render(
      <ExclusionSelector 
        allNodeNames={mockNodeNames} 
        initialExclusions={mockInitialExclusions}
        onExclusionChange={() => {}}
      />
    );
    
    // Check if the filter input is rendered
    expect(screen.getByLabelText('Filtra e Seleziona Nodi da Escludere')).toBeInTheDocument();
    
    // Check if all nodes are rendered
    mockNodeNames.forEach(nodeName => {
      expect(screen.getByLabelText(nodeName)).toBeInTheDocument();
    });
    
    // Check if initial exclusions are checked
    const job3Checkbox = screen.getByLabelText('JOB3') as HTMLInputElement;
    expect(job3Checkbox.checked).toBe(true);
    
    // Check if non-excluded nodes are unchecked
    const job1Checkbox = screen.getByLabelText('JOB1') as HTMLInputElement;
    expect(job1Checkbox.checked).toBe(false);
  });
  
  it('filters nodes based on filter text', () => {
    render(
      <ExclusionSelector 
        allNodeNames={mockNodeNames} 
        initialExclusions={mockInitialExclusions}
        onExclusionChange={() => {}}
      />
    );
    
    const filterInput = screen.getByLabelText('Filtra e Seleziona Nodi da Escludere');
    
    // Filter for "SPECIAL"
    fireEvent.change(filterInput, { target: { value: 'SPECIAL' } });
    
    // Only SPECIAL_JOB should be visible
    expect(screen.getByLabelText('SPECIAL_JOB')).toBeInTheDocument();
    expect(screen.queryByLabelText('JOB1')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('JOB2')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('JOB3')).not.toBeInTheDocument();
    
    // Clear filter
    fireEvent.change(filterInput, { target: { value: '' } });
    
    // All nodes should be visible again
    mockNodeNames.forEach(nodeName => {
      expect(screen.getByLabelText(nodeName)).toBeInTheDocument();
    });
  });
  
  it('toggles node exclusion and calls onExclusionChange', () => {
    const onExclusionChangeMock = vi.fn();
    render(
      <ExclusionSelector 
        allNodeNames={mockNodeNames} 
        initialExclusions={mockInitialExclusions}
        onExclusionChange={onExclusionChangeMock}
      />
    );
    
    // Toggle JOB1 (should add to exclusions)
    const job1Checkbox = screen.getByLabelText('JOB1');
    fireEvent.click(job1Checkbox);
    
    // Check if onExclusionChange was called with updated set
    expect(onExclusionChangeMock).toHaveBeenCalledTimes(1);
    const firstCallArg = onExclusionChangeMock.mock.calls[0][0];
    expect(firstCallArg instanceof Set).toBe(true);
    expect(firstCallArg.has('JOB1')).toBe(true);
    expect(firstCallArg.has('JOB3')).toBe(true);
    
    // Toggle JOB3 (should remove from exclusions)
    const job3Checkbox = screen.getByLabelText('JOB3');
    fireEvent.click(job3Checkbox);
    
    // Check if onExclusionChange was called with updated set
    expect(onExclusionChangeMock).toHaveBeenCalledTimes(2);
    const secondCallArg = onExclusionChangeMock.mock.calls[1][0];
    expect(secondCallArg instanceof Set).toBe(true);
    expect(secondCallArg.has('JOB1')).toBe(true);
    expect(secondCallArg.has('JOB3')).toBe(false);
  });
  
  it('handles case-insensitive filtering', () => {
    render(
      <ExclusionSelector 
        allNodeNames={mockNodeNames} 
        initialExclusions={mockInitialExclusions}
        onExclusionChange={() => {}}
      />
    );
    
    const filterInput = screen.getByLabelText('Filtra e Seleziona Nodi da Escludere');
    
    // Filter with lowercase
    fireEvent.change(filterInput, { target: { value: 'special' } });
    
    // SPECIAL_JOB should still be visible despite lowercase filter
    expect(screen.getByLabelText('SPECIAL_JOB')).toBeInTheDocument();
  });
});
