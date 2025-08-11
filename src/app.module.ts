import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './resources/auth/auth.module';
import { ProfileModule } from './resources/profile/profile.module';
import { ServiceCallModule } from './resources/service-call/service-call.module';
import { SettingModule } from './resources/setting/setting.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationModule } from './resources/integration/integration.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './configs/guards/jwt-auth.guard';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT'), 10),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PSWD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        options: {
          encrypt: true,
          trustServerCertificate: true,
          requestTimeout: 30000,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ProfileModule,
    ServiceCallModule,
    SettingModule,
    IntegrationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
