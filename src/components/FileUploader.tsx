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
            className={`file-drop-zone ${isDragOver ? 'drag-over' : ''} ${isLoading ? 'loading' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            {isLoading ? 'Caricamento in corso...' : label}
            <input
                type="file"
                multiple
                accept=".csv"
                onChange={handleFileChange}
                className="file-input-hidden"
                disabled={isLoading}
            />
        </div>
    );
};

export default FileUploader;
