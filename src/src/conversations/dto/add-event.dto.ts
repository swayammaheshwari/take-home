export class AddEventDto {
    eventId: string;
    type: 'user_speech' | 'bot_speech' | 'system';
    payload: Record<string, any>;
    timestamp?: Date;
}
