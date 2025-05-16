import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Attachment, deleteAttachment, getAttachmentsByEntity, uploadAttachment } from '@/api/ScopeAPI';
import { toast } from '@/lib/toast';
import { FileText, FileImage, FileArchive, FileSpreadsheet, Paperclip, Upload, Download, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SectionAttachmentsProps {
  projectId: string;
  sectionType: string;
  userId: string;
  isOwner: boolean;
}

export function SectionAttachments({ projectId, sectionType, userId, isOwner }: SectionAttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(() => 
    getAttachmentsByEntity(projectId, `Scope_${sectionType}`, userId)
  );
  const [isExpanded, setIsExpanded] = useState(false);
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
      return <FileImage className="h-5 w-5 text-primary" />;
    }
    
    if (type.includes('pdf')) {
      return <FileText className="h-5 w-5 text-primary/80" />;
    }
    
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('csv')) {
      return <FileSpreadsheet className="h-5 w-5 text-primary/70" />;
    }
    
    if (type.includes('zip') || type.includes('archive') || type.includes('compressed')) {
      return <FileArchive className="h-5 w-5 text-primary/60" />;
    }
    
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const entityType = `Scope_${sectionType}`;
      const newAttachment = await uploadAttachment(file, entityType, projectId, userId);
      setAttachments(prev => [...prev, newAttachment]);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error(`Failed to upload file: ${error.message || "Unknown error"}`);
    } finally {
      // Reset file input
      if (event.target) event.target.value = '';
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      const entityType = `Scope_${sectionType}`;
      await deleteAttachment(attachmentId, entityType, projectId);
      setAttachments(prev => prev.filter(att => att.Id !== attachmentId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error(`Failed to delete file: ${error.message || "Unknown error"}`);
    }
  };

  if (attachments.length === 0 && !isOwner) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Paperclip className="h-4 w-4 mr-1.5" />
          <span>{attachments.length} Attachment{attachments.length !== 1 ? 's' : ''}</span>
        </button>
        
        {isOwner && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleUpload}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              className="text-xs h-8 px-2 text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add File
            </Button>
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-2"
          >
            {attachments.length === 0 ? (
              <div className="text-center py-4 border border-dashed border-muted rounded-md">
                <Paperclip className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">No attachments yet</p>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-primary hover:text-primary/80 hover:bg-primary/10"
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload File
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {attachments.map((attachment, index) => (
                  <motion.div
                    key={attachment.Id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md",
                      "bg-muted/30 hover:bg-muted/50 transition-colors"
                    )}
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      {getFileIcon(attachment.FileType)}
                      <div className="ml-2 truncate">
                        <p className="text-sm font-medium truncate text-foreground">{attachment.FileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.FileSize)} • {format(new Date(attachment.UploadedAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.FilePath, '_blank')}
                        className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(attachment.Id)}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}