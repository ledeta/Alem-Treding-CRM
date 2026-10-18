import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  customerName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Payment' })
  paymentId?: MongooseSchema.Types.ObjectId;

  @Prop({ enum: ['Payment', 'Credit', 'Refund'], required: true })
  type: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  bank?: string;

  @Prop()
  reason?: string;

  @Prop({ enum: ['Approved', 'Pending', 'Rejected'], required: true })
  status: string;

  @Prop({ enum: ['approved', 'pending', 'rejected'], required: true })
  approvalStatus: string;

  @Prop({ enum: ['warehouse', 'shop'] })
  source?: string;

  @Prop()
  transactionType?: string;

  @Prop()
  transactionId?: string;

  @Prop({ type: [Object], default: [] })
  items: Array<{
    name: string;
    itemName?: string;
    quantity: number;
    price: number;
    total: number;
    category?: string;
  }>;

  @Prop()
  processedBy?: string;

  @Prop({ type: Date })
  processedAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexes
TransactionSchema.index({ customerName: 1 });
TransactionSchema.index({ customerId: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ customerId: 1, status: 1 });
