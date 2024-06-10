import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { generateRandomCode } from '@common/utils/generate-code';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email });
  }

  async findById(id: number) {
    return this.userRepository.findOneBy({
      id,
    });
  }

  async create(user: CreateUserDto): Promise<object> {
    try {
      const code = generateRandomCode();
      await this.userRepository.save({
        ...user,
        code: code.code,
        codeExpireIn: code.expire,
      });
      return { msg: `user ${user.email} created successfully` };
    } catch (ex) {
      return { msg: `error: ${ex}` };
    }
  }

  async updateCode(email: string) {
    const code = generateRandomCode();
    await this.userRepository.update(
      { email },
      { code: code.code, codeExpireIn: code.expire },
    );
    return {
      msg: 'Code updated',
    };
  }

  async getCodeAndExpiring(email: string) {
    return this.userRepository
      .createQueryBuilder('users')
      .addSelect(['users.code', 'users.codeExpireIn'])
      .where('users.email = :email', { email })
      .getOne();
  }
}
