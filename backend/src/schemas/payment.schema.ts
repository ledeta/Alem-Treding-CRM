import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  customerName: string;

  @Prop({ enum: ['Payment', 'Credit', 'Refund'], required: true })
  type: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  bank: string;

  @Prop()
  reason?: string;

  @Prop()
  paymentNotes?: string;

  @Prop()
  additional?: string;

  @Prop()
  reference?: string;

  @Prop({ enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  approvalStatus: string;

  @Prop({ enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
  status: string;

  @Prop({ enum: ['warehouse', 'shop'], required: true })
  source: string;

  @Prop()
  requestedBy?: string;

  @Prop({ type: [Object], default: [] })
  items: Array<{
    name: string;
    itemName?: string;
    quantity: number;
    price: number;
    total: number;
    category?: string;
  }>;

  @Prop({ default: false })
  isMultiBankPayment: boolean;

  @Prop()
  totalPaymentAmount?: string;

  @Prop()
  bankNumber?: number;

  @Prop()
  totalBanks?: number;

  @Prop({ default: false })
  isRefund: boolean;

  @Prop()
  transactionId?: string;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop()
  approvedBy?: string;

  @Prop({ type: Date })
  rejectedAt?: Date;

  @Prop()
  rejectedBy?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes
PaymentSchema.index({ customerName: 1 });
PaymentSchema.index({ approvalStatus: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ source: 1 });
PaymentSchema.index({ type: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ customerId: 1, approvalStatus: 1 });
