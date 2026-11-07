import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import {
  ClassificationService,
  DEFAULT_HISTORY_LIMIT,
  HistoryFilter,
  MAX_HISTORY_LIMIT,
  MAX_MESSAGE_LENGTH,
} from './classification.service';
import { CLASSIFICATION_CATEGORIES, ClassificationCategory } from './keyword-classifier';
import { RequestStatus } from './customer-request.entity';

@Controller('requests')
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
    private readonly classification: ClassificationService,
  ) {}

  @Get()
  list() {
    return this.requestsService.list();
  }

  @Get('history')
  async history(@Query('category') category?: string, @Query('limit') limit?: string) {
    return { items: await this.classification.history(parseHistoryQuery(category, limit)) };
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.requestsService.getById(id);
  }

  @Post()
  create(@Body() body: { message?: string }) {
    if (!body?.message || typeof body.message !== 'string') {
      return { error: 'message is required' };
    }
    return this.requestsService.create(body.message);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status?: RequestStatus }) {
    if (!body?.status) {
      return { error: 'status is required' };
    }
    return this.requestsService.updateStatus(id, body.status);
  }

  @Post('classify')
  classify(@Body() body: unknown) {
    const { message, requestId } = parseClassifyBody(body);
    return this.classification.classify(message, requestId);
  }
}

type ClassifyBody = { message: string; requestId?: string };

/** Validates the untyped request body at the trust boundary; returns a trimmed message. */
function parseClassifyBody(body: unknown): ClassifyBody {
  const { message, requestId } = (body ?? {}) as Record<string, unknown>;
  if (typeof message !== 'string' || message.trim().length === 0) {
    throw new BadRequestException('message must be a non-empty string');
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new BadRequestException('message too long');
  }
  if (requestId !== undefined && requestId !== null && typeof requestId !== 'string') {
    throw new BadRequestException('requestId must be a string');
  }
  return { message: message.trim(), requestId: requestId || undefined };
}

function parseHistoryQuery(category?: string, limit?: string): HistoryFilter {
  if (category && !CLASSIFICATION_CATEGORIES.includes(category as ClassificationCategory)) {
    throw new BadRequestException(`category must be one of ${CLASSIFICATION_CATEGORIES.join(', ')}`);
  }
  const n = limit === undefined ? DEFAULT_HISTORY_LIMIT : Number(limit);
  if (!Number.isInteger(n) || n < 1 || n > MAX_HISTORY_LIMIT) {
    throw new BadRequestException(`limit must be an integer between 1 and ${MAX_HISTORY_LIMIT}`);
  }
  return { category: (category || undefined) as ClassificationCategory | undefined, limit: n };
}
