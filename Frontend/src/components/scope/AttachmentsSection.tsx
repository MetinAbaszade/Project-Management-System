import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/button';
import { Paperclip, Upload, Download, Trash2, FileText, FileArchive, FileImage, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useRef } from 'react';

interface Attachment {
  Id: string;
  FileName: string;
  FileType: string;
  FileSize: number;
  FilePath: string;
  EntityType?: string;
  EntityId?: string;
  OwnerId?: string;
  UploadedAt?: string;
}

interface AttachmentsSectionProps {
  attachments: Attachment[];
  isOwner: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (attachmentId: string) => void;
}

export function AttachmentsSection({
  attachments,
  isOwner,
  onUpload,
  onDelete
}: AttachmentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Helper function to get icon based on file type
  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    
    if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png')) {
      return <FileImage className="h-6 w-6 text-blue-500" />;
    }
    
    if (type.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('csv')) {
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    }
    
    if (type.includes('zip') || type.includes('archive') || type.includes('compressed')) {
      return <FileArchive className="h-6 w-6 text-amber-500" />;
    }
    
    return <FileText className="h-6 w-6 text-gray-500" />;
  };
  
  return (
    <GlassPanel className="relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Paperclip className="h-5 w-5 text-indigo-500 mr-2" />
            <h2 className="text-xl font-semibold">Attachments</h2>
          </div>
          
          {isOwner && (
            <div>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                ref={fileInputRef}
                onChange={onUpload}
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                <Upload className="h-4 w-4 mr-2" /> Upload File
              </Button>
            </div>
          )}
        </div>
        
        {attachments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <Paperclip className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No attachments yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mt-1 mb-4">
              {isOwner 
                ? "Upload files related to the project scope to keep everything organized" 
                : "No files have been attached to this project scope yet"}
            </p>
            
            {isOwner && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload File
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <motion.div
                key={attachment.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  {getFileIcon(attachment.FileType)}
                  
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{attachment.FileName}</p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
                      <span>{formatFileSize(attachment.FileSize)}</span>
                      <span>•</span>
                      <span>{attachment.UploadedAt ? format(new Date(attachment.UploadedAt), 'MMM d, yyyy') : 'Unknown date'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.FilePath, '_blank')}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(attachment.Id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </GlassPanel>
  );
}