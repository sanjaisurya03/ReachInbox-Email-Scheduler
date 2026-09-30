import {
  Plus,
  Send,
  Mail,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Senders() {
  const [senders, setSenders] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSenders() {
    try {
      const response = await api.get("/senders");
      setSenders(response.data.data || []);
    } catch {
      setSenders([]);
    }
  }

  useEffect(() => {
    loadSenders();
  }, []);

  function handleCancel() {
    setShowForm(false);
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/senders", {
        name,
        email,
        smtpHost,
        smtpPort: Number(smtpPort),
        smtpUser,
        smtpPass,
      });

      setName("");
      setEmail("");
      setSmtpHost("");
      setSmtpPort("587");
      setSmtpUser("");
      setSmtpPass("");

      setShowForm(false);
      loadSenders();
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Unable to create sender"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-layout" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      {/* Main content shifted right to accommodate fixed sidebar */}
      <main className="main-area" style={{ flex: 1, marginLeft: "240px", minWidth: 0 }}>
        <Navbar />

        <div className="page-content" style={{ padding: "30px 36px 50px" }}>
          <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "26px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>Senders</h1>
              <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b" }}>Manage your email sending accounts</p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => setShowForm(!showForm)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#6366f1",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "10px 18px",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <Plus size={18} />
              Add Sender
            </button>
          </div>

          {showForm && (
            <div className="section-card form-card" style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "28px", marginBottom: "26px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 700, color: "#172033" }}>Add Sender</h2>

              {error && (
                <div className="error-box" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px", marginBottom: "24px" }}>
                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sender name"
                      required
                      style={{ width: "100%", height: "46px", border: "1px solid #d8dee9", borderRadius: "9px", padding: "0 14px", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sender@example.com"
                      required
                      style={{ width: "100%", height: "46px", border: "1px solid #d8dee9", borderRadius: "9px", padding: "0 14px", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>SMTP Host</label>
                    <input
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.example.com"
                      required
                      style={{ width: "100%", height: "46px", border: "1px solid #d8dee9", borderRadius: "9px", padding: "0 14px", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>SMTP Port</label>
                    <input
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      required
                      style={{ width: "100%", height: "46px", border: "1px solid #d8dee9", borderRadius: "9px", padding: "0 14px", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>SMTP Username</label>
                    <input
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="username"
                      required
                      style={{ width: "100%", height: "46px", border: "1px solid #d8dee9", borderRadius: "9px", padding: "0 14px", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>SMTP Password</label>
                    <input
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ width: "100%", height: "46px", border: "1px solid #d8dee9", borderRadius: "9px", padding: "0 14px", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleCancel}
                    disabled={loading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      height: "44px",
                      padding: "0 18px",
                      border: "1px solid #d7deea",
                      borderRadius: "10px",
                      background: "#ffffff",
                      color: "#475569",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={loading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      height: "44px",
                      padding: "0 22px",
                      border: "none",
                      borderRadius: "10px",
                      background: loading ? "#a5a6f6" : "#6366f1",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(99, 102, 241, 0.25)",
                    }}
                  >
                    {loading ? "Adding..." : "Add Sender"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="sender-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {senders.length === 0 ? (
              <div className="section-card empty-state" style={{ gridColumn: "1 / -1", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
                <Send size={42} style={{ margin: "0 auto 14px", color: "#94a3b8" }} />
                <h3 style={{ margin: "0 0 6px", fontSize: "17px", color: "#1e293b", fontWeight: 700 }}>No senders configured</h3>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  Add an SMTP sender to start sending emails.
                </p>
              </div>
            ) : (
              senders.map((sender) => (
                <div
                  className="sender-card"
                  key={sender.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px",
                    padding: "20px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    position: "relative",
                  }}
                >
                  <div
                    className="sender-icon"
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "#eeedff",
                      color: "#6366f1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={20} />
                  </div>

                  <div className="sender-details" style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {sender.name}
                    </h3>
                    <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {sender.email}
                    </p>
                    <span style={{ fontSize: "12px", color: "#94a3b8", display: "inline-block" }}>
                      {sender.smtpHost}:{sender.smtpPort}
                    </span>
                  </div>

                  <div
                    className="sender-status"
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#16a34a",
                      background: "#f0fdf4",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      alignSelf: "flex-start",
                    }}
                  >
                    Connected
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}