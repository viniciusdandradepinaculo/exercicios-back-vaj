import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsBooleanString, IsEnum, IsOptional } from 'class-validator';
import { DocumentType } from 'generated/prisma';
import { PaginationDto } from 'src/core/types/dto/pagination.dto';

export class AdminListDocsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: DocumentType, description: 'Tipo do documento' })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @ApiPropertyOptional({ description: 'Filtro de documentos por validação' })
  @IsOptional()
  @IsBooleanString()
  validated?: string;
}
