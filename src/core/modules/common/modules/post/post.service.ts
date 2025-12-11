import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/persistence/database/prisma/prisma.service';
import { EditPostDto } from './dto/edit-post.dto';
import {
  AppErrorConflict,
  AppErrorForbidden,
  AppErrorMethodNotAllowed,
  AppErrorNotFound,
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
      where: {
        id: postId,
        author: { userId },
        deleted: false,
      },
    });
    if (!postToBeEdited) {
      throw new AppErrorNotFound('Post não encontrado.');
    }

    // if (userId !== postToBeEdited.authorId) {
    //   throw new AppErrorForbidden('Não é possível atualizar posts de outros usuários.');
    // }

    return await this.prismaService.post.update({
      where: { id: postId },
      data: body,
    });
  }

  async delete(params: { postId: string; userId: string }): Promise<void> {
    const { postId, userId } = params;
    const postToBeDeleted = await this.prismaService.post.findUnique({
      where: {
        id: postId,
        author: { userId },
        deleted: false,
      },
    });

    // if (userId !== postToBeDeleted.authorId) {
    //   throw new AppErrorForbidden('Não é possível deletar posts de outros usuários.');
    // }

    if (!postToBeDeleted) {
      throw new AppErrorNotFound('Post não encontrado');
    }

    await this.prismaService.post.update({ where: { id: postId }, data: { deleted: true } });
  }
}
