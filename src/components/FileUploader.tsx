// src/components/FileUploader.tsx

import React, {useState} from 'react';

// Definiamo una struttura per contenere i file selezionati
interface SelectedFiles {
    operations?: File;
    internalRels?: File;
    externalPreds?: File;
    externalSuccs?: File;
    operatorInstructions?: File; // Opzionale
}

type FileUploaderProps = {
    // La funzione onFilesLoaded ora accetta l'oggetto SelectedFiles
    onFilesLoaded: (files: SelectedFiles) => void;
    // Aggiungiamo una prop per indicare se il processo è in corso
    isProcessing: boolean;
};

const FileUploader: React.FC<FileUploaderProps> = ({onFilesLoaded, isProcessing}) => {
    const [files, setFiles] = useState<SelectedFiles>({});

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, files: inputFiles} = e.target;
        if (inputFiles && inputFiles.length > 0) {
            setFiles((prev) => ({...prev, [name]: inputFiles[0]}));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid()) {
            onFilesLoaded(files);
        }
    };

    const isFormValid = () => {
        // Il form è valido se tutti i file richiesti sono stati selezionati
        return files.operations && files.internalRels && files.externalPreds && files.externalSuccs;
    };

    return (
        <form onSubmit={handleSubmit} className="file-uploader-form">
            <h4>Carica i file del Net</h4>
            <div className="file-input-group">
                <label>Operazioni (*)</label>
                <input type="file" name="operations" accept=".csv" required onChange={handleFileChange}/>
            </div>
            <div className="file-input-group">
                <label>Relazioni Interne (*)</label>
                <input type="file" name="internalRels" accept=".csv" required onChange={handleFileChange}/>
            </div>
            <div className="file-input-group">
                <label>Relazioni Esterne Predecessori (*)</label>
                <input type="file" name="externalPreds" accept=".csv" required onChange={handleFileChange}/>
            </div>
            <div className="file-input-group">
                <label>Relazioni Esterne Successori (*)</label>
                <input type="file" name="externalSuccs" accept=".csv" required onChange={handleFileChange}/>
            </div>
            <div className="file-input-group">
                <label>Operator Instructions (opzionale)</label>
                <input type="file" name="operatorInstructions" accept=".csv" onChange={handleFileChange}/>
            </div>
            <button type="submit" disabled={!isFormValid() || isProcessing}>
                {isProcessing ? 'Elaborazione...' : 'Genera Grafo'}
            </button>
        </form>
    );
};

export default FileUploader;
