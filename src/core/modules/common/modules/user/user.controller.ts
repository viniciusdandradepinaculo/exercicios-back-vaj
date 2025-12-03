import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { Doc } from 'src/utils/documentation/doc';

@ApiTags('Public/User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Doc({
    name: 'Buscar usuários',
    description: "Busca de todos os usuários no banco",
    statusCode: HttpStatus.OK
  })
  @Get('/')
  async findAll() {
    return await this.userService.findAll();
  }

  @Doc({
    name: 'Buscar usuário por ID',
    description: "Busca de usuário no banco via identificador único",
    statusCode: HttpStatus.OK
  })
  @Get('/:id')
  async findById(@Param('id') id: string) {
    return await this.userService.findById(id);
  }
}
