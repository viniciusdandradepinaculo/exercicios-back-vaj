import { Controller, Get, Param, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { ApiTags } from '@nestjs/swagger';
import { ListPostsDto } from './dto/list-posts.dto';
import { Doc } from 'src/utils/documentation/doc';
import { PostListResponse } from './dto/post-response.dto';

@ApiTags('Public/Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Doc({
    name: 'List posts by username',
    description:'',
    response:PostListResponse
  })
  @Get('/user/:username')
  async listPostsByUsername(@Param('username') username: string, @Query() filters: ListPostsDto) {
    return await this.postsService.listPostsByUsername({ username, filters });
  }
}
