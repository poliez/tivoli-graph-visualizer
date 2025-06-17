import React from 'react';

type FileUploaderProps = {
    onFilesLoaded: (files: File[]) => void;
};

const FileUploader: React.FC<FileUploaderProps> = ({onFilesLoaded}) => {
    return <div>FileUploader Component</div>;
};

export default FileUploader;
