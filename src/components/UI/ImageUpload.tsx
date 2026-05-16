import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImagesChange, maxImages = 5 }) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);

    // Check max images
    if (selectedFiles.length + newFiles.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images.`);
      return;
    }

    const updatedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedFiles);
    onImagesChange(updatedFiles);

    // Generate previews
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  }, [selectedFiles, maxImages, onImagesChange]);

  const removeImage = useCallback((index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedUrls = previewUrls.filter((_, i) => i !== index);

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);

    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedUrls);
    onImagesChange(updatedFiles);
  }, [selectedFiles, previewUrls, onImagesChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${selectedFiles.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. {maxImages} images)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            multiple
            onChange={handleFileChange}
            disabled={selectedFiles.length >= maxImages}
          />
        </label>
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <img src={url} alt={`Preview ${index}`} className="w-full h-24 object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
