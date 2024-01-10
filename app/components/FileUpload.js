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
            .then(onFilesDropped)
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
    const [droppedFile, setDroppedFiles] = useState([])
    return (<>
        <Dropzone onFilesDropped={setDroppedFiles}/>
        {droppedFile.map(file => {
            return (<div key={file.account_identifier}>
                <div>{file.account_identifier} - {file.fileName}</div>
            </div>)
        })}
    </>)
};

export default FileUpload;
