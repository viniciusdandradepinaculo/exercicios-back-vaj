import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/persistence/database/prisma/prisma.service';
import { FileService } from 'src/integrations/persistence/storage/file/file.service';
import { AdminListDocsDto } from './dto/admin-list-docs.dto';
import { PaginatedResponseDto } from 'src/core/types/dto/pagination.dto';
import { UserDocumentResponse } from 'src/core/modules/user/document/dto/document-response.dto';
import { Prisma } from 'generated/prisma';
import { AppErrorMethodNotAllowed } from 'src/utils/errors/app-errors';

@Injectable()
export class AdminUserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async listAllUserDocs(
    query: AdminListDocsDto,
  ): Promise<PaginatedResponseDto<UserDocumentResponse>> {
    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;

    const validationAndTypeFilter: Prisma.DocumentWhereInput = {};

    if (query.type) {
      validationAndTypeFilter.type = query.type;
    }
    if (query.validated !== undefined) {
      validationAndTypeFilter.validated = query.validated === 'true';
    }
    const [total, documents] = await this.prismaService.$transaction([
      this.prismaService.document.count({ where: validationAndTypeFilter }),
      this.prismaService.document.findMany({
        where: validationAndTypeFilter,
        skip: offset,
        take: limit,
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
      }),
    ]);
    await this.fileService.updateUrlsInObjects(documents);
    return new PaginatedResponseDto<UserDocumentResponse>({
      data: documents,
      total,
      page,
      limit,
      query: {
        type: query.type,
        validated: query.validated,
      },
    });
  }
  async aproveDocument(documentId: string): Promise<UserDocumentResponse> {
    const document = await this.prismaService.document.findUnique({
      where: { id: documentId },
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

    if (!document) {
      throw new AppErrorMethodNotAllowed('Documento não encontrado.');
    }

    if (document.validated) {
      throw new AppErrorMethodNotAllowed('Documento já foi validado.');
    }

    const updatedDocument = await this.prismaService.document.update({
      where: { id: documentId },
      data: { validated: true },
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

    if (updatedDocument.file) {
      await this.fileService.updateFileUrl(updatedDocument.file);
    }
    return updatedDocument;
  }
}
