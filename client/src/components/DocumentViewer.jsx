import { documentAPI } from '../services/api';

const DocumentViewer = ({ documents = [] }) => {
  const handleDownload = (documentId) => {
    documentAPI.downloadDocument(documentId);
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return 'description';
    if (mimeType === 'application/pdf') return 'picture_as_pdf';
    if (mimeType.startsWith('image/')) return 'image';
    return 'description';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStorageIcon = (storageType) => {
    switch (storageType) {
      case 'drive':
        return 'cloud';
      case 'cloudinary':
        return 'cloud_upload';
      case 'local':
        return 'storage';
      default:
        return 'folder';
    }
  };

  const getStorageColor = (storageType) => {
    switch (storageType) {
      case 'drive':
        return 'text-blue-600';
      case 'cloudinary':
        return 'text-purple-600';
      case 'local':
        return 'text-gray-600';
      default:
        return 'text-outline';
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="p-4 bg-surface-container-low rounded-lg text-center">
        <span className="material-symbols-outlined text-outline text-4xl mb-2">folder_off</span>
        <p className="text-sm text-outline">No documents uploaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-4 p-4 bg-surface-container-low rounded-lg hover:bg-surface-container-high transition-colors group"
        >
          {/* File Icon */}
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary">
              {getFileIcon(doc.mime_type)}
            </span>
          </div>

          {/* Document Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{doc.document_type}</h4>
                <p className="text-xs text-outline truncate">{doc.file_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1">
              <span>{formatFileSize(doc.file_size)}</span>
              <span className="text-outline">•</span>
              <span className="flex items-center gap-1">
                <span className={`material-symbols-outlined text-xs ${getStorageColor(doc.storage_type)}`}>
                  {getStorageIcon(doc.storage_type)}
                </span>
                {doc.storage_type === 'drive' ? 'Google Drive' : 
                 doc.storage_type === 'cloudinary' ? 'Cloudinary' : 'Local'}
              </span>
              <span className="text-outline">•</span>
              <span>{new Date(doc.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={() => handleDownload(doc.id)}
            className="shrink-0 px-4 py-2 bg-primary text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 opacity-0 group-hover:opacity-100"
            title="Download document"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Download
          </button>
        </div>
      ))}
    </div>
  );
};

export default DocumentViewer;
