const fs = require('fs');
const zlib = require('zlib');

function createPNG(width, height, r, g, b) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);

  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const t = Buffer.from(type);
    const combined = Buffer.concat([t, data]);
    const crcVal = crc32(combined);
    const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crcVal);
    return Buffer.concat([len, t, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const rowSize = 1 + width * 3;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    raw[offset] = 0; // filter none
    for (let x = 0; x < width; x++) {
      raw[offset + 1 + x*3] = r;
      raw[offset + 1 + x*3 + 1] = g;
      raw[offset + 1 + x*3 + 2] = b;
    }
  }
  const compressed = zlib.deflateSync(raw);

  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

fs.writeFileSync('./assets/icon.png', createPNG(1024, 1024, 108, 99, 255));
fs.writeFileSync('./assets/favicon.png', createPNG(64, 64, 108, 99, 255));
fs.writeFileSync('./assets/adaptive-icon.png', createPNG(1024, 1024, 108, 99, 255));
fs.writeFileSync('./assets/splash.png', createPNG(1284, 2778, 108, 99, 255));
console.log('Done - assets created');
