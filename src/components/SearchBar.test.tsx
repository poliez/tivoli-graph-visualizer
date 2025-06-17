import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  it('renders correctly with label and input', () => {
    render(<SearchBar onSearch={() => {}} />);
    
    // Check if the label is rendered
    expect(screen.getByLabelText('Cerca e Isola Job')).toBeInTheDocument();
    
    // Check if the input is rendered with the correct placeholder
    const input = screen.getByPlaceholderText('Nome esatto del job...');
    expect(input).toBeInTheDocument();
  });

  it('updates input value when user types', () => {
    render(<SearchBar onSearch={() => {}} />);
    
    const input = screen.getByLabelText('Cerca e Isola Job');
    
    // Simulate user typing
    fireEvent.change(input, { target: { value: 'JOB1' } });
    
    // Check if the input value is updated
    expect(input).toHaveValue('JOB1');
  });

  it('calls onSearch with the input value after the user stops typing', async () => {
    const onSearchMock = vi.fn();
    render(<SearchBar onSearch={onSearchMock} />);

    const input = screen.getByLabelText('Cerca e Isola Job');
    
    // Simulate user typing
    fireEvent.change(input, { target: { value: 'JOB1' } });

    // Wait for the debounce timer to complete
    await waitFor(() => {
      expect(onSearchMock).toHaveBeenCalledWith('JOB1');
    }, { timeout: 400 }); // Timeout should be > debounce time (300ms)
  });

  it('debounces search calls when user types rapidly', async () => {
    const onSearchMock = vi.fn();
    render(<SearchBar onSearch={onSearchMock} />);

    const input = screen.getByLabelText('Cerca e Isola Job');
    
    // Simulate user typing rapidly
    fireEvent.change(input, { target: { value: 'J' } });
    fireEvent.change(input, { target: { value: 'JO' } });
    fireEvent.change(input, { target: { value: 'JOB' } });
    fireEvent.change(input, { target: { value: 'JOB1' } });

    // Wait for the debounce timer to complete
    await waitFor(() => {
      expect(onSearchMock).toHaveBeenCalledTimes(1);
      expect(onSearchMock).toHaveBeenCalledWith('JOB1');
    }, { timeout: 400 }); // Timeout should be > debounce time (300ms)
  });
});
