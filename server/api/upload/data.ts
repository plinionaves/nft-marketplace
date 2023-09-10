import { create as ipfsHttpClient, CID } from 'ipfs-http-client';

const apiKey = process.env.INFURA_API_KEY;
const apiSecret = process.env.INFURA_API_SECRET;

export const client = ipfsHttpClient({
  url: 'https://ipfs.infura.io:5001/api/v0',
  headers: {
    authorization: `Basic ${btoa(apiKey + ':' + apiSecret)}`,
  },
});

export interface StorageData {
  cid: CID;
  path: string;
  size: number;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const data = JSON.stringify(body);

  const { cid, path, size } = await client.add(data);

  return { cid, path, size };
});
