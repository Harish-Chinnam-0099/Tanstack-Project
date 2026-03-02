import {  useNavigate } from "@tanstack/react-router";

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate({ to: "/" });
  };

  return (
    <div
      style={{
        width: "220px",
        height: "100vh",
        background: "#f3f3f3",
        padding: "20px",
      }}
    >
      <h3>Dashboard</h3>

      <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* <Link to="/recipes">Recipes</Link>
        <Link to="/cuisine">Cuisine</Link>
        <Link to="/tag">Tag</Link>
        <Link to="/meal-type">Meal Type</Link> */}

        <button onClick={logout}>Logout</button>
      </nav>
    </div>
  );
}