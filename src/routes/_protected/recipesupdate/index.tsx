import { createFileRoute, Link } from "@tanstack/react-router";
import RecipesTable from "@/components/RecipesTable";

export const Route = createFileRoute("/_protected/recipesupdate/")({
  component: RecipesPage,
});

function RecipesPage() {
  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Recipes</h2>

        {/* ✅ ADD BUTTON */}
        <Link to="/recipesupdate/add">
          <button>Add Recipe</button>
        </Link>
      </div>

      <RecipesTable />
    </div>
  );
}