import { Injectable } from '@nestjs/common';
import { DocumentType } from 'generated/prisma';
import { PrismaService } from 'src/integrations/persistence/database/prisma/prisma.service';
import { FileService } from 'src/integrations/persistence/storage/file/file.service';
import { AppErrorMethodNotAllowed } from 'src/utils/errors/app-errors';
import { UploadUserDocumentDto } from './dto/document.dto';
import { ENUM_OPERATOR_TYPE } from 'src/integrations/persistence/storage/file/file.enum';
import { UserDocumentResponse } from './dto/document-response.dto';

@Injectable()
export class DocumentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  private validateDocumentSize(type: DocumentType, code: string) {
    const length = code.length;
    if (type === DocumentType.RG) {
      if (length < 7 || length > 9) {
        throw new AppErrorMethodNotAllowed('O código do RG deve ter de 7 a 9 números.');
      }
    } else {
      if (length !== 11) {
        throw new AppErrorMethodNotAllowed(`O código de ${type} deve ter exatamente 11 números.`);
      }
    }
  }

  async uploadDocument(userId: string, dto: UploadUserDocumentDto, file:Express.Multer.File):Promise<UserDocumentResponse> {
    const { type, number } = dto;

    if (!file) {
      throw new AppErrorMethodNotAllowed('É necessário fornecer um arquivo.');
    }
    const documentTypeUploaded = await this.prismaService.document.findFirst({
      where: {
        userId,
        type: type,
      },
    });

    if (documentTypeUploaded) {
      throw new AppErrorMethodNotAllowed('Só é possível salvar um documento por tipo.');
    }

    this.validateDocumentSize(type, number);

    const document = await this.prismaService.$transaction(async (tx) => {
      const createdDocument = await tx.document.create({
        data: {
          type: type,
          number: number,
          validated: false,
          userId,
        },
      });
      const savedFile = await this.fileService.saveFile({
        file,
        entity: 'user-document',
        operatorType: ENUM_OPERATOR_TYPE.USER,
        entityId: createdDocument.id,
        operatorId: userId,
      });
      const updatedDocument = await tx.document.update({
        where: { id: createdDocument.id },
        data: { fileId: savedFile.id },
        select: {
          id: true,
          type: true,
          number: true,
          validated: true,
          createdAt: true,
          file: {
            select: {
              id: true,
              url: true,
            },
          },
        },
      });
      return updatedDocument;
    });
    document.file = await this.fileService.updateFileUrl(document.file);
    return document;
  }
}
