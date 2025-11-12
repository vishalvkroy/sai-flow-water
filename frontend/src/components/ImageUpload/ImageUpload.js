import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiTrash2, FiImage, FiX } from 'react-icons/fi';
import { uploadsAPI, BASE_URL } from '../../utils/api';

const UploadContainer = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  background: #f9fafb;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  &.dragover {
    border-color: #3b82f6;
    background: #dbeafe;
    transform: scale(1.02);
  }

  input[type="file"] {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
`;

const UploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  pointer-events: none;

  .upload-icon {
    width: 48px;
    height: 48px;
    color: #6b7280;
    transition: color 0.3s ease;
  }

  .upload-text {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
  }

  .upload-subtext {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ImageCard = styled(motion.div)`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
    border-color: #3b82f6;
  }

  img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    display: block;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover .image-overlay {
    opacity: 1;
  }

  .delete-btn {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #dc2626;
      transform: scale(1.1);
    }
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled(motion.div)`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 10, 
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFiles = (files) => {
    const errors = [];
    
    if (images.length + files.length > maxImages) {
      errors.push(`Maximum ${maxImages} images allowed`);
    }

    for (const file of files) {
      if (!acceptedTypes.includes(file.type)) {
        errors.push(`${file.name}: Only JPG, PNG, and WebP files are allowed`);
      }
      
      if (file.size > maxSize) {
        errors.push(`${file.name}: File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      }
    }

    return errors;
  };

  const handleFileUpload = async (files) => {
    const fileArray = Array.from(files);
    const validationErrors = validateFiles(fileArray);

    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setError('');
    setUploading(true);

    try {
      const response = await uploadsAPI.uploadProductImages(fileArray);

      if (response.data.success) {
        const newImages = [...images, ...response.data.data];
        onImagesChange(newImages);
        console.log('✅ Images uploaded successfully:', response.data.data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input value to allow re-uploading same file
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = async (imageUrl) => {
    try {
      await uploadsAPI.deleteImage(imageUrl);
      const updatedImages = images.filter(img => img !== imageUrl);
      onImagesChange(updatedImages);
      console.log('✅ Image removed successfully');
    } catch (error) {
      console.error('Error removing image:', error);
      setError('Failed to remove image. Please try again.');
    }
  };

  const formatImageUrl = (imageUrl) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Ensure proper URL formatting
    const baseUrl = BASE_URL.startsWith('http') ? BASE_URL : `https://${BASE_URL}`;
    const imagePath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${baseUrl}${imagePath}`;
  };

  return (
    <div>
      <UploadContainer
        className={dragOver ? 'dragover' : ''}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading && (
          <LoadingOverlay>
            <div className="spinner" />
          </LoadingOverlay>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={uploading}
        />
        
        <UploadContent>
          <FiUpload className="upload-icon" />
          <p className="upload-text">
            {uploading ? 'Uploading images...' : 'Click to upload or drag and drop'}
          </p>
          <p className="upload-subtext">
            PNG, JPG, WebP up to {Math.round(maxSize / (1024 * 1024))}MB each (Max {maxImages} images)
          </p>
        </UploadContent>
      </UploadContainer>

      <AnimatePresence>
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <FiX />
            {error}
          </ErrorMessage>
        )}
      </AnimatePresence>

      {images.length > 0 && (
        <ImagesGrid>
          <AnimatePresence>
            {images.map((image, index) => (
              <ImageCard
                key={`${image}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={formatImageUrl(image)}
                  alt={`Product ${index + 1}`}
                  onError={(e) => {
                    e.target.src = '/default-product.jpg';
                  }}
                />
                <div className="image-overlay">
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image);
                    }}
                    title="Remove image"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </ImageCard>
            ))}
          </AnimatePresence>
        </ImagesGrid>
      )}
    </div>
  );
};

export default ImageUpload;
