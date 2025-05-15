// src/components/task/TaskAttachments.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paperclip, 
  Upload, 
  Trash2, 
  FileText, 
  Download, 
  Loader2 
} from 'lucide-react';
import { toast } from '@/lib/toast';

interface TaskAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  taskId: string;
  uploadedAt: string;
  dataUrl?: string;
}

interface TaskAttachmentsProps {
  taskId: string;
  isOwner: boolean;
}

export function TaskAttachments({ taskId, isOwner }: TaskAttachmentsProps) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Load attachments from local storage
  useEffect(() => {
    const storedAttachments = localStorage.getItem('task-attachments');
    if (storedAttachments) {
      try {
        const allAttachments = JSON.parse(storedAttachments);
        const taskAttachments = allAttachments.filter(att => att.taskId === taskId);
        setAttachments(taskAttachments);
      } catch (error) {
        console.error('Failed to parse stored attachments:', error);
      }
    }
  }, [taskId]);
  
  // Save attachments to local storage
  const saveAttachments = (newAttachments: TaskAttachment[]) => {
    const storedAttachments = localStorage.getItem('task-attachments');
    let allAttachments = [];
    
    if (storedAttachments) {
      try {
        allAttachments = JSON.parse(storedAttachments);
        // Filter out attachments for this task
        allAttachments = allAttachments.filter(att => att.taskId !== taskId);
      } catch (error) {
        console.error('Failed to parse stored attachments:', error);
      }
    }
    
    // Combine with new attachments
    allAttachments = [...allAttachments, ...newAttachments];
    localStorage.setItem('task-attachments', JSON.stringify(allAttachments));
    
    // Update state
    setAttachments(newAttachments);
  };
  
  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      // Create a new attachment
      const newAttachment: TaskAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        taskId: taskId,
        uploadedAt: new Date().toISOString()
      };
      
      // Read file as data URL for preview
      const reader = new FileReader();
      
      reader.onload = () => {
        newAttachment.dataUrl = reader.result as string;
        
        // Save to local storage
        const newAttachments = [...attachments, newAttachment];
        saveAttachments(newAttachments);
        
        toast.success('File uploaded successfully');
        setUploading(false);
      };
      
      reader.onerror = () => {
        console.error('Failed to read file');
        toast.error('Failed to upload file');
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
      setUploading(false);
    }
  };
  
  // Handle attachment deletion
  const handleDeleteAttachment = (id: string) => {
    const newAttachments = attachments.filter(att => att.id !== id);
    saveAttachments(newAttachments);
    toast.success('File deleted');
  };
  
  // Handle attachment download
  const handleDownloadAttachment = (attachment: TaskAttachment) => {
    if (!attachment.dataUrl) {
      toast.error('File data not available');
      return;
    }
    
    const link = document.createElement('a');
    link.href = attachment.dataUrl;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Paperclip className="h-4 w-4 mr-2" />
          Attachments
        </h3>
        
        {isOwner && (
          <label className="cursor-pointer relative">
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors">
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload</span>
                </>
              )}
            </span>
          </label>
        )}
      </div>
      
      {attachments.length === 0 ? (
        <div className="text-center py-8 border rounded-lg border-dashed border-muted-foreground/30">
          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-muted-foreground">No attachments yet</p>
        </div>
      ) : (
        <ul className="divide-y border rounded-lg overflow-hidden">
          <AnimatePresence initial={false}>
            {attachments.map((attachment) => (
              <motion.li
                key={attachment.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-3 bg-card"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-muted rounded flex items-center justify-center">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{attachment.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {(attachment.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadAttachment(attachment)}
                    className="p-1.5 hover:bg-muted rounded-md transition-colors"
                    aria-label="Download file"
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </button>
                  
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      className="p-1.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-md transition-colors"
                      aria-label="Delete file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}