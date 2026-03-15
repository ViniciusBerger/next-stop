import { Controller, Get } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Badges')

@Controller('badges')

export class BadgesController {

constructor(private readonly badgesService: BadgesService){}

@Get()

@ApiOperation({ summary: 'Get all badges' })

async getBadges(): Promise<any>{

return this.badgesService.findAll();

}

}