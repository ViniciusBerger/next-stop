import { Controller, Get } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Recommendations')

@Controller('recommendations')

export class RecommendationController {

constructor(private recommendationService: RecommendationService){}

@Get()

@ApiOperation({ summary: 'Get recommendations' })

@ApiResponse({ status: 200, description: 'Recommendations returned successfully' })

getRecommendations(){

return {

message:"Cold start recommendations",

data:this.recommendationService.getRecommendations()

};

}

}