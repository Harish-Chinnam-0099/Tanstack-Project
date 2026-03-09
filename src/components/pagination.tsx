import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";

export default function Pagination({ totalPages }: { totalPages: number }) {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_protected/recipes" });

  const page = search.page ?? 1;

  const goTo = (newPage: number) => {
    navigate({
      to: "/recipes",
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => goTo(1)}
      >
        First
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => goTo(page - 1)}
      >
        Prev
      </Button>

      <span className="text-sm text-muted-foreground px-2">
        Page {page} / {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => goTo(page + 1)}
      >
        Next
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => goTo(totalPages)}
      >
        Last
      </Button>
    </div>
  );
}
