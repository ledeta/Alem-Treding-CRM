import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ItemDocument = Item & Document;

@Schema({ timestamps: true })
export class Item {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 'General' })
  category: string;

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop({ required: true })
  price: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description?: string;

  @Prop()
  sku?: string;

  @Prop()
  barcode?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

// Create indexes for better query performance
ItemSchema.index({ name: 1 });
ItemSchema.index({ category: 1 });
ItemSchema.index({ isActive: 1 });
ItemSchema.index({ name: 'text', description: 'text' }); // Text search index
