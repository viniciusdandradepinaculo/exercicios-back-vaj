import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';

export class CreatePostFormDto extends CreatePostDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  file?: Express.Multer.File;
}
