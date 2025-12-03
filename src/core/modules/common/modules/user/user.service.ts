import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/integrations/persistence/database/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique(
      {where:{id}, 
      select:{id:true, 
        email:true, 
        createdAt:true, 
        profile:{
          select:{
            bio:true,
            birthDate:true,
            posts: {
              orderBy: {createdAt:'desc'},
              select: {
                id:true,
                title:true,
                content:true,
                createdAt:true
              }
            }
          }
    }}})
    return user;
  }

  async findAll(): Promise<{users: any[]}> {
    const users = this.prisma.user.findMany({select:{id:true, profile:{select:{username:true, bio: true, birthDate:true, _count:{select:{posts:true}}}}}});
    const usersFormatted = (await users).map((user)=>({id:user.id,username:user.profile.username,bio:user.profile.bio,birthDate:user.profile.birthDate, numberOfPosts:user.profile._count.posts}))
    return {users: usersFormatted};
  }
}
