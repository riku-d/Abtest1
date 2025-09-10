import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const nav = useNavigate();
  return (
    <header className="header">
      <div className="brand" style={{cursor:'pointer'}} onClick={() => nav("/")}>
        My Courses
      </div>

      <div className="right">
        <Link to="/analytics" style={{ textDecoration: "none", color: "#333", marginRight: 8 }}>
          Analytics
        </Link>

      </div>
    </header>
  );
}
