import { Res, NotFoundException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
@Injectable()
export class ImageService {
  async getImage(filename: string, @Res() res: Response) {
    const imagePath = path.join(process.cwd(), 'uploads', filename);
    console.log(imagePath);
    if (!fs.existsSync(imagePath)) {
      throw new NotFoundException('Image not found skjnsdajs');
    }
    res.sendFile(imagePath);
  }
}
