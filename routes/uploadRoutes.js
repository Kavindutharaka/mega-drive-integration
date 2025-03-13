const express = require('express');
const multer = require('multer');
const fs = require('fs');
const storage = require('../config/storage');
const { getFolderId } = require('../utils/helpers');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.any(), async (req, res) => {
    try {
        const folderName = req.body.folderName;
        if (!req.files || req.files.length === 0) {
            return res.status(400).send("Please provide at least one file to upload.");
        }

        let folderId = "";
        if (folderName) {
            folderId = await getFolderId(folderName);
        }

        for (const file of req.files) {
            const fileStream = fs.createReadStream(file.path);
            const uploadOptions = { name: file.originalname, size: file.size };

            if (folderId) uploadOptions.target = folderId;
            
            const uploadStream = storage.upload(uploadOptions);
            fileStream.pipe(uploadStream);

            await new Promise((resolve, reject) => {
                uploadStream.on('complete', resolve);
                uploadStream.on('error', reject);
            });

            fs.unlinkSync(file.path);
            console.log(`Uploaded: ${file.originalname}`);
        }

        res.send("Files uploaded successfully.");
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).send("Error uploading file.");
    }
});

module.exports = router;
