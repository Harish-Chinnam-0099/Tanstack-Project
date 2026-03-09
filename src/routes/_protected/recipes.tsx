import { createFileRoute, Link } from "@tanstack/react-router";
import type { RecipeSearchParams } from "@/types";
import RecipesTable from "#/components/RecipesTable";
import { Button } from "#/components/ui/button";

export const Route = createFileRoute("/_protected/recipes")({
  validateSearch: (search): RecipeSearchParams => ({
    page: Number(search.page ?? 1),
    limit: Number(search.limit ?? 5),

    search:
      typeof search.search === "string"
        ? search.search
        : undefined,

    cuisine:
      typeof search.cuisine === "string"
        ? search.cuisine
        : undefined,

    difficulty:
      typeof search.difficulty === "string"
        ? search.difficulty
        : undefined,

    sort:
      typeof search.sort === "string"
        ? search.sort
        : undefined,

    order:
      search.order === "asc" || search.order === "desc"
        ? search.order
        : undefined,
  }),
  component:RecipesPage
});

function RecipesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recipes</h2>
        <Button asChild>
          <Link to="/recipesupdate/add">Add Recipe</Link>
        </Button>
      </div>
      <RecipesTable />
    </div>
  );
}