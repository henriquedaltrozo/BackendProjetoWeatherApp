import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Token extends Document {
  @Prop({ required: true })
  hash: string;

  @Prop({ required: true })
  username: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
