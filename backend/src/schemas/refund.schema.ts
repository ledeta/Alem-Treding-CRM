import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type RefundDocument = Refund & Document;

@Schema({ timestamps: true })
export class Refund {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true })
  transactionId: string;

  @Prop({ enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  approvalStatus: string;

  @Prop({ enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
  status: string;

  @Prop({ type: [Object], default: [] })
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
    category?: string;
  }>;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop()
  approvedBy?: string;

  @Prop()
  processedBy?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);

// Indexes
RefundSchema.index({ customerName: 1 });
RefundSchema.index({ customerId: 1 });
RefundSchema.index({ approvalStatus: 1 });
RefundSchema.index({ transactionId: 1 });
RefundSchema.index({ createdAt: -1 });
