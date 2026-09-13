import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { QuizQueryDto } from './dto/quiz-query.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Quiz')
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated quizzes' })
  @ApiResponse({ status: 200, description: 'Paginated list of quizzes' })
  async getQuizzes(@Query() query: QuizQueryDto) {
    return this.quizService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz details and questions by ID' })
  @ApiParam({ name: 'id', description: 'Quiz UUID' })
  @ApiResponse({ status: 200, description: 'Quiz details with questions' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getQuizById(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit quiz answers and receive grading result' })
  @ApiParam({ name: 'id', description: 'Quiz UUID' })
  @ApiResponse({
    status: 200,
    description: 'Graded quiz result with score and answer breakdown',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async submitQuiz(
    @Param('id') id: string,
    @Body() dto: SubmitQuizDto,
    @CurrentUser() userId: string,
  ) {
    return this.quizService.submit(id, userId, dto);
  }
}
