import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  SignalsService,
  type SignalsWebhookPayload,
  type SignalsWebhookResponse,
} from './signals.service';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.ACCEPTED)
  receiveWebhook(
    @Body() payload: SignalsWebhookPayload,
  ): Promise<SignalsWebhookResponse> {
    return this.signalsService.receiveWebhook(payload);
  }
}