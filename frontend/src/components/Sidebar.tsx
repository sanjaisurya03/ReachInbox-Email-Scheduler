import {
  LayoutDashboard,
  Mail,
  Send,
  LogOut,
  Plus,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">R</div>
        <span>ReachInbox</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <LayoutDashboard size={19} />
          Dashboard
        </NavLink>

        <NavLink
          to="/campaigns"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Mail size={19} />
          Campaigns
        </NavLink>

        <NavLink
          to="/senders"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Send size={19} />
          Senders
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <button
          className="new-campaign-button"
          onClick={() => navigate("/campaigns/create")}
        >
          <Plus size={18} />
          New Campaign
        </button>

        <button className="logout-button" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}