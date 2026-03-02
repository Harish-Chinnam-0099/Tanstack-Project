import { useNavigate, useSearch } from "@tanstack/react-router";
import { RecipeSearchParams } from "#/types";

export default function RecipeFilters() {
  const navigate = useNavigate({
    from: "/recipes",
  });

  const search = useSearch({
    from: "/_protected/recipes",
  }) as RecipeSearchParams;

  const limit = Number(search.limit ?? 5);

  return (
    <div style={{ marginBottom: "1rem" }}>
      {/* Search */}
      <input
        placeholder="Search..."
        defaultValue={search.search}
        onChange={(e) =>
          navigate({
            search: (prev) => ({
              ...prev,
              page: 1,
              search: e.target.value || undefined,
            }),
          })
        }
      />

      {/* Limit */}
      <select
        value={limit}
        onChange={(e) =>
          navigate({
            search: (prev) => ({
              ...prev,
              page: 1,
              limit: Number(e.target.value),
            }),
          })
        }
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
      </select>

      {/* Cuisine Filter */}
      <select
        value={search.cuisine ?? ""}
        onChange={(e) =>
          navigate({
            search: (prev) => ({
              ...prev,
              page: 1,
              cuisine: e.target.value || undefined,
            }),
          })
        }
      >
        <option value="">All Cuisines</option>
        <option value="Italian">Italian</option>
        <option value="Indian">Indian</option>
        <option value="Chinese">Chinese</option>
        <option value="Mexican">Mexican</option>
      </select>

      {/* Difficulty Filter */}
      <select
        value={search.difficulty ?? ""}
        onChange={(e) =>
          navigate({
            search: (prev) => ({
              ...prev,
              page: 1,
              difficulty: e.target.value || undefined,
            }),
          })
        }
      >
        <option value="">All Difficulty</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>
    </div>
  );
}