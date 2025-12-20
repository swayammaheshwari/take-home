import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConversationSessionDocument = HydratedDocument<ConversationSession>;

@Schema({ timestamps: { createdAt: false, updatedAt: false } }) // We manage timestamps manually or don't need updateAt for this specific model as per requirements? Requirements say startedAt/endedAt. Mongoose timestamps might be useful but let's stick to requirements.
export class ConversationSession {
    @Prop({ required: true, unique: true, index: true })
    sessionId: string;

    @Prop({
        required: true,
        enum: ['initiated', 'active', 'completed', 'failed'],
        default: 'initiated',
    })
    status: string;

    @Prop()
    language: string;

    @Prop({ required: true, default: Date.now })
    startedAt: Date;

    @Prop()
    endedAt: Date;

    @Prop({ type: Object })
    metadata: Record<string, any>;
}

export const ConversationSessionSchema = SchemaFactory.createForClass(ConversationSession);
