const { google } = require('googleapis');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const stream = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Google Drive Configuration
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Get Google Drive client using Service Account
 */
const getDriveClient = () => {
  try {
    // Check if service account credentials are provided
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.warn('[Drive] Service account credentials not configured');
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      },
      scopes: SCOPES
    });

    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('[Drive] Error creating client:', error.message);
    return null;
  }
};

/**
 * Upload file to Google Drive
 * @param {Object} file - Multer file object
 * @param {string} documentType - Type of document
 * @returns {Promise<Object>} Upload result
 */
const uploadToGoogleDrive = async (file, documentType) => {
  const drive = getDriveClient();
  
  if (!drive) {
    throw new Error('Google Drive client not configured');
  }

  try {
    const fileMetadata = {
      name: `${documentType}_${Date.now()}_${file.originalname}`,
      parents: GOOGLE_DRIVE_FOLDER_ID ? [GOOGLE_DRIVE_FOLDER_ID] : []
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, mimeType, size, webViewLink'
    });

    // Set file permissions to private (only accessible via service account)
    // Do NOT make public - we'll stream through our API
    
    console.log('[Drive] Upload successful:', response.data.id);

    return {
      success: true,
      file_url: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
      storage_type: 'drive',
      file_name: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,
      drive_file_id: response.data.id
    };
  } catch (error) {
    console.error('[Drive] Upload failed:', error.message);
    throw error;
  }
};

/**
 * Upload file to Cloudinary
 * @param {Object} file - Multer file object
 * @param {string} documentType - Type of document
 * @returns {Promise<Object>} Upload result
 */
const uploadToCloudinary = async (file, documentType) => {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      throw new Error('Cloudinary not configured');
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'visa-documents',
          resource_type: 'auto',
          public_id: `${documentType}_${Date.now()}_${path.parse(file.originalname).name}`,
          access_mode: 'authenticated' // Secure upload
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      fs.createReadStream(file.path).pipe(uploadStream);
    });

    console.log('[Cloudinary] Upload successful:', result.public_id);

    return {
      success: true,
      file_url: result.secure_url,
      storage_type: 'cloudinary',
      file_name: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,
      cloudinary_public_id: result.public_id
    };
  } catch (error) {
    console.error('[Cloudinary] Upload failed:', error.message);
    throw error;
  }
};

/**
 * Upload file locally (fallback)
 * @param {Object} file - Multer file object
 * @returns {Object} Upload result
 */
const uploadLocally = (file) => {
  console.log('[Local] Using local storage');
  
  return {
    success: true,
    file_url: `/uploads/${file.filename}`,
    storage_type: 'local',
    file_name: file.originalname,
    mime_type: file.mimetype,
    file_size: file.size
  };
};

/**
 * Main upload function with fallback logic
 * @param {Object} file - Multer file object
 * @param {string} documentType - Type of document
 * @param {number} retries - Number of retries (default: 2)
 * @returns {Promise<Object>} Upload result
 */
