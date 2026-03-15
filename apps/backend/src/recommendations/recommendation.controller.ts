import { Controller, Get } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

@Controller('recommendations')
export class RecommendationController {

constructor(private recommendationService: RecommendationService){}

@Get()
getRecommendations(){

return {

message:"Cold start recommendations",

data:this.recommendationService.getRecommendations()

};

}

}