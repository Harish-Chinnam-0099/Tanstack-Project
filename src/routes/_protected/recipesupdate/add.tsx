// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import { addRecipe } from "@/api/recipes";
// import RecipeForm from "@/components/templates/RecipeForm";

// export const Route = createFileRoute(
//   "/_protected/recipesupdate/add"
// )({
//   component: AddRecipe,
// });

// function AddRecipe() {
//   const navigate = useNavigate();

//   async function handleSubmit(formData: any) {
//     await addRecipe(formData);
//     alert("Recipe added successful");
//     navigate({ to: "/recipes" });
//   }

//   return (
//     <RecipeForm
//       onSubmit={handleSubmit}
//     />
//   );
// }




import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { addRecipe } from "@/api/recipes";
import RecipeForm from "@/components/templates/RecipeForm";

export const Route = createFileRoute(
  "/_protected/recipesupdate/add"
)({
  component: AddRecipe,
});

function AddRecipe() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: addRecipe,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recipes"],
      });

      alert("Recipe added successfully ✅");

      navigate({
        to: "/recipes",
      });
    },

    onError: () => {
      alert("Failed to add recipe");
    },
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Recipe</h2>

      <RecipeForm
        onSubmit={(form) =>
          addMutation.mutate(form)
        }
      />

      {addMutation.isPending && (
        <p>Adding recipe...</p>
      )}
    </div>
  );
}