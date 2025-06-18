import React, {useCallback, useState} from 'react';
import styles from './FileUploader.module.css';

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
            className={`${styles.fileDropZone} ${isDragOver ? styles.dragOver : ''} ${isLoading ? styles.loading : ''}`}
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
                className={styles.fileInputHidden}
                disabled={isLoading}
            />
        </div>
    );
};

export default FileUploader;
