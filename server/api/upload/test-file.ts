import { readFiles } from 'h3-formidable';

const apiKey = process.env.INFURA_API_KEY;

export default defineEventHandler(async (event) => {
  const files = await readFiles(event);
  // const file = files.file[0];
  const apiSecret = process.env.INFURA_API_SECRET;

  console.log('test', 'ok');

  return { ok: true, env1: !!apiKey, env2: !!apiSecret, files: !!files };
});
