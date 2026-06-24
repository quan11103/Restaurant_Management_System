import { PartialType } from '@nestjs/swagger';
import { CreateGoodsBillDto } from './create-goods-bill.dto';

export class UpdateGoodsBillDto extends PartialType(CreateGoodsBillDto) {}
