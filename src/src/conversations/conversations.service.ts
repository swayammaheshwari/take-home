import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationSession, ConversationSessionDocument } from './schemas/conversation-session.schema';
import { ConversationEvent, ConversationEventDocument } from './schemas/conversation-event.schema';
import { CreateSessionDto } from './dto/create-session.dto';
import { AddEventDto } from './dto/add-event.dto';

@Injectable()
export class ConversationsService {
    constructor(
        @InjectModel(ConversationSession.name) private sessionModel: Model<ConversationSessionDocument>,
        @InjectModel(ConversationEvent.name) private eventModel: Model<ConversationEventDocument>,
    ) { }

    async createOrUpsertSession(createSessionDto: CreateSessionDto): Promise<ConversationSession> {
        const { sessionId, ...rest } = createSessionDto;

        // Try to find existing session first to ensure idempotency and return existing one
        const existingSession = await this.sessionModel.findOne({ sessionId });
        if (existingSession) {
            return existingSession;
        }

        // Create new session
        try {
            const newSession = new this.sessionModel({
                sessionId,
                ...rest,
                status: 'initiated',
                startedAt: new Date(),
            });
            return await newSession.save();
        } catch (error: any) {
            if (error.code === 11000) {
                // Race condition handled: if duplicate key error, fetch and return the existing one
                const session = await this.sessionModel.findOne({ sessionId });
                if (session) return session;
            }
            throw error;
        }
    }

    async addEvent(sessionId: string, addEventDto: AddEventDto): Promise<ConversationEvent> {
        const session = await this.sessionModel.findOne({ sessionId });
        if (!session) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        // Check if event already exists (idempotency)
        const existingEvent = await this.eventModel.findOne({
            sessionId,
            eventId: addEventDto.eventId,
        });

        if (existingEvent) {
            // We could verify payload matches but requirements just say "Duplicate requests should not create duplicate events"
            return existingEvent;
        }

        try {
            const newEvent = new this.eventModel({
                sessionId,
                ...addEventDto,
                timestamp: addEventDto.timestamp || new Date(),
            });
            return await newEvent.save();
        } catch (error: any) {
            if (error.code === 11000) {
                // Uniqueness violation (likely concurrent request), return existing
                const event = await this.eventModel.findOne({
                    sessionId,
                    eventId: addEventDto.eventId,
                });
                if (event) return event;
            }
            throw error;
        }
    }

    async getSession(sessionId: string, page: number = 1, limit: number = 50) {
        const session = await this.sessionModel.findOne({ sessionId }).lean();
        if (!session) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        // Pagination for events
        const skip = (page - 1) * limit;
        const events = await this.eventModel
            .find({ sessionId })
            .sort({ timestamp: 1 }) // Ordered by timestamp
            .skip(skip)
            .limit(limit)
            .lean();

        const totalEvents = await this.eventModel.countDocuments({ sessionId });

        return {
            session,
            events,
            pagination: {
                page,
                limit,
                total: totalEvents,
                totalPages: Math.ceil(totalEvents / limit),
            },
        };
    }

    async completeSession(sessionId: string): Promise<ConversationSession> {
        const session = await this.sessionModel.findOne({ sessionId });
        if (!session) {
            throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        if (session.status === 'completed') {
            return session;
        }

        session.status = 'completed';
        session.endedAt = new Date();
        return await session.save();
    }
}
