const axios = require('axios');

async function testDownload() {
  try {
    // First, get inquiries to see if there are files
    const inquiriesResponse = await axios.get('http://localhost:5000/api/admin/inquiries');
    const inquiries = inquiriesResponse.data.inquiries;

    console.log('Total inquiries:', inquiries.length);

    // Find an inquiry with files
    const inquiryWithFiles = inquiries.find(inq => inq.files && inq.files.length > 0);

    if (!inquiryWithFiles) {
      console.log('No inquiries with files found');
      return;
    }

    console.log('Found inquiry with files:', inquiryWithFiles.inquiryId);
    console.log('Files:', inquiryWithFiles.files);

    // Try to download the first file
    const file = inquiryWithFiles.files[0];
    const filePath = file.filePath;
    const encodedPath = encodeURIComponent(filePath);

    console.log('Attempting to download file:', filePath);
    console.log('Encoded path:', encodedPath);

    const downloadResponse = await axios.get(`http://localhost:5000/api/admin/download/${encodedPath}`, {
      responseType: 'stream'
    });

    console.log('Download response status:', downloadResponse.status);
    console.log('Content-Type:', downloadResponse.headers['content-type']);
    console.log('Content-Length:', downloadResponse.headers['content-length']);

    // The file should be downloaded successfully
    console.log('File download test passed!');

  } catch (error) {
    if (error.response) {
      console.error('Download Error Response:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testDownload();
