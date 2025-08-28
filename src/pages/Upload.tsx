import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import { Upload as UploadIcon, File, CheckCircle, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadProgress: number;
  status: 'uploading' | 'completed' | 'error';
}

const Upload = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const simulateUpload = async (file: File): Promise<void> => {
    const fileObj: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadProgress: 0,
      status: 'uploading'
    };

    setUploadedFiles(prev => [...prev, fileObj]);

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileObj.id 
            ? { ...f, uploadProgress: progress, status: progress === 100 ? 'completed' : 'uploading' }
            : f
        )
      );
    }
  };

  const handleFiles = async (files: FileList) => {
    setIsUploading(true);
    setDragActive(false);

    const fileArray = Array.from(files);
    
    // Validate file types
    const allowedTypes = [
      'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    const validFiles = fileArray.filter(file => 
      allowedTypes.includes(file.type) || file.name.endsWith('.csv')
    );

    if (validFiles.length === 0) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload CSV, Excel, or JSON files only.',
        variant: 'destructive'
      });
      setIsUploading(false);
      return;
    }

    try {
      await Promise.all(validFiles.map(simulateUpload));
      
      toast({
        title: 'Upload successful!',
        description: `${validFiles.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your files.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasCompletedFiles = uploadedFiles.some(f => f.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">Upload Dataset</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your data files to start building AI models. We support CSV, Excel, JSON files, and image folders.
            </p>
          </div>

          {/* Upload Area */}
          <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
            <CardContent className="p-12">
              <div
                className={`text-center space-y-6 ${dragActive ? 'scale-105' : ''} transition-transform`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="mx-auto w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center float-animation">
                  <UploadIcon className="w-12 h-12 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-foreground">
                    Drop your files here
                  </h3>
                  <p className="text-muted-foreground">
                    or click to browse your computer
                  </p>
                </div>

                <div className="space-y-4">
                  <input
                    type="file"
                    multiple
                    accept=".csv,.json,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="file-upload">
                    <Button variant="hero" size="lg" className="cursor-pointer" asChild>
                      <span>
                        <UploadIcon className="w-5 h-5" />
                        Choose Files
                      </span>
                    </Button>
                  </label>
                  
                  <p className="text-sm text-muted-foreground">
                    Supports CSV, Excel (.xlsx, .xls), JSON files up to 100MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <File className="w-5 h-5" />
                  <span>Uploaded Files</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{file.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)}
                          </span>
                          {file.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-success" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {file.status === 'uploading' && (
                        <Progress value={file.uploadProgress} className="h-2" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Next Step */}
          {hasCompletedFiles && (
            <div className="text-center space-y-4">
              <div className="p-6 bg-gradient-success/10 border border-success/20 rounded-lg">
                <h3 className="text-lg font-semibold text-success mb-2">
                  Files uploaded successfully!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your data is ready. Now describe what you want to predict.
                </p>
                <Button
                  onClick={() => navigate('/task-setup')}
                  variant="success"
                  size="lg"
                >
                  Continue to Task Setup
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Upload;