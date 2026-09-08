import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../common/guards/role.guard';
import { ChatService } from './chat.service';
import { CreateMessageDto, EditMessageDto } from './dto/message.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post('conversation')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new conversation' })
  async createConversation() {
    this.logger.log(`Creating new conversation`);
    const conversationId = await this.chatService.createConversation();
    return { conversationId };
  }

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(
      `Sending message in conversation: ${createMessageDto.conversationId}`,
    );
    return this.chatService.sendMessage(createMessageDto, user.id);
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Get conversation messages' })
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    this.logger.log(
      `Fetching messages for conversation: ${conversationId} - page: ${page}`,
    );
    return this.chatService.getConversationMessages(conversationId, page, limit);
  }

  @Get('conversations/:conversationId/preview')
  @ApiOperation({ summary: 'Get conversation preview' })
  async getConversationPreview(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Fetching preview for conversation: ${conversationId}`);
    return this.chatService.getConversationPreview(conversationId, user.id);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all user conversations' })
  async getUserConversations(@CurrentUser() user: any) {
    this.logger.log(`Fetching conversations for user: ${user.id}`);
    return this.chatService.getUserConversations(user.id);
  }

  @Get('conversations/:conversationId/search')
  @ApiOperation({ summary: 'Search messages in conversation' })
  async searchMessages(
    @Param('conversationId') conversationId: string,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    this.logger.log(
      `Searching messages in conversation: ${conversationId} - query: ${query}`,
    );
    return this.chatService.searchMessages(conversationId, query, page, limit);
  }

  @Get('messages/:messageId/read-count')
  @ApiOperation({ summary: 'Get message read count' })
  async getReadCount(@Param('messageId') messageId: number) {
    this.logger.log(`Fetching read count for message: ${messageId}`);
    // This would require tracking read receipts - simplified for now
    return { messageId, readCount: 0 };
  }

  @Put('messages/:messageId')
  @ApiOperation({ summary: 'Edit a message' })
  async editMessage(
    @Param('messageId') messageId: number,
    @Body() editMessageDto: EditMessageDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Editing message: ${messageId}`);
    return this.chatService.editMessage(messageId, editMessageDto, user.id);
  }

  @Delete('messages/:messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a message' })
  async deleteMessage(
    @Param('messageId') messageId: number,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Deleting message: ${messageId}`);
    await this.chatService.deleteMessage(messageId, user.id);
  }

  @Post('messages/:messageId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark message as read' })
  async markAsRead(@Param('messageId') messageId: number) {
    this.logger.log(`Marking message as read: ${messageId}`);
    return this.chatService.markAsRead(messageId);
  }

  @Post('conversations/:conversationId/mark-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all messages in conversation as read' })
  async markConversationRead(
    @Param('conversationId') conversationId: string,
  ) {
    this.logger.log(
      `Marking conversation as read: ${conversationId}`,
    );
    const count = await this.chatService.markConversationAsRead(conversationId);
    return { markedCount: count };
  }

  @Get('conversations/:conversationId/unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  async getUnreadCount(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Fetching unread count for conversation: ${conversationId}`);
    const count = await this.chatService.getUnreadCount(conversationId, user.id);
    return { unreadCount: count };
  }

  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cleanup old messages (admin only)' })
  async cleanupOldMessages(@Query('daysOld') daysOld: number = 90) {
    this.logger.log(`Cleaning up messages older than ${daysOld} days`);
    const deleted = await this.chatService.cleanupOldMessages(daysOld);
    return { deletedCount: deleted };
  }

  @Post('conversations/:conversationId/clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all messages in a conversation (admin only)' })
  async clearConversation(
    @Param('conversationId') conversationId: string,
  ) {
    this.logger.log(`Clearing conversation: ${conversationId}`);
    const deleted = await this.chatService.clearConversation(conversationId);
    return { deletedCount: deleted };
  }

  @Delete('conversations/:conversationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete entire conversation (admin only)' })
  async deleteConversation(
    @Param('conversationId') conversationId: string,
  ) {
    this.logger.log(`Deleting conversation: ${conversationId}`);
    await this.chatService.deleteConversation(conversationId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get chat statistics' })
  async getChatStats() {
    this.logger.log(`Fetching chat statistics`);
    return this.chatService.getStatistics();
  }
}
