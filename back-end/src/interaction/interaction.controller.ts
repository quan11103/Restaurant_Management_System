import { Controller, Post, Body } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('interactions')
@UseGuards(JwtAuthGuard)
export class InteractionController {
  constructor(
    private readonly interactionService: InteractionService,
  ) { }

  @Post('view')
  recordView(
    @CurrentUser() user: JwtPayload,
    @Body('dishId') dishId: number,
  ) {
    return this.interactionService.viewDish(
      user.sub,
      dishId,
    );
  }
}
