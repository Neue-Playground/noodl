import path from 'node:path';
import { filesystem } from '@noodl/platform';

import { ProjectModel } from '@noodl-models/projectmodel';
// import FileSystem from '@noodl-utils/filesystem';
import { guid } from '@noodl-utils/utils';

export async function saveImageDataToDisk(imageData: any): Promise<string> {
  const projectFolder = ProjectModel.instance._retainedProjectDirectory;
  console.log('TEST');
  if (!projectFolder) throw new Error('Project has no folder');

  // Normalize possible shapes from the image generation API
  // - { b64_json }
  // - { data: { b64_json } }
  // - { type: 'png', data: Buffer }
  let b64: string | undefined;
  let ext = 'png';

  if (!imageData) throw new Error('No image data returned from AI');
  console.log('saveImageDataToDisk: received imageData:', imageData);
  if (typeof imageData === 'string') {
    // Already a base64 string
    b64 = imageData;
  } else if (Buffer.isBuffer(imageData)) {
    // Already a buffer — write directly
    const filename = `image-${guid()}.png`;
    const folder = 'generated-images';
    const relativeFilePath = path.join(folder, filename);
    const absolutePath = path.join(projectFolder, relativeFilePath);

    await filesystem.makeDirectory(path.join(projectFolder, folder));
    await filesystem.writeFile(absolutePath, imageData);
    return relativeFilePath;
  } else if (imageData.b64_json) {
    b64 = imageData.b64_json;
  } else if (imageData.data && imageData.data.b64_json) {
    b64 = imageData.data.b64_json;
  } else if (imageData.data && typeof imageData.data === 'string') {
    b64 = imageData.data;
  } else if (imageData.data && Buffer.isBuffer(imageData.data)) {
    // Buffer inside data
    const filename = `image-${guid()}.${imageData.type || 'png'}`;
    const folder = 'generated-images';
    const relativeFilePath = path.join(folder, filename);
    const absolutePath = path.join(projectFolder, relativeFilePath);

    await filesystem.makeDirectory(path.join(projectFolder, folder));
    await filesystem.writeFile(absolutePath, imageData.data);
    return relativeFilePath;
  }

  if (!b64) throw new Error('Unhandled image response shape — no base64 data found');
  // Debug: when missing base64, include the raw shape in the error for diagnostics
  if (!b64) {
    console.error('saveImageDataToDisk: received imageData with no b64 content:', imageData);
    throw new Error('Unhandled image response shape — no base64 data found');
  }

  // Guess extension from the base64 prefix if possible
  const prefix = b64.slice(0, 20);
  if (prefix.startsWith('/9j/')) ext = 'jpg';
  else if (prefix.startsWith('iVBOR')) ext = 'png';

  const buffer = Buffer.from(b64, 'base64');

  const filename = `image-${guid()}.${ext}`;
  const folder = 'generated-images';
  const relativeFilePath = path.join(folder, filename);
  const absolutePath = path.join(projectFolder, relativeFilePath);

  await filesystem.makeDirectory(path.join(projectFolder, folder));
  await filesystem.writeFile(absolutePath, buffer);

  return relativeFilePath;
}
