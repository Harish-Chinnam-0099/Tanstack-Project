export interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  image: string;
  rating: number;
  reviewCount: number;
  mealType:string[];
  tags:string[]
}

export interface RecipesResponse {
  recipes: Recipe[];
  total: number;
  skip: number;
  data:Recipe[];
  limit: number;
  page:number;
}


export interface RecipeSearchParams  {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  cuisine?: string;
  mealType?:string;
  difficulty?:string;
  rating?:number;
};
