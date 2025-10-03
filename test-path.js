const path = require('path');
const fs = require('fs');

// Simulate the path resolution logic from the server
const serverRoutesDir = 'server/routes'; // Simulate server/routes directory

let filePath = 'uploads/inquiries/files-1757751320173-621140461.docx';

console.log('Original filePath:', filePath);

// Handle both relative and absolute paths
let fullPath;
if (path.isAbsolute(filePath)) {
  // If it's already an absolute path, use it directly
  fullPath = filePath;
} else {
  // If it's relative, construct the full path from server root
  fullPath = path.join(serverRoutesDir, '..', filePath);
}

console.log('Resolved fullPath:', fullPath);
console.log('File exists:', fs.existsSync(fullPath));

// Security check - ensure file is within uploads directory
const uploadsDir = path.join(serverRoutesDir, '..', 'uploads');
const resolvedUploadsDir = path.resolve(uploadsDir);
const resolvedFullPath = path.resolve(fullPath);

console.log('Uploads directory:', resolvedUploadsDir);
console.log('File path (resolved):', resolvedFullPath);
console.log('Path starts with uploads:', resolvedFullPath.startsWith(resolvedUploadsDir));
