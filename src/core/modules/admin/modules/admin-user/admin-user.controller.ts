import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from 'generated/prisma';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import { Doc } from 'src/utils/documentation/doc';
import { PaginatedResponseDto } from 'src/core/types/dto/pagination.dto';
import { UserDocumentResponse } from 'src/core/modules/user/document/dto/document-response.dto';
import { AdminListDocsDto } from './dto/admin-list-docs.dto';

@ApiTags('Admin/Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('/admin/users')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get('documents')
  @Doc({ name: 'Listagem de documentos', description: 'Listagem de documentos dos usuários' })
  async listAllUserDocs(
    @Query() query: AdminListDocsDto,
  ): Promise<PaginatedResponseDto<UserDocumentResponse>> {
    return this.adminUserService.listAllUserDocs(query);
  }

  @Patch('documents/:documentId/approve')
  @Doc({
    name: 'Aprovação de documentos',
    description: 'Aprovação de documentos por administradores',
  })
  async approveDocument(@Param('documentId') documentId: string): Promise<UserDocumentResponse> {
    return this.adminUserService.aproveDocument(documentId);
  }
}
