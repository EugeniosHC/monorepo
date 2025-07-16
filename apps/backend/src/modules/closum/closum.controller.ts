import { Body, Controller, Post } from '@nestjs/common';
import { ClosumService } from './closum.service';
import { AddLeadDto } from './dto/add-lead.dto';
import { AddNewsletterDto } from './dto/add-newsletter.dto';

@Controller('closum')
export class ClosumController {
  constructor(private readonly closumService: ClosumService) {}

  @Post('add-lead')
  async addLead(@Body() addLeadDto: AddLeadDto) {
    return this.closumService.addLead(addLeadDto);
  }

  @Post('newsletter')
  async subscribeToNewsletter(@Body() addNewsLetterDto: AddNewsletterDto) {
    return this.closumService.subscribeToNewsletter(addNewsLetterDto);
  }
}
