import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CategoryOrder {
  id: string;
  sort_order: number;
}

export class ReorderCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryOrder)
  categories: CategoryOrder[];
}
