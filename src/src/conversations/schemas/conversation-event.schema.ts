import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConversationEventDocument = HydratedDocument<ConversationEvent>;

@Schema()
export class ConversationEvent {
    @Prop({ required: true, unique: true }) // Requirements: eventId unique per session. Global uniqueness is stronger but simplifies "unique per session" if globally unique. If not globally unique, we need compound index. The prompt says "unique per session", but "eventId (string, unique per session)". Usually event IDs are UUIDs. Let's assume global uniqueness for eventId for simplicity, or add compound index.
    // Actually, let's stick to "unique per session" strictly if we can. But usually eventId is unique.
    // Let's make it a string.
    eventId: string;

    @Prop({ required: true, index: true })
    sessionId: string;

    @Prop({
        required: true,
        enum: ['user_speech', 'bot_speech', 'system'],
    })
    type: string;

    @Prop({ type: Object, required: true })
    payload: Record<string, any>;

    @Prop({ required: true, default: Date.now })
    timestamp: Date;
}

export const ConversationEventSchema = SchemaFactory.createForClass(ConversationEvent);

// Compound index for sessionId + timestamp for efficient retrieval
ConversationEventSchema.index({ sessionId: 1, timestamp: 1 });
// Compound index for sessionId + eventId to ensure uniqueness per session?
ConversationEventSchema.index({ sessionId: 1, eventId: 1 }, { unique: true });
