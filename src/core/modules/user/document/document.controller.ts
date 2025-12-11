import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { UserRole } from 'generated/prisma';
import { Doc } from 'src/utils/documentation/doc';
import { UserId } from 'src/utils/decorators/user-id.decorator';
import { UploadUserDocumentDto } from './dto/document.dto';
import { UserDocumentResponse } from './dto/document-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('User/Documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
@Controller('/user/documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}
  //Adicionar Responses
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @Doc({
    description: 'Upload de documento do usuário',
    name: 'Upload de documento',
    response: UserDocumentResponse,
  })
  async uploadDocument(
    @UserId() userId: string,
    @Body() body: UploadUserDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentService.uploadDocument(userId, body, file);
  }

  @Get()
  @Doc({
    description: 'Listagem de documentos do usuário',
    name: 'Listagem de documentos',
    response: UserDocumentResponse,
    isArray: true,
  })
  async listDocumentsUser(@UserId() userId: string) {
    return this.documentService.listDocumentsUser(userId);
  }

  @Delete(':documentId')
  @Doc({
    description: 'Deleção de documento',
    name: 'Deleção de documento',
  })
  async deleteDocument(@UserId() userId: string, @Param('documentId') documentId: string) {
    await this.documentService.deleteDocument(userId, documentId);
  }
}
