import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBlockDto {
  @IsString()
  @IsNotEmpty()
  blocked_id: string;
}
