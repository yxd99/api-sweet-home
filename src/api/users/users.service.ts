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

  async findByEmail(email: string): Promise<User | null> {
    return (await this.userRepository.findOneBy({ email })) || null;
  }

  async create(user: CreateUserDto): Promise<object> {
    try {
      const code = generateRandomCode();
      await this.userRepository.save({
        ...user,
        code: code.code,
        code_expire_in: code.expire,
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
      { code: code.code, code_expire_in: code.expire },
    );
    return {
      msg: 'Code updated',
    };
  }

  async getCodeAndExpiring(email: string) {
    return this.userRepository
      .createQueryBuilder('users')
      .addSelect(['users.code', 'users.code_expire_in'])
      .where('users.email = :email', { email })
      .getOne();
  }
}
