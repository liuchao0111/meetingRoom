import { BadRequestException, ParseIntPipe } from '@nestjs/common';
import * as crypto from 'crypto';
import * as multer from 'multer';
import * as fs from 'fs';

export function md5(str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
}

export function generateParseIntPipe(name) {
  return new ParseIntPipe({
    exceptionFactory() {
      throw new BadRequestException(name + ' 应该传数字');
    },
  });
}

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `uploads`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const suffix = file.mimetype.split('/')[1];
    cb(null, `${Date.now()}.${suffix}`);
  },
});
