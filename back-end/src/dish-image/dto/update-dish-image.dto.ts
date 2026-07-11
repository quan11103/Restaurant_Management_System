import { PartialType } from '@nestjs/swagger';
import { CreateDishImageDto } from './create-dish-image.dto';

export class UpdateDishImageDto extends PartialType(CreateDishImageDto) {}
