import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];

  // ✅ CREATE USER
  create(createUserDto: CreateUserDto) {
    const user: User = {
      id: Date.now(),
      ...createUserDto,
      createdAt: new Date(),
    };

    this.users.push(user);

    return {
      data: user,
      message: 'User created successfully',
    };
  }

  // ✅ GET ALL USERS
  findAll() {
    return {
      data: this.users,
      total: this.users.length,
    };
  }

  // ✅ GET SINGLE USER
  findOne(id: number) {
    const user = this.users.find((u) => u.id === id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      data: user,
    };
  }

  // ✅ UPDATE USER
  update(id: number, updateUserDto: UpdateUserDto) {
    const userIndex = this.users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updateUserDto,
    };

    this.users[userIndex] = updatedUser;

    return {
      data: updatedUser,
      message: 'User updated successfully',
    };
  }

  // ✅ DELETE USER
  remove(id: number) {
    const userIndex = this.users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users.splice(userIndex, 1);

    return {
      message: `User with ID ${id} deleted successfully`,
    };
  }
}
