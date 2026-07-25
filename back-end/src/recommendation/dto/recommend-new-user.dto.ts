class HistoryDto {
    dishId: number;
    interaction: number;
}

export class RecommendNewUserDto {
    history: HistoryDto[];
    topK: number;
}