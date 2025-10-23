const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const cloudfront = process.env.CLOUDFRONT_URL;

class FileStorageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    this.initializeUploadDir();
  }

  async initializeUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
  }

  // Configure multer for file uploads
  getMulterConfig() {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit for video files
      },
      fileFilter: (req, file, cb) => {
        // Allow video, audio, and image files
        const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mp3|wav|ogg|jpg|jpeg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('Only video, audio, and image files are allowed!'));
        }
      }
    });
  }

  // Upload file to AWS S3
  async uploadToS3(file, key, metadata = {}) {
    try {
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadDate: new Date().toISOString(),
          ...metadata
        },
        // Set appropriate cache control for different file types
        CacheControl: file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')
          ? 'max-age=3600' // 1 hour for media files
          : 'max-age=86400' // 24 hours for other files
      };

      const result = await s3.upload(uploadParams).promise();

      return {
        success: true,
        url: cloudfront ? `${cloudfront}/${key}` : result.Location,
        key: key,
        bucket: result.Bucket,
        etag: result.ETag,
        size: file.size
      };

    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  // Generate unique file key
  generateFileKey(userId, sessionId, originalName, type = 'recording') {
    const timestamp = Date.now();
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);

    return `recordings/${type}/${userId}/${sessionId}/${timestamp}_${baseName}${extension}`;
  }

  // Upload session recording
  async uploadRecording(file, userId, sessionId, metadata = {}) {
    try {
      const key = this.generateFileKey(userId, sessionId, file.originalname, 'session');

      const uploadResult = await this.uploadToS3(file, key, {
        sessionId: sessionId,
        userId: userId,
        type: 'session_recording',
        ...metadata
      });

      return uploadResult;

    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  }

  // Upload profile picture
  async uploadProfilePicture(file, userId) {
    try {
      const key = `profiles/${userId}/profile_${Date.now()}${path.extname(file.originalname)}`;

      const uploadResult = await this.uploadToS3(file, key, {
        userId: userId,
        type: 'profile_picture'
      });

      return uploadResult;

    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  // Upload skill certificate
  async uploadCertificate(file, userId, skillId) {
    try {
      const key = `certificates/${userId}/${skillId}_${Date.now()}${path.extname(file.originalname)}`;

      const uploadResult = await this.uploadToS3(file, key, {
        userId: userId,
        skillId: skillId,
        type: 'skill_certificate'
      });

      return uploadResult;

    } catch (error) {
      console.error('Error uploading certificate:', error);
      throw error;
    }
  }

  // Delete file from S3
  async deleteFromS3(key) {
    try {
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      };

      await s3.deleteObject(deleteParams).promise();

      return {
        success: true,
        message: 'File deleted successfully'
      };

    } catch (error) {
      console.error('Error deleting from S3:', error);
      throw new Error(`S3 deletion failed: ${error.message}`);
    }
  }

  // Get file info from S3
  async getFileInfo(key) {
    try {
      const headParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      };

      const headResult = await s3.headObject(headParams).promise();

      return {
        success: true,
        key: key,
        size: headResult.ContentLength,
        contentType: headResult.ContentType,
        lastModified: headResult.LastModified,
        metadata: headResult.Metadata
      };

    } catch (error) {
      if (error.code === 'NotFound') {
        return { success: false, error: 'File not found' };
      }
      console.error('Error getting file info:', error);
      throw error;
    }
  }

  // Generate signed URL for private file access
  async generateSignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Expires: expiresIn
      };

      const signedUrl = await s3.getSignedUrlPromise('getObject', params);

      return {
        success: true,
        signedUrl: signedUrl,
        expiresIn: expiresIn
      };

    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }

  // Batch upload multiple files
  async uploadMultipleFiles(files, userId, sessionId) {
    const uploadPromises = files.map(file =>
      this.uploadRecording(file, userId, sessionId)
    );

    try {
      const results = await Promise.allSettled(uploadPromises);

      const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      const failed = results
        .filter(result => result.status === 'rejected')
        .map((result, index) => ({
          fileIndex: index,
          error: result.reason.message
        }));

      return {
        success: true,
        uploaded: successful,
        failed: failed,
        totalUploaded: successful.length,
        totalFailed: failed.length
      };

    } catch (error) {
      console.error('Error in batch upload:', error);
      throw error;
    }
  }

  // Clean up old temporary files
  async cleanupTempFiles() {
    try {
      const files = await fs.readdir(this.uploadDir);

      for (const file of files) {
        const filePath = path.join(this.uploadDir, file);
        const stats = await fs.stat(filePath);

        // Delete files older than 24 hours
        if (Date.now() - stats.mtime.getTime() > 24 * 60 * 60 * 1000) {
          await fs.unlink(filePath);
          console.log(`Cleaned up old temp file: ${file}`);
        }
      }

    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  // Validate file before upload
  validateFile(file) {
    const errors = [];

    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      errors.push('File size exceeds 100MB limit');
    }

    // Check file type
    const allowedTypes = [
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm',
      'audio/mp3', 'audio/wav', 'audio/ogg',
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('File type not supported');
    }

    // Check file name
    if (!file.originalname || file.originalname.length === 0) {
      errors.push('File name is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const objects = await s3.listObjectsV2({
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: 'recordings/'
      }).promise();

      let totalSize = 0;
      let fileCount = 0;
      const fileTypes = {};

      objects.Contents?.forEach(obj => {
        totalSize += obj.Size;
        fileCount++;

        const ext = path.extname(obj.Key).toLowerCase();
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      });

      return {
        success: true,
        data: {
          total_files: fileCount,
          total_size_mb: Math.round(totalSize / (1024 * 1024)),
          file_types: fileTypes,
          bucket: process.env.AWS_S3_BUCKET
        }
      };

    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const fileStorageService = new FileStorageService();

// Clean up temp files every hour
setInterval(() => {
  fileStorageService.cleanupTempFiles();
}, 60 * 60 * 1000);

module.exports = fileStorageService;
