const storage = require('../config/storage');

const navigateToPath = (storage, path) => {
    let currentFolder = storage.root;
    const folders = path.split('/');

    for (const folder of folders) {
        if (currentFolder) {
            currentFolder = currentFolder.navigate(folder);
        } else {
            return null;
        }
    }
    return currentFolder;
};

const getFolderId = async (folderName) => {
    return new Promise((resolve, reject) => {
        if (storage.ready) {
            const folder = navigateToPath(storage, folderName);
            return folder ? resolve(folder.nodeId) : reject(new Error("Folder not found."));
        }

        storage.on('ready', () => {
            const folder = navigateToPath(storage, folderName);
            folder ? resolve(folder.nodeId) : reject(new Error("Folder not found."));
        });
    });
};

module.exports = { getFolderId };
