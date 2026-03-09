// import { RecipeSearchParams, RecipesResponse,Recipe } from "#/types";
// import { ENV } from "#/config/env";

// export async function getRecipes(
//   params: RecipeSearchParams
// ): Promise<RecipesResponse> {
//   const page = params.page ?? 1;
//   const limit = params.limit ?? 5;
//   const skip = (page - 1) * limit;

//   const query = new URLSearchParams({
//     limit: String(limit),
//     skip: String(skip),
//   });

//   // Sorting
//   if (params.sort) {
//     query.set("sortBy", params.sort);
//     query.set("order", params.order ?? "asc");
//   }

//   let baseUrl = `${ENV.BASE_URL}/recipes`;

//   // Search
//   if (params.search) {
//     baseUrl = `${ENV.BASE_URL}/recipes/search`;
//     query.set("q", params.search);
//   }

//   // Cuisine filter
//   if (params.cuisine) {
//     baseUrl = `${ENV.BASE_URL}/recipes/tag/${params.cuisine}`;
//   }

//   const url = `${baseUrl}?${query.toString()}`;

//   const res = await fetch(url);

//   if (!res.ok) {
//     throw new Error(res.statusText);
//   }

//   const json = await res.json();

//   let recipes = json.recipes ?? [];

//   // Difficulty filter (client-side if API doesn't support)
//   if (params.difficulty) {
//     recipes = recipes.filter(
//       (recipe: any) => recipe.difficulty === params.difficulty
//     );
//   }

//   return {
//     recipes,
//     data: recipes,
//     total: json.total ?? recipes.length,
//     skip,
//     limit,
//     page,
//   };
// }


// // CREATE
// export async function addRecipe(data: Partial<Recipe>) {
//   const res = await fetch(`${ENV.BASE_URL}/recipes/add`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });

//   if (!res.ok) throw new Error(res.statusText);

//   return res.json();
// }

// // UPDATE
// export async function updateRecipe(
//   id: number,
//   data: Partial<Recipe>
// ) {
//   const res = await fetch(`${ENV.BASE_URL}/recipes/${id}`, {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   });

//   if (!res.ok) throw new Error(res.statusText);

//   return res.json();
// }




// // DELETE
// export async function deleteRecipe(id: number) {
//   const res = await fetch(`${ENV.BASE_URL}/recipes/${id}`, {
//     method: "DELETE",
//   });

//   if (!res.ok) throw new Error(res.statusText);

//   return res.json();
// }

// // GET SINGLE (for edit)
// export async function getRecipe(id: number): Promise<Recipe> {
//   const res = await fetch(`${ENV.BASE_URL}/recipes/${id}`);

//   if (!res.ok) throw new Error(res.statusText);

//   return res.json();
// }




import { RecipeSearchParams, RecipesResponse, Recipe } from "#/types";
import { ENV } from "#/config/env";

/* ---------------- GET LIST ---------------- */
export async function getRecipes(
  params: RecipeSearchParams
): Promise<RecipesResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 5;
  const skip = (page - 1) * limit;

  // Cuisine and difficulty have no server-side endpoint, so we fetch
  // all matching records and paginate client-side for accurate totals.
  const hasClientFilters = !!(params.cuisine || params.difficulty);

  let baseUrl = `${ENV.RECIPES_URL}/recipes`;
  const query = new URLSearchParams();

  if (params.search) {
    baseUrl = `${ENV.RECIPES_URL}/recipes/search`;
    query.set("q", params.search);
  }

  if (params.sort) {
    query.set("sortBy", params.sort);
    query.set("order", params.order ?? "asc");
  }

  if (hasClientFilters) {
    // limit=0 → DummyJSON returns all records
    query.set("limit", "0");
    query.set("skip", "0");
  } else {
    query.set("limit", String(limit));
    query.set("skip", String(skip));
  }

  const res = await fetch(`${baseUrl}?${query}`);

  if (!res.ok) throw new Error(res.statusText);

  const json = await res.json();

  let recipes: Recipe[] = json.recipes ?? [];

  // Apply client-side filters on the full dataset
  if (params.cuisine) {
    recipes = recipes.filter((r) => r.cuisine === params.cuisine);
  }
  if (params.difficulty) {
    recipes = recipes.filter((r) => r.difficulty === params.difficulty);
  }

  // Total after filtering (correct count for pagination)
  const total = hasClientFilters ? recipes.length : (json.total ?? recipes.length);

  // Client-side pagination on the filtered full list
  if (hasClientFilters) {
    recipes = recipes.slice(skip, skip + limit);
  }

  return {
    recipes,
    data: recipes,
    total,
    skip,
    limit,
    page,
  };
}

/* ---------------- SINGLE ---------------- */
export async function getRecipe(id: number): Promise<Recipe> {
  const res = await fetch(`${ENV.RECIPES_URL}/recipes/${id}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

/* ---------------- CREATE ---------------- */
export async function addRecipe(data: Partial<Recipe>) {
  const res = await fetch(`${ENV.RECIPES_URL}/recipes/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

/* ---------------- UPDATE ---------------- */
export async function updateRecipe(
  id: number,
  data: Partial<Recipe>
) {
  const res = await fetch(`${ENV.RECIPES_URL}/recipes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

/* ---------------- DELETE ---------------- */
export async function deleteRecipe(id: number) {
  const res = await fetch(`${ENV.RECIPES_URL}/recipes/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}