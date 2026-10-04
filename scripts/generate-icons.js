import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, r, g, b, a = 255) {
  const rowLength = width * 4 + 1;
  const buffer = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const offset = y * rowLength;
    buffer[offset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pxOffset = offset + 1 + x * 4;
      // create a subtle border / emblem effect
      const isBorder = x < 6 || x >= width - 6 || y < 6 || y >= height - 6;
      const isGoldAccent = (x > width * 0.3 && x < width * 0.7 && y > height * 0.4 && y < height * 0.6);
      if (isGoldAccent) {
        buffer[pxOffset] = 245;     // R
        buffer[pxOffset + 1] = 158; // G
        buffer[pxOffset + 2] = 11;  // B
        buffer[pxOffset + 3] = 255;
      } else if (isBorder) {
        buffer[pxOffset] = 217;
        buffer[pxOffset + 1] = 119;
        buffer[pxOffset + 2] = 6;
        buffer[pxOffset + 3] = 255;
      } else {
        buffer[pxOffset] = r;
        buffer[pxOffset + 1] = g;
        buffer[pxOffset + 2] = b;
        buffer[pxOffset + 3] = a;
      }
    }
  }

  const compressedData = zlib.deflateSync(buffer);

  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);

    const crcData = Buffer.concat([typeBuf, data]);
    const crc = crc32(crcData);
    crcBuf.writeInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return crc ^ -1;
  }

  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // Color type 6: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.resolve('public');
if (!fs.existsSync(pubDir)) {
  fs.mkdirSync(pubDir, { recursive: true });
}

// Navy color: 30, 58, 138 (#1e3a8a)
fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPNG(192, 192, 30, 58, 138));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPNG(512, 512, 30, 58, 138));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, 30, 58, 138));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPNG(180, 180, 30, 58, 138));
fs.writeFileSync(path.join(pubDir, 'favicon.ico'), createPNG(64, 64, 30, 58, 138));

console.log('Generated PNG icons successfully.');
