import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from 'generated/prisma';

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

  @ApiProperty({type:()=>FileResponse})
  file:FileResponse
}
