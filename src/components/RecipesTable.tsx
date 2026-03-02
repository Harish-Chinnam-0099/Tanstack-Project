// import {useReactTable,getCoreRowModel,flexRender,ColumnDef} from "@tanstack/react-table";
// import { useQuery ,useQueryClient} from "@tanstack/react-query";
// import { useSearch, useNavigate} from "@tanstack/react-router";

// import { getRecipes ,deleteRecipe} from "../api/recipes";
// import { Recipe, RecipeSearchParams } from "#/types";
// import Pagination from "./pagination";


// export default function RecipesTable() {
//   const navigate = useNavigate({
//     from: "/recipes",
//   });

//     const queryClient=useQueryClient();

//   const search = useSearch({
//     from: "/_protected/recipes",
//   }) as RecipeSearchParams;

//   const limit = Number(search.limit ?? 5);

//   const { data, isFetching } = useQuery({
//     queryKey: ["recipes", search],
//     queryFn: () => getRecipes(search),
//     placeholderData: (prev) => prev,
//   });

//     async function handleDelete(id: number) {
//     await deleteRecipe(id);

//     // Refetch without blocking page
//     queryClient.invalidateQueries({ queryKey: ["recipes"] });
//   }

//   const columns: ColumnDef<Recipe>[] = [
//     { header: "ID", accessorKey: "id" },
//     { header: "Name", accessorKey: "name" },
//     { header: "Cuisine", accessorKey: "cuisine" },
//     {
//       header: "Meal Type",
//       cell: (info) => info.row.original.mealType.join(", "),
//     },
//     { header: "Difficulty", accessorKey: "difficulty" },
//      { header: "Rating", accessorKey: "rating" },
//      {
//       header: "Actions",
//       cell: (info) => {
//         const id = info.row.original.id;

//         return (
//           <>
//             <button
//               onClick={() =>
//                 navigate({
//                   to: "/recipesupdate/$id",
//                   params: { id: id.toString() },
//                 })
//               }
//             >
//               Edit
//             </button>

//             <button
//               onClick={() => handleDelete(id)}
//               style={{ marginLeft: "8px" }}
//             >
//               Delete
//             </button>
//           </>
//         );
//       },
//     },
//   ];

//   const table = useReactTable({
//     data: data?.data ?? [],
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//   });

//   const totalPages = Math.ceil((data?.total ?? 0) / limit);

//   return (
//     <>
//       <select
//       suppressHydrationWarning
//         value={search.order ?? ""}
//          onChange={(e) =>
//        navigate({
//         search: (prev) => ({
//            ...prev,
//            page: 1,
//            sort: "rating",
//            order:
//             e.target.value === "asc" || e.target.value === "desc"
//             ? (e.target.value as "asc" | "desc")
//              : undefined,
//            }),
//          })
//        }
//       >
//         <option value="">None</option>
//         <option value="asc">Low to High</option>
//         <option value="desc">High to Low</option>
//       </select>

//       {/* Search */}
//       <input
//         placeholder="Search..."
//         defaultValue={search.search}
//         onChange={(e) =>
//           navigate({
//             search: (prev) => ({
//               ...prev,
//               page: 1,
//               search: e.target.value || undefined,
//             }),
//           })
//         }
//       />

//       {/* Limit */}
//       <select
//         value={limit}
//         onChange={(e) =>
//           navigate({
//             search: (prev) => ({
//               ...prev,
//               page: 1,
//               limit: Number(e.target.value),
//             }),
//           })
//         }
//       >
//         <option value={5}>5</option>
//         <option value={10}>10</option>
//         <option value={20}>20</option>
//       </select>

//       {/* Cuisine Filter */}
//       <select
//         value={search.cuisine ?? ""}
//         onChange={(e) =>
//           navigate({
//             search: (prev) => ({
//               ...prev,
//               page: 1,
//               cuisine: e.target.value || undefined,
//             }),
//           })
//         }
//       >
//         <option value="">All Cuisines</option>
//         <option value="Italian">Italian</option>
//         <option value="Indian">Indian</option>
//         <option value="Chinese">Chinese</option>
//         <option value="Mexican">Mexican</option>
//       </select>

