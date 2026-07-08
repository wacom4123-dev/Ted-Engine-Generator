
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  id: string;
  

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  name: string;
  

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  price: number;
  

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;
  
}
      