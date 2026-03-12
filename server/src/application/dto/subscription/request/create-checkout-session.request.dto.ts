import { IsString, IsUrl, IsOptional } from 'class-validator';

export class CreateCheckoutSessionRequestDTO {
  @IsString()
  @IsUrl({ require_tld: false }, { message: 'successUrl must be a valid URL' })
  successUrl!: string;

  @IsString()
  @IsUrl({ require_tld: false }, { message: 'cancelUrl must be a valid URL' })
  cancelUrl!: string;

  @IsString()
  @IsOptional()
  plan?: string;
}