//       {/* Difficulty Filter */}
//       <select
//         value={search.difficulty ?? ""}
//         onChange={(e) =>
//           navigate({
//             search: (prev) => ({
//               ...prev,
//               page: 1,
//               difficulty: e.target.value || undefined,
//             }),
//           })
//         }
//       >
//         <option value="">All Difficulty</option>
//         <option value="Easy">Easy</option>
//         <option value="Medium">Medium</option>
//         <option value="Hard">Hard</option>
//       </select>

//       {/* Loading Indicator (Non-blocking) */}
//       {isFetching && <p>Updating...</p>}

//       {/* Table */}
//       <table border={1} cellPadding={8}>
//         <thead>
//           {table.getHeaderGroups().map((hg) => (
//             <tr key={hg.id}>
//               {hg.headers.map((header) => (
//                 <th key={header.id}>
//                   {flexRender(
//                     header.column.columnDef.header,
//                     header.getContext()
//                   )}
//                 </th>
//               ))}
//             </tr>
//           ))}
//         </thead>

//         <tbody>
//           {table.getRowModel().rows.map((row) => (
//             <tr key={row.id}>
//               {row.getVisibleCells().map((cell) => (
//                 <td key={cell.id}>
//                   {flexRender(
//                     cell.column.columnDef.cell,
//                     cell.getContext()
//                   )}
//                 </td>
//               ))}
//             </tr>
//           ))}

//         </tbody>
//       </table>

//       <Pagination totalPages={totalPages} />
//     </>
//   );
// }



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

export default function RecipesTable() {
  const navigate = useNavigate({ from: "/recipes" });
  const queryClient = useQueryClient();

  const search = useSearch({
    from: "/_protected/recipes",
  }) as RecipeSearchParams;

  const limit = Number(search.limit ?? 5);

  /* ✅ QUERY (NOW USING CENTRAL KEYS) */
  const { data, isFetching } = useQuery({
    queryKey: queryKeys.recipes(search),
    queryFn: () => getRecipes(search),
    placeholderData: (prev) => prev,
  });

  /* ✅ OPTIMISTIC DELETE */
  const deleteMutation = useMutation({
    mutationFn: deleteRecipe,

    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["recipes"] });

      const previous =
        queryClient.getQueriesData({ queryKey: ["recipes"] });

      queryClient.setQueriesData(
        { queryKey: ["recipes"] },
        (old: any) =>
          old
            ? {
                ...old,
                data: old.data.filter(
                  (r: Recipe) => r.id !== id
                ),
              }
            : old
      );

      return { previous };
    },

    onError: (_err, _id, ctx) => {
      ctx?.previous.forEach(([key, data]: any) =>
        queryClient.setQueryData(key, data)
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["recipes"],
      });
    },
  });

  /* ---------- TABLE COLUMNS ---------- */
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
          <>
            <button
              onClick={() =>
                navigate({
                  to: "/recipesupdate/$id",
                  params: { id: id.toString() },
                })
              }
            >
              Edit
            </button>

            <button
              onClick={() => deleteMutation.mutate(id)}
              style={{ marginLeft: "8px" }}
            >
              Delete
            </button>
          </>
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

  return (
    <>
      {/* ✅ SORT (UNCHANGED) */}
      <select
        value={search.order ?? ""}
        onChange={(e) =>
          navigate({
            search: (prev) => ({
              ...prev,
              page: 1,
              sort: "rating",
              order:
                e.target.value === "asc" ||
                e.target.value === "desc"
                  ? (e.target.value as "asc" | "desc")
                  : undefined,
            }),
          })
        }
      >
        <option value="">None</option>
        <option value="asc">Low to High</option>
        <option value="desc">High to Low</option>
      </select>

      {/* ✅ SEARCH (UNCHANGED) */}
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

      {/* ✅ LIMIT */}
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

      {/* ✅ CUISINE FILTER */}
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

      {/* ✅ DIFFICULTY FILTER */}
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

      {isFetching && <p>Updating...</p>}

      {/* TABLE */}
      <table border={1} cellPadding={8}>
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination totalPages={totalPages} />
    </>
  );
}