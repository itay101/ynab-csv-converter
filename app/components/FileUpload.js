"use client";

import React, {useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';

const Dropzone = ({onFilesDropped}) => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        onFilesDropped([])
        const formData = new FormData();
        files.forEach((file) => formData.append('files[]', file));
        fetch('/api/account/identifyByFiles', {method: 'POST', body: formData})
            .then((response) => response.json())
            .then((identifiedFiles) => onFilesDropped(identifiedFiles.map((identifiedFile, index) => ({
                ...identifiedFile,
                file: files[index]
            }))))
            .catch((error) => console.error('Error identifying files:', error));
    }, [files]);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop: (acceptedFiles) => setFiles(acceptedFiles),
    });

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-4 text-center ${
                isDragActive ? 'bg-gray-100' : ''
            }`}
        >
            <input {...getInputProps()} />
            {isDragActive ? (
                <p>Drop the files here...</p>
            ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
            )}
        </div>
    );

}
const FileUpload = () => {
    const [droppedFiles, setDroppedFiles] = useState([])

    const handleUploadClick = () => {
        const formData = new FormData();
        droppedFiles.forEach((droppedFile) => formData.append('files[]', droppedFile.file));
        fetch('/api/account/uploadFiles', {method: 'POST', body: formData})
            .then((response) => response.json())
            .then(() => setDroppedFiles([]))
            .catch((error) => console.error('Error identifying files:', error));
    }
    return (<>
        <Dropzone onFilesDropped={setDroppedFiles}/>
        {droppedFiles.map(file => {
            return (<div key={file.account_identifier}>
                <div>{file.account_identifier} - {file.fileName}</div>
            </div>)
        })}
        {droppedFiles.length > 0 && <button onClick={handleUploadClick}>Upload {droppedFiles.length} files</button>}
    </>)
};

export default FileUpload;
