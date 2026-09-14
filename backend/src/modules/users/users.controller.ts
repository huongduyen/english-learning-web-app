import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Current user data and profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current authenticated user profile and settings' })
  @ApiResponse({ status: 200, description: 'Updated profile data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateMe(@Body() dto: UpdateProfileDto, @CurrentUser() userId: string) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Alias for get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Alias for update current user profile and learning settings' })
  @ApiResponse({ status: 200, description: 'Updated profile data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@Body() dto: UpdateProfileDto, @CurrentUser() userId: string) {
    return this.usersService.updateProfile(userId, dto);
  }
}
