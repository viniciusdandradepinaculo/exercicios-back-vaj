import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from 'generated/prisma';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import { Doc } from 'src/utils/documentation/doc';
import { PaginatedResponseDto } from 'src/core/types/dto/pagination.dto';
import {
  ListUserDocsPagination,
  UserDocumentResponse,
} from 'src/core/modules/user/document/dto/document-response.dto';
import { AdminListDocsDto } from './dto/admin-list-docs.dto';

@ApiTags('Admin/Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('/admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Doc({
    name: 'Listagem de documentos',
    description: 'Listagem de documentos dos usuários',
    response: ListUserDocsPagination,
  })
  @Get('documents')
  async listAllUserDocs(@Query() query: AdminListDocsDto) {
    return await this.adminUserService.listAllUserDocs(query);
  }

  @Doc({
    name: 'Aprovação de documentos',
    description: 'Aprovação de documentos por administradores',
    response: UserDocumentResponse,
  })
  @Patch('documents/:documentId/approve')
  async approveDocument(@Param('documentId') documentId: string) {
    return await this.adminUserService.aproveDocument(documentId);
  }
}
