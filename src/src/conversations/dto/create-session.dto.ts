export class CreateSessionDto {
    sessionId: string;
    language?: string;
    metadata?: Record<string, any>;
}
