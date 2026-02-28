// import { createFileRoute } from '@tanstack/react-router'
// import { useEffect } from 'react'

// export const Route = createFileRoute('/')({
//   component: Home,
// })

// const baseurl = import.meta.env.VITE_BASE_URL

// function Home() {
//   useEffect(() => {
//     async function getData() {
//       const res = await fetch(`${baseurl}/products`)
//       const data = await res.json()
//       console.log(data)
//     }

//     getData()
//   }, [])

//   return <div>Home Page</div>
// }


import { createFileRoute } from "@tanstack/react-router";
import LoginForm from "../components/templates/LoginForm";

export const Route = createFileRoute("/")({
  component: Login,
});

function Login() {
  return <LoginForm />;
}