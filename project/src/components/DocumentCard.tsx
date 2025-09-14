import React from 'react';
import { FileText, File as FilePdf, FileCode, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Document } from '../types';
import { formatFileSize, formatDate } from '../utils/helpers';
import { Card, CardContent } from './ui/Card';

interface DocumentCardProps {
  document: Document;
  onClick: (document: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onClick }) => {
  const getFileIcon = () => {
    if(document?.name?.endsWith('pdf')){
      return <FilePdf className="h-10 w-10 text-error-500" />
    }else{
      return <FileText className="h-10 w-10 text-primary-500" />;
    }

  };

  const getStatusIcon = () => {
    switch (document.status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning-500" />;
      case 'success':
        return <div className="h-5 w-5 rounded-full bg-error-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (document.status) {
      case 'success':
        return 'Ready';
      case 'pending':
        return 'Processing';
      case 'failed':
        return 'Error';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="w-full"
    >
      <Card 
        hover 
        className="overflow-hidden h-full" 
        onClick={() => onClick(document)}
      >
        {document.thumbnail ? (
          <div className="relative h-36 w-full overflow-hidden bg-gray-100">
            <img 
              src={document.thumbnail} 
              alt={document.name} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
              <p className="text-sm font-medium truncate">{document.name}</p>
            </div>
          </div>
        ) : (
          <div className="h-36 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            {getFileIcon()}
          </div>
        )}
        <CardContent>
          <h3 className="font-medium text-gray-900 mb-1 truncate">{document.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{formatDate(document.createdAt)}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{formatFileSize(document.size)}</span>
            <div className="flex items-center space-x-1">
              {getStatusIcon()}
              <span className="text-xs font-medium">{getStatusText()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DocumentCard;