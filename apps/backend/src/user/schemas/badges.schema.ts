import { Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document} from 'mongoose';

@Schema()
export class BadgeSchema extends Document {
    @Prop({ type: String, required: true})
    name: string;

    @Prop({ type: String, required: true})
    description: string;

    @Prop({ type: String, required: true})
    criteria: string;

}

export const badgeSchema = SchemaFactory.createForClass(BadgeSchema);