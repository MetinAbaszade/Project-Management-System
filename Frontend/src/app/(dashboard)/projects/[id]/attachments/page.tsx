"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Upload, FileText, Filter, Trash2, Plus, AlertCircle, X, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

const FilesPage = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;
  
  const goBack = () => {
    router.push(`/projects/${projectId}`);
  };
  const [files, setFiles] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  // Load files from localStorage on component mount
  useEffect(() => {
    const storedFiles = localStorage.getItem('taskupFiles');
    if (storedFiles) {
      setFiles(JSON.parse(storedFiles));
    }
  }, []);

  // Save files to localStorage whenever files state changes
  useEffect(() => {
    localStorage.setItem('taskupFiles', JSON.stringify(files));
  }, [files]);

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    
    if (uploadedFiles.length === 0) return;
    
    const newFiles = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      location: filterType === 'all' ? 'general' : filterType,
      uploadDate: new Date().toISOString(),
      url: URL.createObjectURL(file)
    }));
    
    setFiles([...newFiles, ...files]);
  };

  const handleDeleteFile = (id) => {
    const updatedFiles = files.filter(file => file.id !== id);
    setFiles(updatedFiles);
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || file.location === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('image')) return '📷';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('document') || fileType.includes('word')) return '📝';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
    return '📁';
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-blue-50 p-5 rounded-full mb-4 shadow-sm">
        <FileText className="h-8 w-8 text-blue-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No files yet</h3>
      <p className="text-gray-500 text-sm mb-5 text-center max-w-sm">
        Upload your first file to keep track of important project documents
      </p>
      <button
        onClick={() => fileInputRef.current.click()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Plus className="h-4 w-4 mr-2" />
        Upload Files
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={goBack}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4 transition-colors duration-200 ease-in-out"
        >
          <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center mr-2 shadow-sm hover:bg-gray-100 transition-colors duration-200">
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </div>
          <span>Back to Project</span>
        </button>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Project Files</h2>
          <button
            onClick={() => fileInputRef.current.click()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </button>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
            onClick={(e) => e.target.value = null}
          />
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ease-in-out shadow-sm"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="block w-full pl-4 pr-10 py-3 text-sm border border-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-full bg-gray-50 shadow-sm appearance-none cursor-pointer transition-all duration-200 ease-in-out"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Files</option>
            <option value="task">Task Files</option>
            <option value="scope">Scope Files</option>
            <option value="general">General Files</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {files.length === 0 ? (
        <EmptyState />
      ) : filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-blue-50 p-5 rounded-full mb-4 shadow-sm">
            <AlertCircle className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No matching files</h3>
          <p className="text-gray-500 text-sm mb-5 text-center max-w-sm">
            Try adjusting your search or filter to find what you're looking for
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="overflow-hidden shadow-md rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th scope="col" className="relative py-4 pl-3 pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredFiles.map(file => (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                  <td className="py-4 pl-6 pr-3 text-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 text-xl mr-3 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="truncate font-medium text-gray-900 w-48">
                          {file.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 capitalize">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {file.location}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 pl-3 pr-6 text-right text-sm font-medium">
                    <div className="flex space-x-3 justify-end">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-200"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </a>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-500 hover:text-red-700 flex items-center transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FilesPage;