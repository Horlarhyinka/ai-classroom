import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './ui/Button';
import { generateFileThumbnail, generateId } from '../utils/helpers';
import { Document } from '../types';
import fetchWrapper from '../utils/fetchWrapper';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface FileUploaderProps {
  onFileProcessed: (document: Document) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileProcessed }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const router = useRouter()
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only PDF and DOCX files are supported');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    console.log('File Selected::', file)
    const payload = new FormData()
    setUploadProgress(40)
    payload.append('file', file)
    fetchWrapper.post(process.env.NEXT_PUBLIC_API_BASE_URL! + '/docs', payload)
    .then((res)=>{
      setUploadProgress(90)
      if(res.status?.toString().startsWith('2')){
        setUploadProgress(100)
        toast.success('Your document has been uploaded.')
        router.push('/documents')
      }
    })
    .catch((err)=>{
      
    })
    // Simulate upload progress
    // const progressInterval = setInterval(() => {
    //   setUploadProgress(prev => {
    //     const newProgress = prev + 10;
    //     if (newProgress >= 100) {
    //       clearInterval(progressInterval);
          
    //       // Simulate API processing delay
    //       // setTimeout(() => {
    //       //   const fileType = file.type.includes('pdf') ? 'pdf' : 'docx';
            
    //       //   // Create a mock document
    //       //   const newDocument: Document = {
    //       //     id: generateId(),
    //       //     title: file.name.replace(/\.(pdf|docx)$/i, ''),
    //       //     fileName: file.name,
    //       //     fileType: fileType as 'pdf' | 'docx',
    //       //     uploadDate: new Date().toISOString(),
    //       //     size: file.size,
    //       //     status: 'processing',
    //       //   };
            
    //       //   onFileProcessed(newDocument);
    //       //   setIsUploading(false);
    //       //   setUploadProgress(0);
    //       // }, 1000);
    //       console.log()
    //     }
    //     return newProgress;
    //   });
    // }, 300);

  }, [onFileProcessed]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}
            ${isDragAccept ? 'border-success-500 bg-success-50' : ''}
            ${isDragReject ? 'border-error-500 bg-error-50' : ''}
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="w-full flex flex-col items-center">
              <File className="h-12 w-12 text-primary-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Uploading document...</h3>
              <div className="w-full max-w-md h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Upload document</h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Drag and drop your PDF or DOCX file here, or click to browse
              </p>
              <Button size="sm" variant="outline">
                Select file
              </Button>
              {uploadError && (
                <div className="mt-4 flex items-center text-error-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <p className="text-sm">{uploadError}</p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FileUploader;