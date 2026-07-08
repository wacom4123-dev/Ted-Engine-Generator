
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  id: string;
  

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  email: string;
  

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  password: string;
  

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name: string;
  

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  role: string;
  
}
      