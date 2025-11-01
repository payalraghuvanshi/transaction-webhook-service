import { Controller, Post, HttpCode, Body } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { TransactionWebhookDto } from './dto/transaction-webhook.dto';

// Controller for handling incoming webhook requests from payment processors
@Controller('v1/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  //Accepts transaction webhooks and returns 202 immediately
  @Post('transactions')
  @HttpCode(202)
  async handleTransactionWebhook(@Body() payload: TransactionWebhookDto): Promise<string> {
    this.webhooksService.handleWebhook(payload);
    return 'Webhook received and accepted for processing.';
  }
}