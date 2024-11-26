import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://henriquerafaeldaltrozo:gGcSR2H2ztBZiilt@clusterweatherapp.9z9jz.mongodb.net/?retryWrites=true&w=majority&appName=ClusterWeatherApp',
    ),
    AuthModule,
    UserModule,
    TokenModule,
  ],
})
export class AppModule {}
