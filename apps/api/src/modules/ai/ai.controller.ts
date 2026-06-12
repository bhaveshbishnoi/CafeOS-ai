import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('branches/:branchId/chat')
  async copilotChat(
    @Param('branchId') branchId: string,
    @Body('message') message: string
  ) {
    return this.aiService.copilotChat(branchId, message);
  }

  @Get('branches/:branchId/recommendations')
  async getRecommendations(@Param('branchId') branchId: string) {
    return this.aiService.getProactiveRecommendations(branchId);
  }

  @Post('recommendations/execute')
  async executeRecommendation(
    @Body('actionCode') actionCode: string,
    @Body('payload') payload: string
  ) {
    return this.aiService.executeRecommendationAction(actionCode, payload);
  }
}
