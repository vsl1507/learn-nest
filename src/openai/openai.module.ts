import { Global, Module } from '@nestjs/common';
import OpenAI from 'openai';

@Global()
@Module({
  providers: [
    {
      provide: 'OPENAI_CLIENT',
      useFactory: () => {
        return new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
      },
    },
  ],
  exports: ['OPENAI_CLIENT'],
})
export class OpenaiModule {}
