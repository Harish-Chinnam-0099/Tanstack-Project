// import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

// export const Route = createFileRoute("/_protected")({
//   beforeLoad: () => {
//     if(typeof window==="undefined"){
//         return;
//     }
//     const token = localStorage.getItem("token");
//     if (!token) {
//       throw redirect({
//         to: "/",
//       });
//     }
//   },

//   component: ProtectedLayout,
// });

// function ProtectedLayout() {
//   return (
//     <div>
//       <h2>Protected Layout</h2>
//       <Outlet/>
//     </div>
//   );
// }

import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider,SidebarTrigger } from "#/components/ui/sidebar";
import Sidebar from "#/components/Sidebar";

export const Route = createFileRoute("/_protected")({
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // redirect if not logged in
    if (!token) {
      navigate({ to: "/" });
    }

  }, []);

  return (
    <SidebarProvider>
      <Sidebar />
      <div className="flex flex-col flex-1 min-h-screen">
        <header className="h-14 flex items-center border-b px-4">
          <SidebarTrigger />
          <h1 className="ml-4 font-semibold">Dashboard</h1>
        </header>
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}