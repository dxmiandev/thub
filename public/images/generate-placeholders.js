/**
 * This script generates placeholder images for the application
 * Run it with Node.js: node generate-placeholders.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PLACEHOLDERS = [
  {
    name: 'truck-placeholder.jpg',
    url: 'https://via.placeholder.com/400x300/eee/999?text=Truck+Image'
  },
  {
    name: 'trailer-placeholder.jpg',
    url: 'https://via.placeholder.com/400x300/eee/999?text=Trailer+Image'
  },
  {
    name: 'placeholder.jpg',
    url: 'https://via.placeholder.com/400x300/eee/999?text=Image+Not+Available'
  },
  {
    name: 'default-truck.jpg',
    url: 'https://via.placeholder.com/800x600/eee/999?text=Truck+Details'
  }
];

// Create images directory if it doesn't exist
const imagesDir = __dirname;

// Function to download image from URL
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${filePath}...`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image from ${url}, status code: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${url} to ${filePath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete file if download failed
      reject(err);
    });
    
    file.on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete file if write failed
      reject(err);
    });
  });
}

// Main function to generate all placeholders
async function generatePlaceholders() {
  console.log(`Generating placeholder images in ${imagesDir}...`);
  
  try {
    // Download each placeholder image
    for (const placeholder of PLACEHOLDERS) {
      const filePath = path.join(imagesDir, placeholder.name);
      await downloadImage(placeholder.url, filePath);
    }
    
    console.log('All placeholder images have been generated successfully!');
    console.log('If you see any warnings about failed downloads, you may need to create your own placeholder images manually.');
  } catch (error) {
    console.error('Error generating placeholder images:', error);
  }
}

// Run the function
generatePlaceholders(); 