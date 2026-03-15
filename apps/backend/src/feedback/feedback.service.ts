import { Injectable } from '@nestjs/common';

@Injectable()
export class FeedbackService {

  private feedback: any[] = [];

  addFeedback(data: any) {

    this.feedback.push(data);

    return {
      message: "Feedback recorded",
      data
    };
  }

  getFeedback() {

    return {
      message: "All feedback",
      data: this.feedback
    };

  }

}