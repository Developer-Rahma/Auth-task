import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserDocument, UserModel } from '../schemas/user.schema';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const document = await this.userModel.findById(id).exec();

    return document ? this.toDomain(document) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const document = await this.userModel
      .findOne({
        email: email.toLowerCase(),
      })
      .exec();

    return document ? this.toDomain(document) : null;
  }

  async create(user: User): Promise<User> {
    const document = await this.userModel.create({
      _id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
    });

    return this.toDomain(document);
  }

  private toDomain(document: UserDocument): User {
    return User.create({
      id: document._id.toString(),
      name: document.name,
      email: document.email,
      passwordHash: document.passwordHash,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }
}
