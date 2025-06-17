import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileUploader from './FileUploader';

describe('FileUploader', () => {
  it('renders correctly with instructions', () => {
    render(<FileUploader onFilesSelected={() => {}} />);

    // Check if the instructions are rendered
    expect(screen.getByText('Trascina i file qui, o clicca per selezionarli.')).toBeInTheDocument();

    // Check if the file input is rendered with correct attributes
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.type).toBe('file');
    expect(fileInput.multiple).toBe(true);
    expect(fileInput.accept).toBe('.csv');
  });

  it('calls onFilesSelected when files are selected via input', () => {
    const onFilesSelectedMock = vi.fn();
    render(<FileUploader onFilesSelected={onFilesSelectedMock} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Create a mock File
    const file = new File(['file content'], 'test.csv', { type: 'text/csv' });

    // Use Object.defineProperty to avoid ESLint unused variable warnings
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });

    // Simulate file selection
    fireEvent.change(fileInput);

    // Check if onFilesSelected was called
    expect(onFilesSelectedMock).toHaveBeenCalled();
  });

  it('handles drag-and-drop events correctly', () => {
    const onFilesSelectedMock = vi.fn();
    render(<FileUploader onFilesSelected={onFilesSelectedMock} />);

    const dropZone = screen.getByText('Trascina i file qui, o clicca per selezionarli.').parentElement;
    expect(dropZone).toBeInTheDocument();

    // Create a mock File
    const file = new File(['file content'], 'test.csv', { type: 'text/csv' });

    // Create a mock dataTransfer object
    const dataTransfer = {
      files: [file],
      clearData: vi.fn()
    };

    // Test dragEnter
    fireEvent.dragEnter(dropZone!, { dataTransfer });
    expect(dropZone).toHaveClass('drag-over');

    // Test dragOver
    fireEvent.dragOver(dropZone!, { dataTransfer });
    expect(dropZone).toHaveClass('drag-over');

    // Test dragLeave
    fireEvent.dragLeave(dropZone!, { dataTransfer });
    expect(dropZone).not.toHaveClass('drag-over');

    // Test dragEnter again to set up for drop
    fireEvent.dragEnter(dropZone!, { dataTransfer });

    // Test drop
    fireEvent.drop(dropZone!, { dataTransfer });
    expect(dropZone).not.toHaveClass('drag-over');
    expect(onFilesSelectedMock).toHaveBeenCalled();
  });
});
