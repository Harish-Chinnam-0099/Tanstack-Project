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
    <div style={{display:'flex'}}>
      <Sidebar/>
      <div style={{padding:'20px',flex:1}}>
      <Outlet />
      </div>
    </div>
  );
}