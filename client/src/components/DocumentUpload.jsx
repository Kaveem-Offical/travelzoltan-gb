import { useState } from 'react';

const DocumentUpload = ({ requiredDocuments = [], onFilesChange }) => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [errors, setErrors] = useState({});

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const validateFile = (file) => {
    if (!file) return null;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 50MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type not allowed. Only PDF, JPG, and PNG are accepted.`;
    }

    return null;
  };

  const handleFileSelect = (documentType, event) => {
    const file = event.target.files[0];
    
    if (!file) {
      // File removed
      const newFiles = { ...selectedFiles };
      delete newFiles[documentType];
      const newErrors = { ...errors };
      delete newErrors[documentType];
      
      setSelectedFiles(newFiles);
      setErrors(newErrors);
      onFilesChange(newFiles);
      return;
    }

    // Validate file
    const error = validateFile(file);
    
    if (error) {
      setErrors({ ...errors, [documentType]: error });
      return;
    }

    // Clear error and add file
    const newErrors = { ...errors };
    delete newErrors[documentType];
    setErrors(newErrors);

    const newFiles = { ...selectedFiles, [documentType]: file };
    setSelectedFiles(newFiles);
    onFilesChange(newFiles);
  };

  const removeFile = (documentType) => {
    const newFiles = { ...selectedFiles };
    delete newFiles[documentType];
    const newErrors = { ...errors };
    delete newErrors[documentType];
    
    setSelectedFiles(newFiles);
    setErrors(newErrors);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (!file) return 'description';
    if (file.type === 'application/pdf') return 'picture_as_pdf';
    if (file.type.startsWith('image/')) return 'image';
    return 'description';
  };

  // Get document type from required documents (handle both string and object formats)
  const getDocumentName = (doc) => {
    if (typeof doc === 'string') return doc;
    return doc.name || doc.title || 'Document';
  };

  const getDocumentDescription = (doc) => {
    if (typeof doc === 'string') return '';
    return doc.description || doc.desc || '';
  };

  const getDocumentIcon = (doc) => {
    if (typeof doc === 'string') return 'description';
    return doc.icon || 'description';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-bold text-on-surface uppercase tracking-wider">
          Required Documents
        </label>
        <span className="text-xs font-semibold bg-surface-container-high px-2 py-1 rounded-full text-on-surface-variant">
          {Object.keys(selectedFiles).length} / {requiredDocuments.length} Uploaded
        </span>
      </div>

      <div className="space-y-3">
        {requiredDocuments.map((doc, index) => {
          const docName = getDocumentName(doc);
          const docDesc = getDocumentDescription(doc);
          const docIcon = getDocumentIcon(doc);
          const file = selectedFiles[docName];
          const error = errors[docName];

          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 shadow-sm ${
                error
                  ? 'bg-error/5 border border-error/50'
                  : file
                  ? 'bg-primary/5 border border-primary/30 shadow-[0_4px_12px_rgba(255,77,133,0.1)]'
                  : 'bg-white border border-outline-variant/50 hover:border-primary/40 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Document Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  file ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-surface-container-lowest text-outline border border-outline-variant/30'
                }`}>
                  <span className="material-symbols-outlined text-2xl">
                    {file ? getFileIcon(file) : docIcon}
                  </span>
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{docName}</h4>
                      {docDesc && (
                        <p className="text-xs text-outline mt-0.5">{docDesc}</p>
                      )}
                    </div>
                    {file && (
                      <button
                        type="button"
                        onClick={() => removeFile(docName)}
                        className="text-error hover:bg-error/10 p-1 rounded transition-colors shrink-0"
                        title="Remove file"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    )}
                  </div>

                  {/* File Info or Upload Button */}
                  {file ? (
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-2">
                      <span className="truncate">{file.name}</span>
                      <span className="text-outline">•</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <label
                        htmlFor={`file-${index}`}
                        className="inline-flex items-center gap-2 text-sm text-primary font-bold cursor-pointer hover:text-[#ff758c] transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">cloud_upload</span>
                        Click to browse
                      </label>
                      <input
                        type="file"
                        id={`file-${index}`}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileSelect(docName, e)}
                        className="hidden"
                      />
                      <p className="text-xs text-outline mt-1">
                        PDF, JPG, or PNG • Max 50MB
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-error">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {requiredDocuments.length > 0 && (
        <div className={`rounded-xl p-4 mt-6 transition-colors duration-300 border ${
          Object.keys(selectedFiles).length === requiredDocuments.length 
            ? 'bg-green-500/10 border-green-500/20' 
            : 'bg-surface-container-low border-outline-variant/30'
        }`}>
          <div className="flex items-center gap-3 text-sm">
            <span className={`material-symbols-outlined ${Object.keys(selectedFiles).length === requiredDocuments.length ? 'text-green-500' : 'text-outline'}`}>
              {Object.keys(selectedFiles).length === requiredDocuments.length ? 'check_circle' : 'info'}
            </span>
            <span className="text-on-surface-variant font-medium">
              {Object.keys(selectedFiles).length === requiredDocuments.length ? (
                <span className="text-green-600 font-bold">All documents uploaded perfectly!</span>
              ) : (
                <>
                  Please upload all <span className="font-bold">{requiredDocuments.length}</span> required documents to proceed.
                </>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
