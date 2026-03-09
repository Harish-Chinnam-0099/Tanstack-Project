import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Card,CardContent,CardHeader,CardTitle } from "../ui/card";


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
    // <div style={{ textAlign: "center" }}
    <div className="max-w-md mx-auto p-6"
    suppressHydrationWarning>
      {/* <h1 style={{textAlign:'center',}}>Login</h1> */}
      <Card className="max-w-md mx-auto">
       <CardHeader>
        <CardTitle className="text-center text-2xl">
          Login
        </CardTitle>
       </CardHeader>
      <CardContent>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-6 border p-6 rounded-lg"
      >
        <form.Field
         
          name="username"
          validators={{
            onSubmit: ({ value }) =>
              !value ? "Username is required" : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label>UserName:</Label>
              <Input
                placeholder="emilys"
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value)
                }
              />
              {field.state.meta.errors?.length ? (
                <p className="text-sm text-red-500">
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
            <div className="space-y-2">
             <Label>
              Password:
             </Label>
              <Input
                type="password"
                placeholder="emilyspass"
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value)
                }
              />

              {field.state.meta.errors?.length ? (
                <p className="text-sm text-red-500">
                  {field.state.meta.errors[0]}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>

        <br />

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Logging..." : "Login"}
        </Button>

        {mutation.isError && mutation.error instanceof Error && (
          <p style={{ color: "red" }}>
          {mutation.error.message}
          </p>
        )}
     
      </form>
      </CardContent>
      </Card>
    </div> 
  );
}