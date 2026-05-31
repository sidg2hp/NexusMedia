'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import imageCompression from 'browser-image-compression';

interface MediaUploaderProps {
  eventId: string;
}

export default function MediaUploader({ eventId }: MediaUploaderProps) {
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [
      ...prev,
      ...acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.mov', '.webm']
    }
  });

  const removeFile = (name: string) => {
    setFiles(files => files.filter(f => f.name !== name));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    setUploading(true);
    
    try {
      // Upload each file to S3 via presigned URLs
      for (const file of files) {
        let uploadFile: File = file;

        if (file.type.startsWith('image/')) {
          try {
            uploadFile = await imageCompression(file, {
              maxSizeMB: 2,
              maxWidthOrHeight: 1920,
              useWebWorker: true
            });
          } catch (error) {
            console.error('Compression error:', error);
            // proceed with original file if compression fails
          }
        }

        // 1. Get presigned URL
        const urlRes = await fetch('/api/media/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: uploadFile.name,
            fileType: uploadFile.type,
            isPublic
          })
        });
        const { uploadUrl, key } = await urlRes.json();

        // 2. PUT to S3
        const s3Res = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': uploadFile.type },
          body: uploadFile
        });

        if (!s3Res.ok) {
          const s3Error = await s3Res.text();
          throw new Error(`S3 Upload Failed: ${s3Res.status} ${s3Error}`);
        }

        // 3. Save to database
        const dbRes = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key,
            eventId,
            fileType: file.type,
            isPublic
          })
        });

        if (!dbRes.ok) {
          const errorText = await dbRes.text();
          throw new Error(`Failed to save media to database: ${errorText}`);
        }
      }

      setFiles([]);
      alert('Upload completed successfully!');
      window.location.reload(); // Refresh to see the new images in the gallery
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Failed to upload some files.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div 
        {...getRootProps()} 
        className={`glass-card border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-primary bg-primary/10 scale-105' : 'border-white/20 hover:border-primary/50'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary text-white' : 'bg-white/10 text-primary'}`}>
            <CloudArrowUpIcon className="w-10 h-10" />
          </div>
          <div>
            <p className="text-xl text-white font-medium mb-1">
              {isDragActive ? 'Drop files here to upload' : 'Click or Drag & Drop Media'}
            </p>
            <p className="text-gray-400 text-sm">Supports JPG, PNG, WEBP, MP4 up to 50MB</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-8 animate-fade-in">
          <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-white">Selected Media ({files.length})</h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isPublic} 
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded bg-surface border-white/20 text-primary focus:ring-primary"
                />
                Make Public
              </label>
              <button 
                onClick={uploadFiles} 
                disabled={uploading}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-full font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Uploading...</>
                ) : 'Upload All'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map(file => (
              <div key={file.name} className="relative group rounded-lg overflow-hidden glass aspect-square">
                {file.type.startsWith('video') ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/50">
                    <PhotoIcon className="w-10 h-10 text-gray-500" />
                  </div>
                ) : (
                  <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={(e) => { e.stopPropagation(); removeFile(file.name); }} className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
