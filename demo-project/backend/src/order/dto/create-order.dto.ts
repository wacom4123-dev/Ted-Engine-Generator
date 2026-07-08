
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  id: string;
  

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  userId: string;
  

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  total: number;
  

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  status: string;
  
}
      