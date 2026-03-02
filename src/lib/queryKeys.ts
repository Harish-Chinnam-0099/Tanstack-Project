import { RecipeSearchParams } from "#/types";

export const queryKeys = {
  recipes: (params: RecipeSearchParams) =>
    ["recipes", params] as const,

  recipe: (id: number) =>
    ["recipe", id] as const,
};