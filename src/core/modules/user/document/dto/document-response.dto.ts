import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from 'generated/prisma';
import { PaginatedResponseDto, PaginationDto } from 'src/core/types/dto/pagination.dto';

export class FileResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;
}

export class UserDocumentResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: DocumentType;

  @ApiProperty()
  number: string;

  @ApiProperty()
  validated: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: FileResponse })
  file: FileResponse;
}

export class ListUserDocsPagination extends PaginatedResponseDto<UserDocumentResponse> {
  @ApiProperty({ type: [UserDocumentResponse] })
  data: UserDocumentResponse[];
}
