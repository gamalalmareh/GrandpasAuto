const express = require('express');
const multer = require('multer');
const { v4: uuid } = require('uuid');
const s3 = require('../config/s3');

const router = express.Router();

// Memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed (JPEG, PNG, WebP, GIF)'));
    }
  }
});

// POST /upload - Upload image to S3
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate unique key
    const fileExt = req.file.originalname.split('.').pop();
    const key = `cars/${uuid()}-${Date.now()}.${fileExt}`;

    if (!process.env.AWS_S3_BUCKET) {
      return res.status(400).json({ error: 'AWS S3 not configured' });
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    
    console.log('✅ Image uploaded to S3:', result.Location);

    res.json({
      success: true,
      url: result.Location,
      key: key
    });
  } catch (err) {
    console.error('Upload error:', err);
    
    if (err.code === 'NoCredentialProvider') {
      return res.status(500).json({ 
        error: 'AWS credentials not configured. Check .env file.',
        details: err.message
      });
    }

    res.status(500).json({ 
      error: 'Upload failed',
      details: err.message 
    });
  }
});

module.exports = router;
