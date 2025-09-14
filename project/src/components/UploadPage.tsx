'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import FileUploader from '../components/FileUploader';
import { Document } from '../types';
import {useRouter} from 'next/navigation'

const UploadPage: React.FC = () => {
  const router = useRouter()
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<Document | null>(null);
  
  const handleFileProcessed = (document: Document) => {
    setUploadedDocument(document);
    setIsUploaded(true);
    
    // Simulate document processing completion after 3 seconds
    setTimeout(() => {
      if (document && uploadedDocument) {
        setUploadedDocument({
          ...document,
          status: 'success',
        });
      }
    }, 3000);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.back()}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>
        
        <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
        <p className="text-gray-600">
          Upload a PDF or DOCX file to create an AI lecture
        </p>
      </motion.div>
      
      {!isUploaded ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-xl shadow-apple-sm p-8 mb-8">
            <FileUploader onFileProcessed={handleFileProcessed} />
          </div>
          
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-6">
            <h3 className="text-lg font-medium text-primary-900 mb-2">Tips for best results</h3>
            <ul className="space-y-2 text-primary-800">
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                Upload clear, well-formatted documents for optimal processing
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                PDF files with selectable text work best
              </li>
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                Documents with headings and sections will create better structured lectures
              </li>
            </ul>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-apple-sm p-8 text-center"
        >
          <div className="mb-6">
            {uploadedDocument?.status === 'pending' ? (
              <>
                <div className="inline-block p-3 bg-warning-50 rounded-full mb-4">
                  <div className="w-12 h-12 rounded-full border-4 border-warning-200 border-t-warning-500 animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing document</h2>
                <p className="text-gray-600">
                  We're analyzing your document and creating an interactive lecture. This may take a few minutes.
                </p>
              </>
            ) : (
              <>
                <div className="inline-block p-3 bg-success-50 rounded-full mb-4">
                  <svg className="w-12 h-12 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Document processed successfully!</h2>
                <p className="text-gray-600 mb-6">
                  Your document has been transformed into an interactive lecture.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    onClick={() => router.push(`/lecture/${uploadedDocument?._id}`)}
                  >
                    View Lecture
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/documents')}
                  >
                    Back to Documents
                  </Button>
                </div>
              </>
            )}
          </div>
          
          {uploadedDocument?.status === 'pending' && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={() => router.push('/documents')}
              >
                View All Documents
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default UploadPage;