const express = require('express');
const fs = require('fs');
const archiver = require('archiver');
const storage = require('../config/storage');
const { getFolderId } = require('../utils/helpers');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { folderName } = req.query;
        if (!folderName) {
            return res.status(400).send("Please provide folderName.");
        }
        const folderId = await getFolderId(folderName);
        const folder = storage.files[folderId];
        if (!folder || !folder.directory) {
            return res.status(404).send('Folder not found.');
        }
        res.setHeader('Content-Disposition', `attachment; filename="${folderName}.zip"`);
        res.setHeader('Content-Type', 'application/zip');
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);
        async function addFilesToZip(folder, zipPath = '') {
            for (const child of folder.children) {
                const childZipPath = zipPath ? `${zipPath}/${child.name}` : child.name;
                if (child.directory) {
                    await addFilesToZip(child, childZipPath);
                } else {
                    console.log(`Adding file: ${child.name}`);
                    archive.append(child.download(), { name: childZipPath });
                }
            }
        }
        await addFilesToZip(folder);
        archive.finalize();
    } catch (err) {
        console.error('Download error:', err);
        res.status(500).send("Error downloading files.");
    }
});
module.exports = router;
