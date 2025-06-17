import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OperationTypeFilter from './OperationTypeFilter';

describe('OperationTypeFilter', () => {
  const mockOperationTypes = ['JOB', 'LOG', 'JOBZC'];
  const mockSelectedTypes = new Set(['JOB', 'LOG']);
  
  it('renders correctly with operation types and selected types', () => {
    render(
      <OperationTypeFilter 
        operationTypes={mockOperationTypes} 
        selectedTypes={mockSelectedTypes}
        onTypeChange={() => {}}
      />
    );
    
    // Check if the label is rendered
    expect(screen.getByText('Filtra per Tipo di Operazione')).toBeInTheDocument();
    
    // Check if all operation types are rendered
    mockOperationTypes.forEach(type => {
      expect(screen.getByLabelText(type)).toBeInTheDocument();
    });
    
    // Check if selected types are checked
    const jobCheckbox = screen.getByLabelText('JOB') as HTMLInputElement;
    expect(jobCheckbox.checked).toBe(true);
    
    const logCheckbox = screen.getByLabelText('LOG') as HTMLInputElement;
    expect(logCheckbox.checked).toBe(true);
    
    // Check if non-selected types are unchecked
    const jobzcCheckbox = screen.getByLabelText('JOBZC') as HTMLInputElement;
    expect(jobzcCheckbox.checked).toBe(false);
  });
  
  it('toggles type selection and calls onTypeChange', () => {
    const onTypeChangeMock = vi.fn();
    render(
      <OperationTypeFilter 
        operationTypes={mockOperationTypes} 
        selectedTypes={mockSelectedTypes}
        onTypeChange={onTypeChangeMock}
      />
    );
    
    // Toggle JOBZC (should add to selected types)
    const jobzcCheckbox = screen.getByLabelText('JOBZC');
    fireEvent.click(jobzcCheckbox);
    
    // Check if onTypeChange was called with updated set
    expect(onTypeChangeMock).toHaveBeenCalledTimes(1);
    const firstCallArg = onTypeChangeMock.mock.calls[0][0];
    expect(firstCallArg instanceof Set).toBe(true);
    expect(firstCallArg.has('JOB')).toBe(true);
    expect(firstCallArg.has('LOG')).toBe(true);
    expect(firstCallArg.has('JOBZC')).toBe(true);
    
    // Toggle JOB (should remove from selected types)
    const jobCheckbox = screen.getByLabelText('JOB');
    fireEvent.click(jobCheckbox);
    
    // Check if onTypeChange was called with updated set
    expect(onTypeChangeMock).toHaveBeenCalledTimes(2);
    const secondCallArg = onTypeChangeMock.mock.calls[1][0];
    expect(secondCallArg instanceof Set).toBe(true);
    expect(secondCallArg.has('JOB')).toBe(false);
    expect(secondCallArg.has('LOG')).toBe(true);
    expect(secondCallArg.has('JOBZC')).toBe(false);
  });
  
  it('selects all types when "Seleziona Tutti" is clicked', () => {
    const onTypeChangeMock = vi.fn();
    render(
      <OperationTypeFilter 
        operationTypes={mockOperationTypes} 
        selectedTypes={new Set(['JOB'])}
        onTypeChange={onTypeChangeMock}
      />
    );
    
    // Click "Seleziona Tutti" button
    const selectAllButton = screen.getByText('Seleziona Tutti');
    fireEvent.click(selectAllButton);
    
    // Check if onTypeChange was called with all types
    expect(onTypeChangeMock).toHaveBeenCalledTimes(1);
    const callArg = onTypeChangeMock.mock.calls[0][0];
    expect(callArg instanceof Set).toBe(true);
    expect(callArg.size).toBe(mockOperationTypes.length);
    mockOperationTypes.forEach(type => {
      expect(callArg.has(type)).toBe(true);
    });
  });
  
  it('deselects all types when "Deseleziona Tutti" is clicked', () => {
    const onTypeChangeMock = vi.fn();
    render(
      <OperationTypeFilter 
        operationTypes={mockOperationTypes} 
        selectedTypes={mockSelectedTypes}
        onTypeChange={onTypeChangeMock}
      />
    );
    
    // Click "Deseleziona Tutti" button
    const deselectAllButton = screen.getByText('Deseleziona Tutti');
    fireEvent.click(deselectAllButton);
    
    // Check if onTypeChange was called with empty set
    expect(onTypeChangeMock).toHaveBeenCalledTimes(1);
    const callArg = onTypeChangeMock.mock.calls[0][0];
    expect(callArg instanceof Set).toBe(true);
    expect(callArg.size).toBe(0);
  });
});
