const express = require('express');
const fs = require('fs');
const path = require('path');
const storage = require('../configStorage/storage');
const { getFolderId } = require('../utils/helpers');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { folderName, downloadDir } = req.query;
        if (!folderName || !downloadDir) {
            return res.status(400).send("Please provide folderName and downloaddir.");
        }

        const folderId = await getFolderId(folderName);
        const fullDownloadDir = path.join(__dirname, '..', downloadDir);

        if (!fs.existsSync(fullDownloadDir)) {
            fs.mkdirSync(fullDownloadDir, { recursive: true });
        }

        const folder = storage.files[folderId];
        if (!folder || !folder.directory) {
            return res.status(404).send('Folder not found.');
        }

        async function downloadFolder(folder, destination) {
            for (const child of folder.children) {
                const childPath = path.join(destination, child.name);

                if (child.directory) {
                    if (!fs.existsSync(childPath)) {
                        fs.mkdirSync(childPath, { recursive: true });
                    }
                    console.log(`Created folder: ${childPath}`);
                    await downloadFolder(child, childPath);
                } else {
                    console.log(`Downloading file: ${child.name}`);
                    await new Promise((resolve, reject) => {
                        const writeStream = fs.createWriteStream(childPath);
                        child.download().pipe(writeStream);

                        writeStream.on('finish', resolve);
                        writeStream.on('error', reject);
                    });
                }
            }
        }
        await downloadFolder(folder, fullDownloadDir);
        res.send("All files downloaded successfully.");
    } catch (err) {
        console.error('Download error:', err);
        res.status(500).send("Error downloading file.");
    }
});

module.exports = router;
