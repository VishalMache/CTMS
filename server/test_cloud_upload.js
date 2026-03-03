require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create a dummy PDF file
fs.writeFileSync('dummy.pdf', '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj');

cloudinary.uploader.upload('dummy.pdf', {
    folder: 'cpms/test',
    resource_type: 'raw',
    use_filename: true,
    unique_filename: true
}, function (error, result) {
    if (error) console.error("Upload Error:", error);
    else console.log("Upload Result:", result);
    fs.unlinkSync('dummy.pdf');
});
