import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RecommendNewUserDto } from './dto/recommend-new-user.dto';

@Injectable()
export class RecommendationService {
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl =
            this.configService.get<string>('RECOMMENDATION_URL')!;
    }

    async health() {
        try {
            const response = await firstValueFrom(
                this.httpService.get(
                    `${this.baseUrl}/health`
                )
            );

            return response.data;
        } catch (error) {
            console.error(error);
            return {
                status: "error",
                info: {}
            };
        }
    }

    async recommendNewUser(
        dto: RecommendNewUserDto,
    ): Promise<number[]> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.baseUrl}/recommend/new-user`,
                    dto
                )
            );

            return response.data.dishIds;
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}