'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Upload as UploadIcon, AlertCircle, Book, Play, Info, Clock, CheckCircle, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import DocumentCard from '../components/DocumentCard';
import { Card, CardContent } from '../components/ui/Card';
import Header from '../components/ui/Header';
import { Document } from '../types';
import { documentAPI } from '../lib/api';
import { useSession } from '../utils/hooks/useSession';

const DocumentsPage: React.FC = () => {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>(documents)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState<{ show: boolean; document: Document | null }>({
    show: false,
    document: null
  });

  useSession()

  // Load data on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const documentsResponse = await documentAPI.getAll();
      setDocuments(documentsResponse);
      setFilteredDocs(documentsResponse)
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (document: Document) => {
    if (document.status === 'success') {
      // Navigate to classroom interface for this document
      router.push(`/classroom/${document._id}`);
    } else if (document.status === 'pending') {
      // Show dialog for pending documents
      setShowDialog({ show: true, document });
    } else if (document.status === 'failed') {
      // Show dialog for failed documents
      setShowDialog({ show: true, document });
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await documentAPI.delete(documentId);
      // Refresh documents list
      const updatedDocuments = await documentAPI.getAll();
      setDocuments(updatedDocuments);
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document');
    }
  };

  const closeDialog = () => {
    setShowDialog({ show: false, document: null });
  };

  // Calculate accurate stats
  const readyDocuments = documents?.filter(d => d.status === 'success').length;
  const pendingDocuments = documents?.filter(d => d.status === 'pending').length;
  const failedDocuments = documents?.filter(d => d.status === 'failed').length;

  const getDocumentStatusInfo = (document: Document) => {
    switch (document.status) {
      case 'success':
        return {
          icon: CheckCircle,
          text: 'Ready for learning',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Processing - simulation not ready',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          text: 'Processing failed - simulation unavailable',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: Info,
          text: 'Status unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-primary-100 p-3 rounded-2xl">
                <Book className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Document Library
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Upload your documents and transform them into interactive learning experiences with AI-powered classroom simulations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => router.push('/upload')}
                icon={<UploadIcon className="h-5 w-5" />}
                className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white shadow-lg px-8"
              >
                Upload New Document
              </Button>

              {/* <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>AI Processing Ready</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>Simulation Failed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span>Processing Simulation</span>
                </div>
              </div> */}

            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <Card className="text-center p-6 border-0 shadow-apple-md">
              <div className="text-3xl font-bold text-primary-600 mb-2">{documents?.length}</div>
              <div className="text-gray-600">Total Documents</div>
            </Card>
            <Card className="text-center p-6 border-0 shadow-apple-md">
              <div className="text-3xl font-bold text-green-600 mb-2">{readyDocuments}</div>
              <div className="text-gray-600">Ready for Learning</div>
            </Card>
            <Card className="text-center p-6 border-0 shadow-apple-md">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{pendingDocuments}</div>
              <div className="text-gray-600">Processing</div>
            </Card>
            <Card className="text-center p-6 border-0 shadow-apple-md">
              <div className="text-3xl font-bold text-red-600 mb-2">{failedDocuments}</div>
              <div className="text-gray-600">Failed</div>
            </Card>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your documents...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-error-50 border border-error-200 rounded-xl p-6 text-center mb-8"
            >
              <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-error-900 mb-2">Something went wrong</h3>
              <p className="text-error-700 mb-4">{error}</p>
              <Button
                onClick={loadDocuments}
                variant="outline"
                size="sm"
                className="border-error-300 text-error-700 hover:bg-error-50"
              >
                Try Again
              </Button>
            </motion.div>
          )}
          <div className='flex items-center border border-gray-200 hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 my-4 rounded-lg max-w-[400px] transition-all duration-200' >
            <input
              className='flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent px-3 py-2.5'
              placeholder='Search documents...'
              onChange={(e)=>{
                const reg = new RegExp(`${e.target.value}`, 'ig')
                setFilteredDocs(documents?.filter(d=>reg.test(d.name)))
              }
            }
            />
            <button className='p-2.5 bg-gray-100 hover:bg-gray-200 rounded-r-lg transition-colors duration-200 border-l border-gray-200' >
              <Search size={18} className='text-gray-600' />
            </button>
          </div>

          {/* Documents Grid */}
          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {documents?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDocs.map((document, index) => (
                    <motion.div
                      key={document._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="relative"
                      onMouseEnter={() => document.status !== 'success' && setShowTooltip(document._id)}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      <div className={`relative ${document.status !== 'success' ? 'cursor-not-allowed' : ''}`}>
                        <DocumentCard
                          document={document}
                          onClick={handleDocumentClick}
                        />

                        {/* Status Overlay for non-ready documents */}
                        {document.status !== 'success' && (
                          <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                            <div className={`${getDocumentStatusInfo(document).bgColor} ${getDocumentStatusInfo(document).borderColor} border rounded-lg p-3 shadow-lg`}>
                              {React.createElement(getDocumentStatusInfo(document).icon, {
                                className: `h-6 w-6 ${getDocumentStatusInfo(document).color} mx-auto mb-2`
                              })}
                              <p className={`text-sm font-medium ${getDocumentStatusInfo(document).color} text-center`}>
                                {document.status === 'pending' ? 'Processing...' : 'Failed'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tooltip */}
                      {showTooltip === document._id && document.status !== 'success' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10"
                        >
                          <div className={`${getDocumentStatusInfo(document).bgColor} ${getDocumentStatusInfo(document).borderColor} border rounded-lg p-3 shadow-lg max-w-xs`}>
                            <div className="flex items-start space-x-2">
                              {React.createElement(getDocumentStatusInfo(document).icon, {
                                className: `h-4 w-4 ${getDocumentStatusInfo(document).color} mt-0.5 flex-shrink-0`
                              })}
                              <p className={`text-sm ${getDocumentStatusInfo(document).color}`}>
                                {getDocumentStatusInfo(document).text}
                              </p>
                            </div>
                            {/* Tooltip arrow */}
                            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${getDocumentStatusInfo(document).borderColor.replace('border-', 'border-t-')}`}></div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-apple-lg">
                  <CardContent className="p-12 text-center">
                    <div className="bg-primary-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Book className="h-10 w-10 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No documents yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Upload your first document to get started with AI-powered learning experiences.
                      Transform any PDF or DOCX into an interactive classroom simulation.
                    </p>
                    <Button
                      size="lg"
                      onClick={() => router.push('/upload')}
                      icon={<UploadIcon className="h-5 w-5" />}
                      className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700"
                    >
                      Upload Your First Document
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Status Dialog */}
      {showDialog.show && showDialog.document && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeDialog}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-apple-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className={`w-16 h-16 ${getDocumentStatusInfo(showDialog.document).bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                {React.createElement(getDocumentStatusInfo(showDialog.document).icon, {
                  className: `h-8 w-8 ${getDocumentStatusInfo(showDialog.document).color}`
                })}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {showDialog.document.status === 'pending' ? 'Document Processing' : 'Processing Failed'}
              </h3>

              <p className="text-gray-600 mb-6">
                {showDialog.document.status === 'pending'
                  ? 'This document is still being processed. The AI simulation is not ready yet. Please check back in a few minutes.'
                  : 'The AI simulation for this document failed to generate. You can try uploading the document again or contact support if the issue persists.'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={closeDialog}
                  className="flex-1"
                >
                  Close
                </Button>

                {showDialog.document.status === 'failed' && (
                  <Button
                    onClick={() => {
                      closeDialog();
                      router.push('/upload');
                    }}
                    className="flex-1"
                    icon={<UploadIcon className="h-4 w-4" />}
                  >
                    Upload Again
                  </Button>
                )}

                {showDialog.document.status === 'pending' && (
                  <Button
                    onClick={() => {
                      closeDialog();
                      loadDocuments();
                    }}
                    className="flex-1"
                    icon={<Play className="h-4 w-4" />}
                  >
                    Refresh
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DocumentsPage;