import fs from 'fs';
import { readFiles } from 'h3-formidable';
import { StorageData, client } from './data';

export default defineEventHandler(async (event) => {
  const files = await readFiles(event);
  const file = files?.file?.[0];

  if (!file) {
    throw new Error('No file');
  }

  return new Promise<StorageData>(async (resolve, reject) => {
    const blobParts: Buffer[] = [];

    fs.createReadStream(file.filepath)
      .on('data', (chunk) => {
        blobParts.push(Buffer.from(chunk));
      })
      .on('end', async () => {
        const blob = new Blob(blobParts);

        const { cid, path, size } = await client.add(blob);

        resolve({ cid, path, size });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
});
