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
  Loader2, 
  ImageIcon,
  FileIcon,
  File,
  FileSpreadsheet,
  FilePdf,
  FileCode,
  FileArchive,
  FileVideo,
  FileAudio,
  X,
  Plus
} from 'lucide-react';
import { toast } from '@/lib/toast';

interface TaskAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  taskId: string;
  projectId?: string;
  uploadedAt: string;
  dataUrl?: string;
}

interface TaskAttachmentsProps {
  taskId: string;
  projectId?: string;
  isOwner: boolean;
}

export function TaskAttachments({ taskId, projectId, isOwner }: TaskAttachmentsProps) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
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
  const processFile = async (file: File) => {
    if (!file) return;
    
    setUploading(true);
    
    try {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        setUploading(false);
        return;
      }
      
      // Create a new attachment
      const newAttachment: TaskAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        taskId: taskId,
        projectId: projectId,
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
  
  // Handle file upload from input
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
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

  // Get appropriate icon for file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FilePdf className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('csv')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <File className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('html') || fileType.includes('javascript') || fileType.includes('css') || fileType.includes('json')) {
      return <FileCode className="h-5 w-5 text-purple-500" />;
    } else if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar') || fileType.includes('compressed')) {
      return <FileArchive className="h-5 w-5 text-amber-500" />;
    } else if (fileType.includes('video')) {
      return <FileVideo className="h-5 w-5 text-pink-500" />;
    } else if (fileType.includes('audio')) {
      return <FileAudio className="h-5 w-5 text-cyan-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div 
      className="space-y-4"
      onDragEnter={isOwner ? handleDrag : undefined}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Paperclip className="h-4 w-4 mr-2" />
          Attachments
          {attachments.length > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({attachments.length})
            </span>
          )}
        </h3>
        
        {isOwner && (
          <div>
            <label className="cursor-pointer relative">
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors shadow-sm">
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
          </div>
        )}
      </div>
      
      {/* Drag and drop area */}
      {isOwner && (
        <AnimatePresence>
          {dragActive && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative border-2 border-dashed border-primary/50 rounded-lg p-8 flex flex-col items-center justify-center bg-primary/5"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 text-primary mb-4" />
              <p className="text-center font-medium text-primary mb-1">Drop file to upload</p>
              <p className="text-center text-sm text-muted-foreground">Maximum file size: 10MB</p>
              
              <button 
                onClick={() => setDragActive(false)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      {attachments.length === 0 ? (
        <div className="text-center py-8 border rounded-lg border-dashed border-muted-foreground/30">
          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-muted-foreground">No attachments yet</p>
          
          {isOwner && (
            <button
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Attachment</span>
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {attachments.map((attachment) => (
              <motion.li
                key={attachment.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border rounded-lg bg-card shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-muted rounded-md flex items-center justify-center">
                      {getFileIcon(attachment.fileType)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate" title={attachment.fileName}>
                        {attachment.fileName}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <span>{formatFileSize(attachment.fileSize)}</span>
                        <span>•</span>
                        <span>{new Date(attachment.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleDownloadAttachment(attachment)}
                      className="p-1.5 hover:bg-muted rounded-md transition-colors group"
                      aria-label="Download file"
                    >
                      <Download className="h-4 w-4 text-muted-foreground group-hover:text-blue-500" />
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
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}