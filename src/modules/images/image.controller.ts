import { Controller, Get, Param, Res } from '@nestjs/common';
import { ImageService } from './image.service';
import { Response } from 'express';

@Controller('uploads')
export class ImageController {
  constructor(private imageService: ImageService) {}
  @Get(':id')
  async getImages(@Param('id') filename: string, @Res() res: Response) {
    return await this.imageService.getImage(filename, res);
  }
}
