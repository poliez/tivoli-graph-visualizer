import React, {useCallback, useState} from 'react';

type FileUploaderProps = {
    onFilesSelected: (files: FileList) => void;
    isLoading?: boolean;
    label?: string;
};

const FileUploader: React.FC<FileUploaderProps> = ({
                                                       onFilesSelected,
                                                       isLoading = false,
                                                       label = "Trascina i file qui, o clicca per selezionarli."
                                                   }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onFilesSelected(e.target.files);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files) {
            onFilesSelected(e.dataTransfer.files);
        }
    }, [onFilesSelected]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    return (
        <div
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 relative max-h-20 ${
                isDragOver ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
            } ${
                isLoading ? 'border-gray-300 bg-gray-100 bg-opacity-20 cursor-not-allowed' : ''
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            data-testid="file-drop-zone"
        >
            {isLoading ? 'Caricamento in corso...' : label}
            <input
                type="file"
                multiple
                accept=".csv"
                onChange={handleFileChange}
                className={`absolute top-0 left-0 w-full h-full opacity-0 ${
                    isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                disabled={isLoading}
            />
        </div>
    );
};

export default FileUploader;
