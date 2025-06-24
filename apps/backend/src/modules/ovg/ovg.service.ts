// src/modules/cedis/cedis.service.ts

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OVGService {
  private baseUrl: string;
  private username: string;
  private password: string;
  private token: string;
  private tokenExpiration: Date;

  constructor(
    private http: HttpService,
    private config: ConfigService,
  ) {
    const ovgConfig = this.config.get('ovg');
    if (!ovgConfig) {
      throw new Error('OVG configuration is missing');
    }
    this.baseUrl = ovgConfig.baseUrl;
    this.username = ovgConfig.username;
    this.password = ovgConfig.password;
  }

  private async getToken(): Promise<string> {
    if (!this.token || new Date() > this.tokenExpiration) {
      const res = await firstValueFrom(
        this.http.post(`${this.baseUrl}/APIControlAccess`, {
          username: this.username,
          password: this.password,
        }),
      );
      this.token = res.data.token;
      this.tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
    return this.token;
  }

  async sendGetRequest(endpoint: string): Promise<any> {
    const token = await this.getToken();
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.baseUrl}/${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      return { status: res.status, data: res.data };
    } catch (error) {
      console.error('Error in OVG API request:', error);
      throw new Error('OVG API request failed');
    }
  }
}
