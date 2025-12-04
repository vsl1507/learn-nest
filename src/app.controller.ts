import { Controller, Get, Head } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'API health check' })
  @Head()
  health() {
    return {
      success: true,
      message: 'API is running',
      timestamp: new Date(),
    };
  }
}
