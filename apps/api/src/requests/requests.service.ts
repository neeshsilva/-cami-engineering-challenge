import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRequest, RequestStatus } from './customer-request.entity';

export type RequestListItem = {
  id: string;
  message: string;
  status: RequestStatus;
  category: string | null;
  confidence: number | null;
  noteCount: number;
  latestNotePreview: string | null;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(CustomerRequest)
    private readonly requests: Repository<CustomerRequest>,
  ) {}

  async list(): Promise<RequestListItem[]> {
    // One round-trip instead of 1 + N: note count and latest note come from
    // correlated subqueries served by idx_request_notes_request_id.
    const rows: Array<{
      id: string;
      message: string;
      status: RequestStatus;
      category: string | null;
      confidence: number | null;
      note_count: number;
      latest_note_preview: string | null;
      created_at: Date;
      updated_at: Date;
    }> = await this.requests.query(`
      SELECT r.id, r.message, r.status, r.category, r.confidence, r.created_at, r.updated_at,
        (SELECT count(*)::int FROM request_notes n WHERE n.request_id = r.id) AS note_count,
        (SELECT n.body FROM request_notes n WHERE n.request_id = r.id
          ORDER BY n.created_at DESC LIMIT 1) AS latest_note_preview
      FROM customer_requests r
      ORDER BY r.created_at DESC
    `);

    return rows.map((row) => ({
      id: row.id,
      message: row.message,
      status: row.status,
      category: row.category,
      confidence: row.confidence,
      noteCount: row.note_count,
      latestNotePreview: row.latest_note_preview,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    }));
  }

  async getById(id: string): Promise<CustomerRequest> {
    const row = await this.requests.findOne({
      where: { id },
      relations: { notes: true },
    });
    if (!row) {
      throw new NotFoundException(`Request ${id} not found`);
    }
    return row;
  }

  async updateStatus(id: string, status: RequestStatus): Promise<CustomerRequest> {
    const row = await this.getById(id);
    row.status = status;
    return this.requests.save(row);
  }

  async create(message: string): Promise<CustomerRequest> {
    const row = this.requests.create({
      message,
      status: 'open',
      category: null,
      confidence: null,
    });
    return this.requests.save(row);
  }

  async save(request: CustomerRequest): Promise<CustomerRequest> {
    return this.requests.save(request);
  }
}
