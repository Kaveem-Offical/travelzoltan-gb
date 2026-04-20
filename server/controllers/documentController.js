const { Document, Application } = require('../models');
const uploadService = require('../services/uploadService');
const fs = require('fs');
const path = require('path');

/**
 * GET /api/document/:id
 * Download a document securely
 */
const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch document from database
    const document = await Document.findByPk(id, {
      include: [{
        model: Application,
        as: 'application',
        attributes: ['id', 'configuration_id']
      }]
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Set response headers
    res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);
    if (document.mime_type) {
      res.setHeader('Content-Type', document.mime_type);
    }

    // Handle different storage types
    switch (document.storage_type) {
      case 'drive':
        try {
          // Stream file from Google Drive
          const fileStream = await uploadService.downloadFromGoogleDrive(document.drive_file_id);
          fileStream.pipe(res);
        } catch (error) {
          console.error('[Download] Google Drive error:', error.message);
          return res.status(500).json({ 
            message: 'Failed to download from Google Drive',
            error: error.message 
          });
        }
        break;

      case 'cloudinary':
        // Redirect to Cloudinary secure URL
        // Alternatively, you could fetch and stream it
        return res.redirect(document.file_url);

      case 'local':
        try {
          // Stream local file
          const filePath = path.join(__dirname, '..', document.file_url);
          
          if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
          }

          const fileStream = fs.createReadStream(filePath);
          fileStream.pipe(res);
        } catch (error) {
          console.error('[Download] Local file error:', error.message);
          return res.status(500).json({ 
            message: 'Failed to download local file',
            error: error.message 
          });
        }
        break;

      default:
        return res.status(400).json({ message: 'Unknown storage type' });
    }
  } catch (error) {
    console.error('[Download] Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

/**
 * GET /api/document/:id/info
 * Get document information without downloading
 */
const getDocumentInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id, {
      include: [{
        model: Application,
        as: 'application',
        attributes: ['id', 'configuration_id']
      }]
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Return document info (excluding sensitive IDs)
    return res.status(200).json({
      id: document.id,
      document_type: document.document_type,
      file_name: document.file_name,
      mime_type: document.mime_type,
      file_size: document.file_size,
      storage_type: document.storage_type,
      created_at: document.created_at
    });
  } catch (error) {
    console.error('[Document Info] Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * DELETE /api/admin/document/:id
 * Delete a document (admin only)
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete from storage
    const deleted = await uploadService.deleteDocument(document.storage_type, {
      drive_file_id: document.drive_file_id,
      cloudinary_public_id: document.cloudinary_public_id,
      file_url: document.file_url
    });

    if (!deleted) {
      console.warn('[Delete] Failed to delete from storage, but removing DB record');
    }

    // Delete from database
    await document.destroy();

    return res.status(200).json({ 
      message: 'Document deleted successfully',
      deleted_from_storage: deleted
    });
  } catch (error) {
    console.error('[Delete Document] Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  downloadDocument,
  getDocumentInfo,
  deleteDocument
};
