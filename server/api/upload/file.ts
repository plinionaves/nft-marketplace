import { client } from './data';

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event);
  const file = files?.[0];

  if (!file) {
    throw createError({
      statusCode: 400,
      message: 'No file provided',
      stack: undefined,
    });
  }

  // only allow images
  if (!file.type?.startsWith('image/')) {
    throw createError({
      statusCode: 400,
      message: 'Only images are allowed',
      stack: undefined,
    });
  }

  if (file.data.length > 5 * 1024 * 1024) {
    throw createError({
      statusCode: 400,
      message: 'File size must be less than 5MB',
      stack: undefined,
    });
  }

  const { cid, path, size } = await client.add(file.data);

  return { cid, path, size };
});
