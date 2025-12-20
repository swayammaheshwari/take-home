import { Controller, Post, Get, Body, Param, Query, HttpCode, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { AddEventDto } from './dto/add-event.dto';

@Controller('sessions')
export class ConversationsController {
    constructor(private readonly conversationsService: ConversationsService) { }

    @Post()
    async createSession(@Body() createSessionDto: CreateSessionDto) {
        return this.conversationsService.createOrUpsertSession(createSessionDto);
    }

    @Post(':sessionId/events')
    async addEvent(
        @Param('sessionId') sessionId: string,
        @Body() addEventDto: AddEventDto,
    ) {
        return this.conversationsService.addEvent(sessionId, addEventDto);
    }

    @Get(':sessionId')
    async getSession(
        @Param('sessionId') sessionId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    ) {
        return this.conversationsService.getSession(sessionId, page, limit);
    }

    @Post(':sessionId/complete')
    async completeSession(@Param('sessionId') sessionId: string) {
        return this.conversationsService.completeSession(sessionId);
    }
}
