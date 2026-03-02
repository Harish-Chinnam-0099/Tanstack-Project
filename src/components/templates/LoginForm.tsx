import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { login } from "../../api/auth";
import { setAuth } from "../../store/authStore";
import type { LoginInput } from "../../types";

export default function LoginForm() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: LoginInput) => login(data),
    onSuccess: (data) => {
      setAuth(data);
      navigate({ to: "/recipes" });
    },
  });

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },

    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });
//   console.log(mutation.error)

  return (
    <div style={{ textAlign: "center" }}
    suppressHydrationWarning>
      <h2>Login</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field
         
          name="username"
          validators={{
            onSubmit: ({ value }) =>
              !value ? "Username is required" : undefined,
          }}
        >
          {(field) => (
            <div>
              <label>
                Username :
              </label>
              <input
                placeholder="emilys"
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value)
                }
              />
              {field.state.meta.errors?.length ? (
                <p style={{ color: "red" }}>
                  {field.state.meta.errors[0]}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>

        <br />
        <form.Field
          name="password"
          validators={{
            onSubmit: ({ value }) =>
              !value ? "Password is required" : undefined,
          }}
        >
          {(field) => (
            <div>
              <label>
                Password :
              </label>
              <input
                type="password"
                placeholder="emilyspass"
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value)
                }
              />

              {field.state.meta.errors?.length ? (
                <p style={{ color: "red" }}>
                  {field.state.meta.errors[0]}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>

        <br />

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Logging..." : "Login"}
        </button>

        {mutation.isError && mutation.error instanceof Error && (
          <p style={{ color: "red" }}>
          {mutation.error.message}
          </p>
        )}
      </form>
    </div> 
  );
}

