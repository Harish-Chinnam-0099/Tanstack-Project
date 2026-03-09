import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/recipesupdate/")({
  beforeLoad: () => {
    throw redirect({ to: "/recipes" });
  },
  component: () => null,
});
