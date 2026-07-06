import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignalsService } from './signals.service';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.ACCEPTED)
  receiveWebhook(
    @Body() payload: Record<string, unknown>,
  ): Promise<{ status: 'accepted' }> {
    return this.signalsService.receiveWebhook(payload);
  }
}
