import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/persistence/database/prisma/prisma.service';
import { ListPostsDto } from './dto/list-posts.dto';
import { PaginatedResponseDto } from 'src/core/types/dto/pagination.dto';
import { contains } from 'class-validator';
import { Prisma } from 'generated/prisma';
import { PostListResponse, PostResponseDTO } from './dto/post-response.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  // async listPostsByUsername(params: { username: string; filters: ListPostsDto }):Promise<PaginatedResponseDto<any>> {
  //   const {username, filters} = params;
  //   const page = filters.page
  //   const limit = filters.limit
  //   const authorFilters: any = {
  //     author:{
  //       username
  //     },
  //     title:{
  //       contains:filters.search}
  //   }

  //   const postsByUsername =await this.prisma.post.findMany({
  //     where:authorFilters,
  //     include:{
  //       author:{
  //         select:{username:true}
  //       }
  //     },
  //     orderBy:{
  //       createdAt:'desc'
  //     }
  //   })
  //   const total = await this.prisma.post.count({
  //     where:authorFilters
  //   })
  //   const data = postsByUsername.map((post)=>({
  //     id:post.id,
  //     title:post.title,
  //     content:post.content,
  //     createdAt:post.createdAt,
  //     author:post.author.username
  //   }))
  //   const formattedResponse = new PaginatedResponseDto({data,total,page,limit, query:{
  //     search:filters.search
  //   }})
  //   return formattedResponse;
  // }
  
  async listPostsByUsername(params: {
    username: string;
    filters: ListPostsDto;
  }): Promise<PostListResponse> {
    const {
      username,
      filters: { limit, page, search },
    } = params;
    const offset = (page - 1) * limit;

    const authorFilters: Prisma.PostWhereInput = {
      author: {
        username,
      },
      title: {
        contains: search,
        mode: 'insensitive',
      },
    };

    const [postsByUsername, total] = await Promise.all([
      this.prisma.post.findMany({
        where: authorFilters,
        include: {
          author: {
            select: { username: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.post.count({
        where: authorFilters,
      }),
    ]);

    const data = postsByUsername.map((post) => {
      const { updatedAt, authorId, author, ...rest } = post;
      return {
        ...rest,
        author: author.username,
      };
    });

    const formattedResponse = new PaginatedResponseDto({
      data,
      total,
      page,
      limit,
      query: {
        search,
      },
    });

    return formattedResponse;
  }
}
