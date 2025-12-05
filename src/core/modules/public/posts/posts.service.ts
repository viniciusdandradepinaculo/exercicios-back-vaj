import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/persistence/database/prisma/prisma.service';
import { ListPostsDto } from './dto/list-posts.dto';
import { PaginatedResponseDto } from 'src/core/types/dto/pagination.dto';
import { title } from 'process';


@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPostsByUsername(params: { username: string; filters: ListPostsDto }):Promise<PaginatedResponseDto<any>> {
    const {username, filters} = params;
    const page = filters.page
    const limit = filters.limit
    const where: any = {
      author:{
        username
      }
    }
    where.title ={
      contains:filters.search
    } 
    const postsByUsername =await this.prisma.post.findMany({
      where,
      include:{
        author:{
          select:{username:true}
        }
      },
      orderBy:{
        createdAt:'desc'
      }
    })
    const total = await this.prisma.post.count({
      where
    })
    const data = postsByUsername.map((post)=>({
      id:post.id,
      title:post.title,
      content:post.content,
      createdAt:post.createdAt,
      author:post.author.username
    }))
    const formattedResponse = new PaginatedResponseDto({data,total,page,limit, query:{
      search:filters.search
    }})
    return formattedResponse;
  }
}
