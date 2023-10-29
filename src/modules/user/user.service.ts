import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';

import * as bcrypt from 'bcrypt';
import { UserSubscribeDto } from './dto/subscribe.dto';
import { LoginCredentialsDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserRoleEnum } from 'src/enums/user-role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async register(userData: UserSubscribeDto): Promise<Partial<UserEntity>> {
    const user = this.userRepository.create({
      ...userData,
    });
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, user.salt);
    try {
      await this.userRepository.save(user);
    } catch (e) {
      throw new ConflictException(`username and email must be one`);
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  async login(credentials: LoginCredentialsDto) {
    const { username, password } = credentials;
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username or user.email = :username', {
        username,
      })
      .getOne();
    if (!user) throw new NotFoundException('bad username or password');

    const hashedPassword = await bcrypt.hash(password, user.salt);
    if (hashedPassword === user.password) {
      const payload = {
        username: user.username,
        email: user.email,
        role: user.role,
        firstname: user.firstname,
        lastname: user.lastname,
      };
      const jwt = await this.jwtService.sign(payload);
      return {
        access_token: jwt,
        user: payload,
      };
    } else {
      throw new NotFoundException('bad username or password ');
    }
  }

  isOwnerOrAdmin(objet, user) {
    if (
      user.role == UserRoleEnum.ADMIN ||
      (objet.createBy && objet.createBy.id == user.id)
    ) {
      return true;
    }
    return true;
  }

  async findAll(options = null): Promise<UserEntity[]> {
    if (options) {
      return await this.userRepository.find(options);
    }
    return await this.userRepository.find();
  }
}
