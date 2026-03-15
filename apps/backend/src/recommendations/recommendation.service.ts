import { Injectable } from '@nestjs/common';

@Injectable()
export class RecommendationService {

getDefaultRecommendations(){

return [

{
id:1,
title:"Popular Routes",
reason:"Trending"
},

{
id:2,
title:"Nearby Stops",
reason:"Location based"
},

{
id:3,
title:"Top Trips",
reason:"Highly rated"
}

];

}

getRecommendations(){

return this.getDefaultRecommendations();

}

}