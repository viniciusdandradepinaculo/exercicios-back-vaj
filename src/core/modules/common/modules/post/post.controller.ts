import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { Doc } from 'src/utils/documentation/doc';
import { EditPostDto } from './dto/edit-post.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/utils/decorators/user-id.decorator';

@ApiTags('Private/Posts')
@UseGuards(JwtAuthGuard)
@Controller('private/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Doc({
    name: 'Edit post',
    description: `Edit a user's post`,
  })
  @Post('/:postId')
  async edit(@Param('postId') postId: string, @UserId() userId:string, @Body() body: EditPostDto) {
    return await this.postService.edit({ postId,userId, body });
  }

  @Doc({
    name: 'Delete post',
    description: `Delete a user's post`,
  })
  @Delete('/:postId')
  async delete(@Param('postId') postId: string, @UserId() userId:string) {
    return await this.postService.delete({ postId, userId });
  }
}
