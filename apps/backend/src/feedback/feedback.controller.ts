import { Controller, Post, Get, Body } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackDto } from './dto/feedback.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Feedback')

@Controller('feedback')

export class FeedbackController {

constructor(private readonly feedbackService: FeedbackService) {}

@Post()

@ApiOperation({ summary: 'Add user feedback on recommendation' })

@ApiResponse({ status: 201, description: 'Feedback recorded successfully' })

addFeedback(@Body() data: FeedbackDto) {

return this.feedbackService.addFeedback(data);

}

@Get()

@ApiOperation({ summary: 'Get all feedback' })

@ApiResponse({ status: 200, description: 'All feedback returned successfully' })

getFeedback() {

return this.feedbackService.getFeedback();

}

}