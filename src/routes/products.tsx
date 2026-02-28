import {  createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute('/products')({
  component: Products,
})
const baseurl=import.meta.env.VITE_BASE_URL
function Products() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const res = await fetch(`${baseurl}/recipes`)
      return res.json()
    },
  })

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Error occurred</p>

  return (
    <div>
        <h1>Login Successful</h1>
      {data.recipes.map((item: any) => (
        <div key={item.name}>
            {item.name}: {item.cuisine}</div>
      ))}
    </div>
  )
}