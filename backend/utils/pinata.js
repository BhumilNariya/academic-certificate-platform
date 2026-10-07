
const fs = require('fs');
const path = require('path');

const PINATA_UPLOAD_URL = 'https://uploads.pinata.cloud/v3/files';

function getPinataJwt() {
  if (!process.env.PINATA_JWT) {
    throw new Error('PINATA_JWT is not configured');
  }

  return process.env.PINATA_JWT;
}

async function uploadToPinata(formData) {
  const response = await fetch(PINATA_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getPinataJwt()}`
    },
    body: formData
  });

  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload?.details || payload?.reason || 'Pinata upload failed');
    error.pinata = payload;
    throw error;
  }

  const result = payload?.data || payload;
  if (!result?.cid) {
    throw new Error('Pinata upload succeeded without returning a CID');
  }

  return {
    ...result,
    IpfsHash: result.cid
  };
}

// Upload file to Pinata
async function uploadFileToPinata(filepath, customName) {
  try {
    const filename = customName || path.basename(filepath);
    const fileBuffer = await fs.promises.readFile(filepath);
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]), filename || `certificate-${Date.now()}`);
    formData.append('network', 'public');

    return await uploadToPinata(formData);
  } catch (err) {
    console.error('Pinata file upload error:', err.pinata || err);
    throw err;
  }
}

// Upload JSON to Pinata
async function uploadJSONToPinata(json, customName = `metadata-${Date.now()}.json`) {
  try {
    const formData = new FormData();
    const jsonBuffer = Buffer.from(JSON.stringify(json));
    formData.append('file', new Blob([jsonBuffer], { type: 'application/json' }), customName);
    formData.append('network', 'public');

    return await uploadToPinata(formData);
  } catch (err) {
    console.error('Pinata JSON upload error:', err.pinata || err);
    throw err;
  }
}

module.exports = {
  uploadFileToPinata,
  uploadJSONToPinata
};
