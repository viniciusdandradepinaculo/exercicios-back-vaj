import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, isString } from 'class-validator';
import { PaginationDto } from 'src/core/types/dto/pagination.dto';

export class ListPostsDto extends PaginationDto {
    @ApiProperty({
        description:'Filtro por título do post'
    })
    @IsOptional()
    @IsString()
    search?:string
}
