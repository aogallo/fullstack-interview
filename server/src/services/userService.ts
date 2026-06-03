import { User } from '../types';
import { IUserRepository } from '../repositories/interfaces';

export class UserService {
  constructor(private userRepo: IUserRepository) {}

  async findOrCreate(username: string): Promise<User> {
    return this.userRepo.findOrCreate(username);
  }
}
