import {
  Body,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { CarService } from './car.service';
import { AddCarDto } from './dto/add-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { CarEntity } from '../../entities/car.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../utils/file-upload.utils';

@Controller('car')
export class CarController {
  constructor(private carService: CarService) {}

  @Get('')
  // @UseInterceptors(CacheInterceptor)
  // @CacheKey('car.get.all')
  // @CacheTTL(60 * 60 * 24)
  async getAllCars(): Promise<CarEntity[]> {
    return await this.carService.getCars();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: editFileName,
        }),
        fileFilter: imageFileFilter,
      },
    ),
  )
  async addCar(
    @Body() addCarDto: AddCarDto,
    @User() user,
    @UploadedFiles()
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
      image4?: Express.Multer.File[];
    },
  ): Promise<CarEntity> {
    // const filesPath = process.env.SERVER_HOST + ':' + process.env.APP_PORT + '/';
    const filesPath = 'http://localhost:' + process.env.APP_PORT + '/';
    addCarDto.image1 = filesPath + files.image1[0].path;
    addCarDto.image2 = filesPath + files.image2[0].path;
    addCarDto.image3 = filesPath + files.image3[0].path;
    addCarDto.image4 = filesPath + files.image4[0].path;
    return await this.carService.addCar(addCarDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteCar(@Param('id', ParseIntPipe) id: number, @User() user) {
    return this.carService.softDeleteCar(id, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getCar(
    @Param('id', ParseIntPipe) id: number,
    @User() user,
  ): Promise<CarEntity> {
    return await this.carService.findCarById(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateCar(
    @Body() updateCarDto: UpdateCarDto,
    @Param('id', ParseIntPipe) id: number,
    @User() user,
  ): Promise<CarEntity> {
    return await this.carService.updateCar(id, updateCarDto, user);
  }

  @Get('recover/:id')
  @UseGuards(JwtAuthGuard)
  async restoreCar(@Param('id', ParseIntPipe) id: number, @User() user) {
    return await this.carService.restoreCar(id, user);
  }
}
