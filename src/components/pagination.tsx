import {
  useNavigate,
  useSearch,
} from "@tanstack/react-router";

export default function Pagination({
  totalPages,
}: {
  totalPages: number;
}) {

  const navigate = useNavigate();

  const search = useSearch({
    from: "/_protected/recipes",
  });

  const page = search.page ?? 1;
  const limit = search.limit ?? 5;

  const update = (newPage: number, newLimit = limit) => {
    navigate({
      to: "/recipes", 
      search: () => ({
        page: newPage,
        limit: newLimit,
      }),
    });
  };

  return (
    <div>
      <select
      suppressHydrationWarning
        value={limit}
        onChange={(e) =>
          update(1, Number(e.target.value))
        }
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
      </select>

      <button onClick={() => update(1)}>First</button>

      <button
        disabled={page === 1}
        onClick={() => update(page - 1)}
      >
        Prev
      </button>

      <span>
        Page {page} / {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => update(page + 1)}
      >
        Next
      </button>

      <button onClick={() => update(totalPages)}>
        Last
      </button>
    </div>
  );
}
