import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Assuming you have a config package to manage environment variables
import { AddLeadDto } from './dto/add-lead.dto';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';

@Injectable()
export class ClosumService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async addLead(addLeadDto: AddLeadDto) {
    const apiUrl = this.configService.getOrThrow<string>('CLOSUM_API_URL');
    const apiKey = this.configService.getOrThrow<string>('CLOSUM_API_KEY');
    if (!apiUrl) {
      throw new Error('CLOSUM_API_URL is not defined in environment variables');
    }

    const leadPayload = {
      name: addLeadDto.name,
      email: addLeadDto.email,
      mobile_number: addLeadDto.mobile_number,
      consent_email: true,
      consent_sms: true,
      contact_lifecycle_stage_id: 4,
      tags: ['website'],
    };

    try {
      const response = await this.httpService
        .post(`${apiUrl}/lead/add/?api-key=${apiKey}`, leadPayload)
        .toPromise();

      if (
        response.data.status &&
        response.data.code === 200 &&
        response.data.responseData &&
        response.data.responseData.length > 0 &&
        response.data.responseData[0].lead_id &&
        response.data.message &&
        response.data.message.includes('success')
      ) {
        return {
          success: true,
          lead_id: response.data.responseData[0].lead_id,
          message: response.data.message,
        };
      }
      throw new BadRequestException(
        'Failed to add lead: ' + response.data.message || 'Unknown error',
      );
    } catch (error) {
      console.error('Error adding lead to Closum:', error);
      throw error;
    }
  }
}
