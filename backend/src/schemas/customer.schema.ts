import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'info@customer.local' })
  email: string;

  @Prop({ default: '+251-9-XX-XX-XXXX' })
  phone: string;

  @Prop({ default: 'Address not provided' })
  address: string;

  @Prop({ default: 'Addis Ababa' })
  city: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ enum: ['Active', 'Inactive'], default: 'Active' })
  status: string;

  @Prop({ default: 0 })
  totalPurchases: number;

  @Prop({ default: 0 })
  totalCredits: number;

  @Prop({ default: 0 })
  totalRefunds: number;

  @Prop({ type: Date, default: Date.now })
  lastTransaction: Date;

  @Prop({ type: Date, default: Date.now })
  memberSince: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Indexes for performance
CustomerSchema.index({ name: 1 });
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ status: 1 });
CustomerSchema.index({ name: 'text', email: 'text', phone: 'text', address: 'text' });
