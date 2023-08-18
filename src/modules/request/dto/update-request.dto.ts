import { IsBoolean, IsDefined } from 'class-validator';

export class UpdateRequestDto {
  @IsDefined()
  @IsBoolean()
  isAccept: boolean;
}
