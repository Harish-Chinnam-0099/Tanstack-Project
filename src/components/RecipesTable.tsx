import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useSearch, useNavigate } from "@tanstack/react-router";

import { getRecipes, deleteRecipe } from "../api/recipes";
import { Recipe, RecipeSearchParams } from "#/types";
import Pagination from "./pagination";
import { queryKeys } from "@/lib/queryKeys";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "#/components/ui/table";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "#/components/ui/alert-dialog";

const CUISINES = [
  "American", "Asian", "Brazilian", "Cocktail", "Greek",
  "Hawaiian", "Indian", "Italian", "Japanese", "Korean",
  "Lebanese", "Mediterranean", "Mexican", "Moroccan",
  "Pakistani", "Russian", "Smoothie", "Spanish", "Thai",
  "Turkish", "Vietnamese",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const SORT_OPTIONS = [
  { label: "Rating: Low to High", value: "asc" },
  { label: "Rating: High to Low", value: "desc" },
];

const PAGE_SIZES = [5, 10, 20];

export default function RecipesTable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const search = useSearch({
    from: "/_protected/recipes",
  }) as RecipeSearchParams;

  const limit = Number(search.limit ?? 5);

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.recipes(search),
    queryFn: () => getRecipes(search),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecipe,

    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["recipes"] });

      const previous = queryClient.getQueriesData({ queryKey: ["recipes"] });

      queryClient.setQueriesData(
        { queryKey: ["recipes"] },
        (old: any) =>
          old
            ? {
                ...old,
                data: old.data.filter((r: Recipe) => r.id !== id),
              }
            : old
      );

      return { previous };
    },

    onError: (_err, _id, ctx) => {
      ctx?.previous.forEach(([key, val]: any) =>
        queryClient.setQueryData(key, val)
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });

  const columns: ColumnDef<Recipe>[] = [
    { header: "ID", accessorKey: "id" },
    { header: "Name", accessorKey: "name" },
    { header: "Cuisine", accessorKey: "cuisine" },
    {
      header: "Meal Type",
      cell: (info) => info.row.original.mealType.join(", "),
    },
    { header: "Difficulty", accessorKey: "difficulty" },
    { header: "Rating", accessorKey: "rating" },
    {
      header: "Actions",
      cell: (info) => {
        const id = info.row.original.id;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                navigate({
                  to: "/recipesupdate/$id",
                  params: { id: id.toString() },
                })
              }
            >
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-foreground">
                      {info.row.original.name}
                    </span>
                    ? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate(id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  const setSearch = (updates: Partial<RecipeSearchParams>) =>
    navigate({
      to: "/recipes",
      search: (prev) => ({ ...prev, ...updates, page: 1 }),
    });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <Input
          className="max-w-xs"
          placeholder="Search recipes..."
          defaultValue={search.search ?? ""}
          onChange={(e) =>
            setSearch({ search: e.target.value || undefined })
          }
        />

        {/* Sort by Rating */}
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={search.order ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            navigate({
              to: "/recipes",
              search: (prev) => ({
                ...prev,
                page: 1,
                sort: val ? "rating" : undefined,
                order:
                  val === "asc" || val === "desc"
                    ? (val as "asc" | "desc")
                    : undefined,
              }),
            });
          }}
        >
          <option value="">Sort by Rating</option>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Cuisine Filter */}
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={search.cuisine ?? ""}
          onChange={(e) =>
            setSearch({ cuisine: e.target.value || undefined })
          }
        >
          <option value="">All Cuisines</option>
          {CUISINES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={search.difficulty ?? ""}
          onChange={(e) =>
            setSearch({ difficulty: e.target.value || undefined })
          }
        >
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Rows per page */}
        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          value={limit}
          onChange={(e) =>
            navigate({
              to: "/recipes",
              search: (prev) => ({
                ...prev,
                page: 1,
                limit: Number(e.target.value),
              }),
            })
          }
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      {isFetching && (
        <p className="text-sm text-muted-foreground">Updating...</p>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination totalPages={totalPages} />
    </div>
  );
}
