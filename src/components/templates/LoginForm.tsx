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
      navigate({ to: "/products" });
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
  console.log(mutation.error)

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
              <input
                placeholder="Username"
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
              <input
                type="password"
                placeholder="Password"
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





// import { useState } from "react"
// import { useMutation } from "@tanstack/react-query"
// import { login } from "@/api/auth"

// export default function LoginForm() {
//   // ---------------- STATE ----------------
//   const [username, setUsername] = useState("")
//   const [password, setPassword] = useState("")

//   // ---------------- MUTATION ----------------
//   const loginMutation = useMutation({
//     mutationFn: login,

//     onSuccess: (data) => {
//       // store token (example)
//       localStorage.setItem("accessToken", data.accessToken)

//       console.log("Login Success:", data)
//     },
//   })

//   // ---------------- SUBMIT ----------------
//   const onSubmit = (e: React.FormEvent) => {
//     e.preventDefault()

//     // ✅ send request even if fields empty
//     loginMutation.mutate({
//       username,
//       password,
//     })
//   }

//   // ---------------- ERROR MESSAGE ----------------
//   const errorMessage =
//     loginMutation.error instanceof Error
//       ? loginMutation.error.message
//       : ""

//   // ---------------- UI ----------------
//   return (
//     <div style={{ textAlign: "center", marginTop: "80px" }}>
//       <h2>Login</h2>

//       <form onSubmit={onSubmit} suppressHydrationWarning>
//         {/* USERNAME */}
//         <input
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//         />

//         <br />
//         <br />

//         {/* PASSWORD */}
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <br />
//         <br />

//         {/* BUTTON */}
//         <button type="submit" disabled={loginMutation.isPending}>
//           {loginMutation.isPending ? "Logging in..." : "Login"}
//         </button>

//         {/* ✅ SERVER ERROR DISPLAY */}
//         {loginMutation.isError && (
//           <p style={{ color: "red", marginTop: "10px" }}>
//             {errorMessage}
//           </p>
//         )}
//       </form>
//     </div>
//   )
// }

