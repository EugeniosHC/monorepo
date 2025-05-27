import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email },
      });
      if (!user) {
        Logger.warn(`Failed login attempt - user not found: ${email}`);
        throw new UnauthorizedException('User not found');
      }

      const isPasswordMatched = await bcrypt.compare(password, user.password);
      if (!isPasswordMatched) {
        Logger.warn(`Failed login attempt - invalid password: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      Logger.log(`Successful login: ${email}`);
      return { id: user.id, name: user.name, email: user.email };
    } catch (error) {
      throw error;
    }
  }

  async validateJwtUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return currentUser;
  }

  async login(user: User, response: Response) {
    const tokenPayload = {
      userId: user.id,
    };

    const auth_token = this.jwt.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_AUTH_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_AUTH_EXPIRES_IN'),
    });

    const accessTokenExpiresIn = this.configService.getOrThrow<string>(
      'JWT_AUTH_EXPIRES_IN',
    );

    const AccessTokenExpiryDate = new Date();
    AccessTokenExpiryDate.setDate(
      AccessTokenExpiryDate.getDate() + parseInt(accessTokenExpiresIn),
    );

    response.cookie('auth_token', auth_token, {
      httpOnly: true,
      secure: this.configService.getOrThrow('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      expires: AccessTokenExpiryDate,
    });
  }
}
