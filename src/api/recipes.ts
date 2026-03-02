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

  const query = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  });

  if (params.sort) {
    query.set("sortBy", params.sort);
    query.set("order", params.order ?? "asc");
  }

  let baseUrl = `${ENV.RECIPES_URL}/recipes`;

  if (params.search) {
    baseUrl = `${ENV.RECIPES_URL}/recipes/search`;
    query.set("q", params.search);
  }

  if (params.cuisine) {
    baseUrl = `${ENV.RECIPES_URL}/recipes/tag/${params.cuisine}`;
  }

  const res = await fetch(`${baseUrl}?${query}`);

  if (!res.ok) throw new Error(res.statusText);

  const json = await res.json();

  let recipes = json.recipes ?? [];

  if (params.difficulty) {
    recipes = recipes.filter(
      (r: Recipe) => r.difficulty === params.difficulty
    );
  }

  return {
    recipes,
    data: recipes,
    total: json.total ?? recipes.length,
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