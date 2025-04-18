const fs = require('node:fs');
const path = require('node:path');
const { create } = require('ipfs-http-client');
const Arweave = require('arweave');

// Configuration
const config = require('../ecoart.config.json');

// IPFS client setup
const ipfs = create({ url: config.storage.ipfs.gateway });

// Arweave setup
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

async function deployToIPFS(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    const result = await ipfs.add(content);
    console.log(`Deployed ${filePath} to IPFS with hash: ${result.path}`);
    return result.path;
  } catch (error) {
    console.error(`Failed to deploy ${filePath} to IPFS:`, error);
    return null;
  }
}

async function deployToArweave(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    const transaction = await arweave.createTransaction({ data: content });
    await arweave.transactions.sign(transaction);
    await arweave.transactions.post(transaction);
    console.log(`Deployed ${filePath} to Arweave with ID: ${transaction.id}`);
    return transaction.id;
  } catch (error) {
    console.error(`Failed to deploy ${filePath} to Arweave:`, error);
    return null;
  }
}

async function deployToRadicle(filePath) {
  // TODO: Implement Radicle deployment
  console.log('Radicle deployment to be implemented');
}

async function main() {
  const files = [
    'ecoart.md',
    'README.md',
    'LICENSE',
    'ecoart.config.json'
  ];

  for (const file of files) {
    if (config.storage.ipfs.enabled) {
      await deployToIPFS(file);
    }
    
    if (config.storage.arweave.enabled) {
      await deployToArweave(file);
    }
    
    if (config.storage.radicle.enabled) {
      await deployToRadicle(file);
    }
  }

  // Create deployment manifest
  const manifest = {
    timestamp: new Date().toISOString(),
    deployments: {
      ipfs: {},
      arweave: {},
      radicle: {}
    }
  };

  fs.writeFileSync(
    'deployment-manifest.json',
    JSON.stringify(manifest, null, 2)
  );
}

main().catch(console.error); 