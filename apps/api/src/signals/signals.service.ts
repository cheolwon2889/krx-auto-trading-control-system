import { Injectable } from '@nestjs/common';

@Injectable()
export class SignalsService {
  async receiveWebhook(
    _payload: Record<string, unknown>,
  ): Promise<{ status: 'accepted' }> {
    return { status: 'accepted' };
  }
}
