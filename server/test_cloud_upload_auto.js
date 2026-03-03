require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create a dummy PDF file
fs.writeFileSync('dummy_auto.pdf', '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj');

cloudinary.uploader.upload('dummy_auto.pdf', {
    folder: 'cpms/test',
    resource_type: 'auto',
    public_id: 'test_auto_pdf',
}, async function (error, result) {
    if (error) {
        console.error("Upload Error:", error);
    } else {
        console.log("Uploaded successfully. URL:", result.url);
        try {
            const fetchRes = await fetch(result.url);
            console.log("HTTP GET Status:", fetchRes.status);
            console.log("HTTP GET Content-Type:", fetchRes.headers.get('content-type'));
        } catch (err) {
            console.error("Fetch failed:", err);
        }
    }
    fs.unlinkSync('dummy_auto.pdf');
});
