import { useState } from "react";
import { Recipe } from "#/types";

type Props = {
  initialData?: Partial<Recipe>;
  onSubmit: (data: Partial<Recipe>) => void;
};

export default function RecipeForm({
  initialData,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<Partial<Recipe>>(
    initialData || {}
  );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <input
        name="name"
        placeholder="Name"
        value={form.name || ""}
        onChange={handleChange}
      />

      <input
        name="cuisine"
        placeholder="Cuisine"
        value={form.cuisine || ""}
        onChange={handleChange}
      />

      <input
        name="difficulty"
        placeholder="Difficulty"
        value={form.difficulty || ""}
        onChange={handleChange}
      />

      <input
        name="rating"
        type="number"
        value={form.rating || ""}
        onChange={handleChange}
      />

      <button type="submit">
        {initialData ? "Update" : "Add"}
      </button>
    </form>
  );
}