import { Injectable } from '@nestjs/common';

@Injectable()
export class ClerkConfig {
  readonly secretKey: string;
  readonly publishableKey: string;

  constructor() {
    this.secretKey = process.env.CLERK_SECRET_KEY;
    this.publishableKey = process.env.CLERK_PUBLISHABLE_KEY;

    if (!this.secretKey) {
      throw new Error('CLERK_SECRET_KEY is required');
    }

    if (!this.publishableKey) {
      throw new Error('CLERK_PUBLISHABLE_KEY is required');
    }
  }
}
