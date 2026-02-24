import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileController } from './controller/profile.controller';
import { ProfileService } from './service/profile.service';
import { ProfileRepository } from './repository/profile.repository';
import { User, userSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository],
  exports: [ProfileService],
})
export class ProfileModule {}