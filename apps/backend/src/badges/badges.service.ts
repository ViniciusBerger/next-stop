import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class BadgesService {

constructor(@InjectConnection() private connection: Connection) {}

async findAll(): Promise<any[]> {

return this.connection
.collection('badges')
.find({})
.toArray();

}

}