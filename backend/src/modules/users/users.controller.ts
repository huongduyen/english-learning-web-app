import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile data' })
  async getProfile(@CurrentUser() userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Alias for get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user data' })
  async getMe(@CurrentUser() userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile and learning settings' })
  @ApiResponse({ status: 200, description: 'Updated profile data' })
  async updateProfile(@Body() dto: UpdateProfileDto, @CurrentUser() userId: string) {
    return this.usersService.updateProfile(userId, dto);
  }
}
