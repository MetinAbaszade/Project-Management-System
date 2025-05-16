// Frontend/src/app/(dashboard)/projects/[id]/team/[teamid]/components/AttachmentsTab.tsx

import { useState, useEffect } from 'react';
import { Paperclip, File, FileText, Image, Upload, Trash2 } from 'lucide-react';
import { toast } from '@/lib/toast';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  addedAt: string;
  addedBy: string;
}

interface AttachmentsTabProps {
  teamId: string;
}

export default function AttachmentsTab({ teamId }: AttachmentsTabProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Load attachments from localStorage on mount
  useEffect(() => {
    const storedAttachments = localStorage.getItem(`team_${teamId}_attachments`);
    if (storedAttachments) {
      try {
        setAttachments(JSON.parse(storedAttachments));
      } catch (error) {
        console.error('Failed to parse attachments:', error);
      }
    }
  }, [teamId]);
  
  // Save attachments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`team_${teamId}_attachments`, JSON.stringify(attachments));
  }, [attachments, teamId]);
  
  // Function to handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    // Mock upload delay
    setTimeout(() => {
      const newAttachments: Attachment[] = [];
      
      Array.from(files).forEach(file => {
        const attachment: Attachment = {
          id: `attachment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          addedAt: new Date().toISOString(),
          addedBy: 'Current User'
        };
        
        newAttachments.push(attachment);
      });
      
      setAttachments(prev => [...prev, ...newAttachments]);
      setUploading(false);
      toast.success(`${files.length} attachment(s) uploaded`);
      
      // Reset the input
      event.target.value = '';
    }, 1000);
  };
  
  // Function to delete an attachment
  const handleDeleteAttachment = (id: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
    toast.success('Attachment deleted');
  };
  
  // Function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Function to get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4 text-blue-500" />;
    if (type === 'application/pdf') return <FileText className="w-4 h-4 text-red-500" />;
    if (type.includes('document') || type.includes('sheet')) return <FileText className="w-4 h-4 text-green-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Paperclip className="w-5 h-5 mr-2" />
          Attachments
        </h3>
        
        <label className="flex items-center text-sm px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer">
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>
      
      {uploading && (
        <div className="bg-muted/30 border border-muted rounded-lg p-4 mb-4 flex items-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
          <span>Uploading files...</span>
        </div>
      )}
      
      {attachments.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <Paperclip className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
          <p className="text-muted-foreground">No attachments yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="p-4 bg-card border border-border rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center mr-3">
                  {getFileIcon(attachment.type)}
                </div>
                <div>
                  <div className="font-medium">{attachment.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size)} • {new Date(attachment.addedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleDeleteAttachment(attachment.id)}
                className="p-1.5 text-muted-foreground hover:text-destructive bg-muted/70 rounded-full hover:bg-destructive/10 transition-colors"
                title="Delete Attachment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}