import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationSession, ConversationSessionSchema } from './schemas/conversation-session.schema';
import { ConversationEvent, ConversationEventSchema } from './schemas/conversation-event.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ConversationSession.name, schema: ConversationSessionSchema },
            { name: ConversationEvent.name, schema: ConversationEventSchema },
        ]),
    ],
    controllers: [ConversationsController],
    providers: [ConversationsService],
})
export class ConversationsModule { }
