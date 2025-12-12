import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/persistence/database/prisma/prisma.service';
import { EditPostDto } from './dto/edit-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { AppErrorNotFound } from 'src/utils/errors/app-errors';
import { Prisma } from 'generated/prisma';
import { EditPostResponse, CreatePostResponse, ListPostsResponse } from './doc/post.doc';
import { PaginatedResponseDto } from 'src/core/types/dto/pagination.dto';
import { FileService } from 'src/integrations/persistence/storage/file/file.service';
import { ENUM_OPERATOR_TYPE } from 'src/integrations/persistence/storage/file/file.enum';

@Injectable()
export class PostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  private async getUserProfile(userId: string) {
    const profile = await this.prismaService.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new AppErrorNotFound('Profile not found');
    }

    return profile;
  }

  async findByIdOrThrow({ userId, postId }: { userId: string; postId: string }) {
    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
        deleted: false,
        author: {
          userId,
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        file: { select: { id: true, url: true } },
      },
    });

    if (!post) {
      throw new AppErrorNotFound('Post not found');
    }

    const urlUpdatedFile = post.file ? await this.fileService.updateFileUrl(post.file) : null;

    return {
      ...post,
      file: urlUpdatedFile,
    };
  }

  async create({
    userId,
    body,
    file,
  }: {
    userId: string;
    body: CreatePostDto;
    file?: Express.Multer.File;
  }): Promise<CreatePostResponse> {
    const profile = await this.getUserProfile(userId);

    if (!file) {
      const post = await this.prismaService.post.create({
        data: {
          title: body.title,
          content: body.content,
          authorId: profile.id,
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          file: { select: { id: true, url: true } },
        },
      });
      return post;
    }

    const postWithCover = await this.prismaService.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          title: body.title,
          content: body.content,
          authorId: profile.id,
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const cover = await this.fileService.saveFile({
        file,
        operatorId: userId,
        entity: 'post-cover',
        operatorType: ENUM_OPERATOR_TYPE.USER,
        entityId: post.id,
      });

      const postUpdatedWithCover = await tx.post.update({
        where: { id: post.id },
        data: { fileId: cover.id },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          file: {
            select: {
              id: true,
              url: true,
            },
          },
        },
      });
      return postUpdatedWithCover;
    });
    return postWithCover;
  }

  async list({
    userId,
    query,
  }: {
    userId: string;
    query: ListPostsDto;
  }): Promise<ListPostsResponse> {
    const { page, limit } = query;

    const profile = await this.getUserProfile(userId);

    const where: Prisma.PostWhereInput = {
      authorId: profile.id,
      deleted: false,
    };

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          file: {
            select: {
              id: true,
              url: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.post.count({ where }),
    ]);
    const postsWithUpdatedUrls = await this.fileService.updateUrlsInObjects(posts);
    return new PaginatedResponseDto({
      data: postsWithUpdatedUrls,
      total,
      page,
      limit,
    });
  }

  async edit({
    userId,
    postId,
    body,
  }: {
    userId: string;
    postId: string;
    body: EditPostDto;
  }): Promise<EditPostResponse> {
    await this.findByIdOrThrow({ userId, postId });

    return await this.prismaService.post.update({
      where: { id: postId },
      data: body,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete({ userId, postId }: { userId: string; postId: string }): Promise<void> {
    const post = await this.findByIdOrThrow({ userId, postId });

    // await this.prismaService.$transaction(async (tx) => {
    //   await tx.post.update({
    //     where: { id: postId },
    //     data: { deleted: true },
    //   });

    //   if (post.file) {
    //     await this.fileService.deleteFile(post.file.id);
    //   }
    // });

    await this.prismaService.post.update({
      where: { id: postId },
      data: { deleted: true },
    });
    
    if (post.file) {
      await this.fileService.deleteFile(post.file.id);
    }
  }

  async updateImage({
    userId,
    postId,
    file,
  }: {
    userId: string;
    postId: string;
    file: Express.Multer.File;
  }) {
    const currentPost = await this.findByIdOrThrow({ userId, postId });

    const updatedPost = await this.prismaService.$transaction(async (tx) => {
      if (currentPost.file) {
        await this.fileService.deleteFile(currentPost.file.id);
      }

      const newCover = await this.fileService.saveFile({
        file,
        operatorId: userId,
        entity: 'post-cover',
        operatorType: ENUM_OPERATOR_TYPE.USER,
        entityId: postId,
      });

      return await tx.post.update({
        where: { id: postId },
        data: { fileId: newCover.id },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          file: {
            select: {
              id: true,
              url: true,
            },
          },
        },
      });
    });

    return updatedPost;
  }
}
