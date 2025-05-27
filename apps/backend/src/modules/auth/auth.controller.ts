import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Res,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Response } from 'express';
import { User } from '@prisma/client';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @CurrentUser() user: User,
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    return this.authService.login(user, response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: User) {
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      name: user.name,
      email: user.email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    response.clearCookie('auth_token');

    return { message: 'Logout successful' };
  }
}
