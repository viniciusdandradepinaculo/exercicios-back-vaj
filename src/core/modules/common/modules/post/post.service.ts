import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/persistence/database/prisma/prisma.service';
import { EditPostDto } from './dto/edit-post.dto';
import {
  AppErrorConflict,
  AppErrorForbidden,
  AppErrorMethodNotAllowed,
} from 'src/utils/errors/app-errors';
import { UserId } from 'src/utils/decorators/user-id.decorator';
import { Post } from 'generated/prisma/client';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}
  //Tipar retorno
  async edit(params: { postId: string; body: EditPostDto; userId: string }): Promise<Post> {
    const { postId, body, userId } = params;
    const postToBeEdited = await this.prismaService.post.findUnique({
      where: { id: postId },
    });

    // if (userId !== postToBeEdited.authorId) {
    //   throw new AppErrorForbidden('Não é possível atualizar posts de outros usuários.');
    // }
    const userProfile = await this.prismaService.profile.findUnique({ where: { id: postToBeEdited.authorId } });

    if (userProfile.userId !== userId) {
      throw new AppErrorForbidden('Não é possível atualizar posts de outros usuários.');
    }

    if (postToBeEdited.deleted === true) {
      throw new AppErrorConflict('Post inválido para edição.');
    }

    return await this.prismaService.post.update({
      where: { id: postId },
      data: body,
    });
  }

  async delete(params: { postId: string; userId: string }): Promise<void> {
    const { postId, userId } = params;
    const postToBeDeleted = await this.prismaService.post.findUnique({
      where: { id: postId },
    });

    // if (userId !== postToBeDeleted.authorId) {
    //   throw new AppErrorForbidden('Não é possível deletar posts de outros usuários.');
    // }

    const userProfile = await this.prismaService.profile.findUnique({
      where: { id: postToBeDeleted.authorId },
    });

    if (userProfile.userId !== userId) {
      throw new AppErrorForbidden('Não é possível deletar posts de outros usuários.');
    }

    if (postToBeDeleted.deleted === true) {
      throw new AppErrorConflict('Post já deletado.');
    }

    await this.prismaService.post.update({ where: { id: postId }, data: { deleted: true } });
  }
}
