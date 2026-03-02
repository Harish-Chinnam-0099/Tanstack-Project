import { createFileRoute,Link } from "@tanstack/react-router";
import type { RecipeSearchParams } from "@/types";
import RecipesTable from "#/components/RecipesTable";

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

    // sort:
    //   typeof search.sort === "string"
    //     ? search.sort
    //     : undefined,

    // order:
    //   search.order === "asc" || search.order === "desc"
    //     ? search.order
    //     : undefined,
  }),
  component:RecipesPage
});

function RecipesPage() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Recipes</h2>
      <Link to='/recipesupdate/add'>
      <button>Add Recipe</button></Link>
      <RecipesTable />
    </div>
  );
}