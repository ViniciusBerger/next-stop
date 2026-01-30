import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document} from 'mongoose';

@Schema({ _id: false })
export class AddressSchema extends Document {
    @Prop({ type: String, required: true})
    street: string;

    @Prop({ type: String, required: true})
    province: string

    @Prop({ type: String, required: true})
    city: string;

    @Prop({ type: String, required: true, lowecase:true, trim:true, match:[/^[A-Z]\d[A-Z] ?\d[A-Z]\d$/, 'Please fill a valid Canadian postal code'] })
    postalCode: string;

    
} 

export const addressSchema = SchemaFactory.createForClass(AddressSchema);