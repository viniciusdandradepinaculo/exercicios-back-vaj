import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';

@Module({
  controllers: [],
  providers: [],
  imports: [UserModule],
})
export class CommonModule {}
