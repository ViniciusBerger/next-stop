import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(){
    return {
      message: "Hello world",
      status: 200
    };
  }

  getHealth(): any {
    return {
      message: "I am healthy and working properly! PS: Just authenticated users can access this route.",
      status: 200
    };
  }
}
