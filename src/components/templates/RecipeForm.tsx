import { useForm } from "@tanstack/react-form";
import { Recipe } from "#/types";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Separator } from "#/components/ui/separator";

type Props = {
  initialData?: Partial<Recipe>;
  onSubmit: (data: Partial<Recipe>) => void;
  isPending?: boolean;
};

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const CUISINES = [
  "American", "Asian", "Brazilian", "Cocktail", "Greek",
  "Hawaiian", "Indian", "Italian", "Japanese", "Korean",
  "Lebanese", "Mediterranean", "Mexican", "Moroccan",
  "Pakistani", "Russian", "Smoothie", "Spanish", "Thai",
  "Turkish", "Vietnamese",
];

function FieldError({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return <p className="text-sm text-destructive mt-1">{errors[0]}</p>;
}

export default function RecipeForm({ initialData, onSubmit, isPending }: Props) {
  const isEdit = !!initialData?.id;

  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      cuisine: initialData?.cuisine ?? "",
      difficulty: initialData?.difficulty ?? "Easy",
      prepTimeMinutes: initialData?.prepTimeMinutes ?? 0,
      cookTimeMinutes: initialData?.cookTimeMinutes ?? 0,
      servings: initialData?.servings ?? 1,
      image: initialData?.image ?? "",
      ingredients: initialData?.ingredients?.join("\n") ?? "",
      instructions: initialData?.instructions?.join("\n") ?? "",
      mealType: initialData?.mealType ?? ([] as string[]),
      tags: initialData?.tags?.join(", ") ?? "",
    },

    onSubmit: ({ value }) => {
      onSubmit({
        name: value.name,
        cuisine: value.cuisine,
        difficulty: value.difficulty,
        prepTimeMinutes: Number(value.prepTimeMinutes),
        cookTimeMinutes: Number(value.cookTimeMinutes),
        servings: Number(value.servings),
        image: value.image,
        ingredients: value.ingredients
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        instructions: value.instructions
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        mealType: value.mealType,
        tags: value.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
    },
  });

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {isEdit ? "Edit Recipe" : "Add New Recipe"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Basic Info
            </h3>

            {/* Name */}
            <form.Field
              name="name"
              validators={{
                onSubmit: ({ value }) =>
                  !value.trim() ? "Recipe name is required" : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-1">
                  <Label>Recipe Name</Label>
                  <Input
                    placeholder="e.g. Spaghetti Carbonara"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors as string[]} />
                </div>
              )}
            </form.Field>

            {/* Cuisine */}
            <form.Field
              name="cuisine"
              validators={{
                onSubmit: ({ value }) =>
                  !value ? "Cuisine is required" : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-1">
                  <Label>Cuisine</Label>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  >
                    <option value="">Select cuisine...</option>
                    {CUISINES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <FieldError errors={field.state.meta.errors as string[]} />
                </div>
              )}
            </form.Field>

            {/* Difficulty */}
            <form.Field name="difficulty">
              {(field) => (
                <div className="space-y-1">
                  <Label>Difficulty</Label>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            </form.Field>

            {/* Image URL */}
            <form.Field name="image">
              {(field) => (
                <div className="space-y-1">
                  <Label>Image URL</Label>
                  <Input
                    placeholder="https://..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <Separator />

          {/* Time & Servings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Time & Servings
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <form.Field
                name="prepTimeMinutes"
                validators={{
                  onSubmit: ({ value }) =>
                    Number(value) < 0 ? "Must be 0 or more" : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-1">
                    <Label>Prep Time (min)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as any)}
                    />
                    <FieldError errors={field.state.meta.errors as string[]} />
                  </div>
                )}
              </form.Field>

              <form.Field
                name="cookTimeMinutes"
                validators={{
                  onSubmit: ({ value }) =>
                    Number(value) < 0 ? "Must be 0 or more" : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-1">
                    <Label>Cook Time (min)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as any)}
                    />
                    <FieldError errors={field.state.meta.errors as string[]} />
                  </div>
                )}
              </form.Field>

              <form.Field
                name="servings"
                validators={{
                  onSubmit: ({ value }) =>
                    Number(value) < 1 ? "Must be at least 1" : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-1">
                    <Label>Servings</Label>
                    <Input
                      type="number"
                      min={1}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as any)}
                    />
                    <FieldError errors={field.state.meta.errors as string[]} />
                  </div>
                )}
              </form.Field>
            </div>
          </div>

          <Separator />

          {/* Ingredients & Instructions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Ingredients & Instructions
            </h3>

            <form.Field
              name="ingredients"
              validators={{
                onSubmit: ({ value }) =>
                  !value.trim() ? "At least one ingredient is required" : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-1">
                  <Label>Ingredients</Label>
                  <p className="text-xs text-muted-foreground">One ingredient per line</p>
                  <Textarea
                    rows={5}
                    placeholder={"2 cups flour\n1 tsp salt\n3 eggs"}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors as string[]} />
                </div>
              )}
            </form.Field>

            <form.Field
              name="instructions"
              validators={{
                onSubmit: ({ value }) =>
                  !value.trim() ? "At least one instruction step is required" : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-1">
                  <Label>Instructions</Label>
                  <p className="text-xs text-muted-foreground">One step per line</p>
                  <Textarea
                    rows={6}
                    placeholder={"Mix dry ingredients.\nAdd eggs and stir.\nBake at 350°F for 30 minutes."}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors as string[]} />
                </div>
              )}
            </form.Field>
          </div>

          <Separator />

          {/* Meal Type & Tags */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Meal Type & Tags
            </h3>

            <form.Field name="mealType">
              {(field) => (
                <div className="space-y-2">
                  <Label>Meal Type</Label>
                  <div className="flex flex-wrap gap-3">
                    {MEAL_TYPES.map((type) => {
                      const checked = field.state.value.includes(type);
                      return (
                        <label
                          key={type}
                          className="flex items-center gap-2 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-input"
                            checked={checked}
                            onChange={() => {
                              const next = checked
                                ? field.state.value.filter((t) => t !== type)
                                : [...field.state.value, type];
                              field.handleChange(next);
                            }}
                          />
                          {type}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name="tags">
              {(field) => (
                <div className="space-y-1">
                  <Label>Tags</Label>
                  <p className="text-xs text-muted-foreground">Comma-separated</p>
                  <Input
                    placeholder="e.g. Pasta, Comfort Food, Quick"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending
                ? isEdit ? "Updating..." : "Adding..."
                : isEdit ? "Update Recipe" : "Add Recipe"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