const uploadDocument = async (file, documentType, retries = 2) => {
  let lastError = null;

  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file size (50MB max)
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum limit of 50MB`);
  }

  // Validate file type
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error(`File type ${file.mimetype} not allowed. Only PDF, JPG, and PNG are accepted.`);
  }

  console.log(`[Upload] Starting upload for ${documentType}: ${file.originalname}`);

  // Try Google Drive first (with retries)
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[Upload] Attempt ${attempt}/${retries} - Trying Google Drive...`);
      const result = await uploadToGoogleDrive(file, documentType);
      
      // Clean up local file after successful upload
      cleanupLocalFile(file.path);
      
      return result;
    } catch (error) {
      lastError = error;
      console.error(`[Upload] Google Drive attempt ${attempt} failed:`, error.message);
      
      if (attempt < retries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Fallback to Cloudinary
  try {
    console.log('[Upload] Falling back to Cloudinary...');
    const result = await uploadToCloudinary(file, documentType);
    
    // Clean up local file after successful upload
    cleanupLocalFile(file.path);
    
    return result;
  } catch (error) {
    console.error('[Upload] Cloudinary fallback failed:', error.message);
    lastError = error;
  }

  // Final fallback to local storage
  console.log('[Upload] Using local storage as final fallback');
  const result = uploadLocally(file);
  
  // Don't clean up local file since we're using it
  
  return result;
};

/**
 * Upload multiple documents
 * @param {Array} files - Array of multer file objects
 * @param {Array} documentTypes - Array of document types matching files
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleDocuments = async (files, documentTypes) => {
  if (!files || files.length === 0) {
    return [];
  }

  if (documentTypes && documentTypes.length !== files.length) {
    throw new Error('Number of document types must match number of files');
  }

  const uploadPromises = files.map((file, index) => {
    const docType = documentTypes ? documentTypes[index] : 'document';
    return uploadDocument(file, docType);
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('[Upload] Batch upload failed:', error.message);
    throw error;
  }
};

/**
 * Download file from Google Drive
 * @param {string} fileId - Google Drive file ID
 * @returns {Promise<stream.Readable>} File stream
 */
const downloadFromGoogleDrive = async (fileId) => {
  const drive = getDriveClient();
  
  if (!drive) {
    throw new Error('Google Drive client not configured');
  }

  try {
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return response.data;
  } catch (error) {
    console.error('[Drive] Download failed:', error.message);
    throw error;
  }
};

/**
 * Get file metadata from Google Drive
 * @param {string} fileId - Google Drive file ID
 * @returns {Promise<Object>} File metadata
 */
const getGoogleDriveFileMetadata = async (fileId) => {
  const drive = getDriveClient();
  
  if (!drive) {
    throw new Error('Google Drive client not configured');
  }

  try {
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size'
    });

    return response.data;
  } catch (error) {
    console.error('[Drive] Get metadata failed:', error.message);
    throw error;
  }
};

/**
 * Clean up local file
 * @param {string} filePath - Path to file
 */
const cleanupLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('[Cleanup] Removed local file:', filePath);
    }
  } catch (error) {
    console.error('[Cleanup] Failed to remove local file:', error.message);
  }
};

/**
 * Delete file from storage
 * @param {string} storageType - Storage type (drive, cloudinary, local)
 * @param {Object} fileInfo - File information
 * @returns {Promise<boolean>} Success status
 */
const deleteDocument = async (storageType, fileInfo) => {
  try {
    switch (storageType) {
      case 'drive':
        if (!fileInfo.drive_file_id) {
          throw new Error('Drive file ID not provided');
        }
        const drive = getDriveClient();
        if (drive) {
          await drive.files.delete({ fileId: fileInfo.drive_file_id });
          console.log('[Drive] File deleted:', fileInfo.drive_file_id);
        }
        break;

      case 'cloudinary':
        if (!fileInfo.cloudinary_public_id) {
          throw new Error('Cloudinary public ID not provided');
        }
        await cloudinary.uploader.destroy(fileInfo.cloudinary_public_id);
        console.log('[Cloudinary] File deleted:', fileInfo.cloudinary_public_id);
        break;

      case 'local':
        if (!fileInfo.file_url) {
          throw new Error('File URL not provided');
        }
        const filePath = path.join(__dirname, '..', fileInfo.file_url);
        cleanupLocalFile(filePath);
        break;

      default:
        throw new Error(`Unknown storage type: ${storageType}`);
    }

    return true;
  } catch (error) {
    console.error('[Delete] Failed to delete file:', error.message);
    return false;
  }
};

module.exports = {
  uploadDocument,
  uploadMultipleDocuments,
  downloadFromGoogleDrive,
  getGoogleDriveFileMetadata,
  deleteDocument,
  uploadToGoogleDrive,
  uploadToCloudinary,
  uploadLocally
};
