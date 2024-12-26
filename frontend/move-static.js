const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'out');
const targetDir = path.join(__dirname, '..', 'backend', 'src', 'main', 'resources', 'static');

function copyDirectory(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);

    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);

        const stats = fs.statSync(sourcePath);

        if (stats.isDirectory()) {
            copyDirectory(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}

try {
    if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
    }

    copyDirectory(sourceDir, targetDir);
    console.log('[DONE] frontend/out -> backend/src/main/resources/static');
} catch (error) {
    console.error('[ERROR] move-static.js: ', error);
    process.exit(1);
} 