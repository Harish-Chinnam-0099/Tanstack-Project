// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import { useQuery } from "@tanstack/react-query";
// import { getRecipe, updateRecipe } from "@/api/recipes";
// import RecipeForm from "@/components/templates/RecipeForm";

// export const Route = createFileRoute("/_protected/recipesupdate/$id")({
//   component: EditRecipe,
// });

// function EditRecipe() {
//   const { id } = Route.useParams();
//   const navigate = useNavigate();

//   const { data } = useQuery({
//     queryKey: ["recipe", id],
//     queryFn: () => getRecipe(Number(id)),
//   });


// async function handleSubmit(formData: any) {
//   try {
//     await updateRecipe(Number(id), formData);
//   } catch (err) {
//     console.log("Ignoring API error (DummyJSON limitation)");
//   }

//   alert("Recipe updated successfully ✅");

//   navigate({
//     to: "/recipes",
//   });
// }

//   if (!data) return <h3>Loading...</h3>;

//   return <RecipeForm initialData={data} onSubmit={handleSubmit} />;
// }


import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { getRecipe, updateRecipe } from "@/api/recipes";
import RecipeForm from "@/components/templates/RecipeForm";
import { queryKeys } from "@/lib/queryKeys";

export const Route = createFileRoute(
  "/_protected/recipesupdate/$id"
)({
  component: EditRecipe,
});

function EditRecipe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const recipeId = Number(id);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.recipe(recipeId),
    queryFn: () => getRecipe(recipeId),
  });

  const updateMutation = useMutation({
    mutationFn: (formData: any) =>
      updateRecipe(recipeId, formData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recipes"],
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.recipe(recipeId),
      });

      alert("Recipe updated successfully ✅");

      navigate({
        to: "/recipes",
      });
    },

    onError: () => {
      alert(
        "Update in Dummy json is not possible"
      );
      navigate({ to: "/recipes" });
    },
  });

  if (isLoading) return <h3>Loading...</h3>;
  if (isError || !data)
    return <h3>Failed to load recipe</h3>;

  return (
    <div className="max-w-2xl mx-auto py-6">
      <RecipeForm
        initialData={data}
        onSubmit={(form) => updateMutation.mutate(form)}
        isPending={updateMutation.isPending}
      />
    </div>
  );
}