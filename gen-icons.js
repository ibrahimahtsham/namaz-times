const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}
function makePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; ihdrData[9] = 6; ihdrData[10] = 0; ihdrData[11] = 0; ihdrData[12] = 0;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([signature, chunk('IHDR', ihdrData), chunk('IDAT', idatData), chunk('IEND', Buffer.alloc(0))]);
}

function makeIcon(size, padPct) {
  const buf = Buffer.alloc(size * size * 4);
  const bg = [8, 8, 10, 255];
  const fg = [255, 255, 255, 255];
  for (let i = 0; i < size * size; i++) {
    buf[i * 4] = bg[0]; buf[i * 4 + 1] = bg[1]; buf[i * 4 + 2] = bg[2]; buf[i * 4 + 3] = 255;
  }
  const set = (x, y, c) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = c[3];
  };

  const cx = size / 2, cy = size / 2;
  const R = size * (0.5 - padPct) * 0.62;
  const innerOffset = R * 0.46;
  const innerR = R * 0.86;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;
      const distOuter = Math.hypot(dx, dy);
      const distInner = Math.hypot(dx - innerOffset, dy);
      if (distOuter <= R && distInner > innerR) set(x, y, fg);
    }
  }

  const starCx = cx + R * 0.62, starCy = cy - R * 0.5, starR = R * 0.24;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - starCx) / starR, dy = (y - starCy) / starR;
      const ang = Math.atan2(dy, dx);
      const r = Math.hypot(dx, dy);
      const starShape = 0.5 + 0.5 * Math.cos(4 * ang);
      if (r < 0.12 + starShape * 0.45) set(x, y, fg);
    }
  }

  return makePNG(size, size, buf);
}

const outDir = process.argv[2] || '.';
fs.writeFileSync(path.join(outDir, 'icon-192.png'), makeIcon(192, 0.06));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), makeIcon(512, 0.06));
fs.writeFileSync(path.join(outDir, 'icon-maskable-512.png'), makeIcon(512, 0.22));
console.log('icons written to', outDir);
