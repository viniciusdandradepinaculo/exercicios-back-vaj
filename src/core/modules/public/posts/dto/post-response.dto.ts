import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PaginatedResponseDto } from 'src/core/types/dto/pagination.dto';

export class PostResponseDTO {
    @ApiProperty({example:'cmirsdepz0002tagw7f0dyease'})
    id:string
    @ApiProperty({example:'Título X'})
    title:string
    @ApiProperty({example:'Uma boa introdução ao estudo...'})
    content:string
    @ApiProperty({example:'2025-12-04 18:45:33.767'})
    createdAt:Date
    @ApiProperty({example:'Carlos'})
    author:string
}

export class PostListResponse extends PaginatedResponseDto<PostResponseDTO> {
    @ApiProperty({type:[PostResponseDTO]})
    data: PostResponseDTO[];
}