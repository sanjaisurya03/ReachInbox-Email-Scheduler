import {
  ArrowLeft,
  Upload,
  FileText,
  Users,
  Clock,
  Send,
  X,
  UserCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

interface Sender {
  id: string;
  name: string;
  email: string;
}

/* =========================
    EMAIL PARSER
========================= */
function parseEmailFile(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = text.match(emailRegex) || [];
        resolve([...new Set(matches.map((e) => e.toLowerCase().trim()))]);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsText(file);
  });
}

export default function CreateCampaign() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [recipients, setRecipients] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");

  const [startTime, setStartTime] = useState("");
  const [delayMs, setDelayMs] = useState("2000");
  const [hourlyLimit, setHourlyLimit] = useState("200");

  const [senders, setSenders] = useState<Sender[]>([]);
  const [senderId, setSenderId] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingSenders, setLoadingSenders] = useState(true);
  const [error, setError] = useState("");

  /* =========================
      LOAD SENDERS
  ========================= */
  useEffect(() => {
    async function loadSenders() {
      try {
        setLoadingSenders(true);
        const response = await api.get("/senders");
        const data = response.data?.data || [];
        setSenders(data);
        if (data.length > 0) {
          setSenderId(data[0].id);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Unable to load senders");
      } finally {
        setLoadingSenders(false);
      }
    }

    loadSenders();
  }, []);

  /* =========================
      FILE UPLOAD
  ========================= */
  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setFileName(file.name);

    try {
      const parsedEmails = await parseEmailFile(file);
      if (parsedEmails.length === 0) {
        setRecipients([]);
        setError("No valid email addresses found in the uploaded file.");
        return;
      }
      setRecipients(parsedEmails);
    } catch {
      setError("Unable to read the uploaded file.");
      setRecipients([]);
    }
  }

  function removeFile() {
    setFileName("");
    setRecipients([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /* =========================
      SCHEDULE CAMPAIGN
  ========================= */
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Campaign name is required.");
      return;
    }
    if (!subject.trim()) {
      setError("Email subject is required.");
      return;
    }
    if (!body.trim()) {
      setError("Email body is required.");
      return;
    }
    if (!senderId) {
      setError("Please select or create a sender before scheduling.");
      return;
    }
    if (recipients.length === 0) {
      setError("Please upload a CSV or TXT file containing leads.");
      return;
    }
    if (!startTime) {
      setError("Please select a start time.");
      return;
    }

    const scheduledAt = new Date(startTime);
    if (Number.isNaN(scheduledAt.getTime())) {
      setError("Invalid start time.");
      return;
    }
    if (scheduledAt.getTime() <= Date.now()) {
      setError("Start time must be in the future.");
      return;
    }

    setLoading(true);

    try {
      const campaignResponse = await api.post("/campaigns", {
        name: name.trim(),
        subject: subject.trim(),
        body: body.trim(),
        startTime: scheduledAt.toISOString(),
        delayMs: Number(delayMs),
        hourlyLimit: Number(hourlyLimit),
      });

      const campaignId = campaignResponse.data?.data?.id;
      if (!campaignId) {
        throw new Error("Campaign ID was not returned by the server.");
      }

      await api.post(`/campaigns/${campaignId}/emails/bulk`, {
        senderId,
        recipients,
        scheduledAt: scheduledAt.toISOString(),
      });

      navigate(`/campaigns/${campaignId}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to schedule the campaign."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================
      REUSABLE STYLES
  ========================= */
  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "24px 28px",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "14px",
    fontWeight: 700,
    color: "#334155",
    marginBottom: "8px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "48px",
    border: "1px solid #d8dee9",
    borderRadius: "10px",
    padding: "0 14px",
    fontSize: "14px",
    color: "#1e293b",
    outline: "none",
    background: "#ffffff",
    boxSizing: "border-box",
  };

  const helpStyle: React.CSSProperties = {
    display: "block",
    marginTop: "6px",
    fontSize: "12px",
    color: "#94a3b8",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fb" }}>
      <Sidebar />

      {/* Main Area Offset for Sidebar */}
      <div
        style={{
          flex: 1,
          marginLeft: "240px",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar />

        <main style={{ padding: "30px 36px 50px", boxSizing: "border-box" }}>
          <div style={{ maxWidth: "1360px", margin: "0 auto" }}>
            
            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={() => navigate("/campaigns")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                border: "none",
                background: "transparent",
                color: "#64748b",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
                marginBottom: "12px",
              }}
            >
              <ArrowLeft size={16} />
              Back to Campaigns
            </button>

            {/* HEADER */}
            <div style={{ marginBottom: "24px" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Compose New Email
              </h1>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "14px",
                  color: "#64748b",
                }}
              >
                Create and schedule an email campaign for your leads.
              </p>
            </div>

            {/* ERROR ALERT */}
            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* TWO COLUMN GRID */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) 420px",
                  gap: "24px",
                  alignItems: "stretch",
                }}
              >
                {/* LEFT COLUMN */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    minWidth: 0,
                  }}
                >
                  {/* EMAIL CONTENT */}
                  <section style={cardStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "#eeedff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#5b5af7",
                        }}
                      >
                        <Send size={19} />
                      </div>
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#172033",
                          }}
                        >
                          Email Content
                        </h2>
                        <p
                          style={{
                            margin: "3px 0 0",
                            color: "#94a3b8",
                            fontSize: "13px",
                          }}
                        >
                          Write the email that will be sent to your leads.
                        </p>
                      </div>
                    </div>

                    <div style={{ marginBottom: "18px" }}>
                      <label style={labelStyle}>Campaign Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Product Launch"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: "18px" }}>
                      <label style={labelStyle}>Subject</label>
                      <input
                        type="text"
                        placeholder="Enter email subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Email Body</label>
                      <textarea
                        placeholder="Write your email message..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={12}
                        style={{
                          width: "100%",
                          minHeight: "285px",
                          border: "1px solid #d8dee9",
                          borderRadius: "10px",
                          padding: "14px",
                          fontSize: "14px",
                          lineHeight: "1.6",
                          color: "#1e293b",
                          outline: "none",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                          resize: "vertical",
                        }}
                        required
                      />
                    </div>
                  </section>

                  {/* EMAIL LEADS */}
                  <section
                    style={{
                      ...cardStyle,
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "#eeedff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#5b5af7",
                        }}
                      >
                        <Users size={19} />
                      </div>
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#172033",
                          }}
                        >
                          Email Leads
                        </h2>
                        <p
                          style={{
                            margin: "3px 0 0",
                            color: "#94a3b8",
                            fontSize: "13px",
                          }}
                        >
                          Upload a CSV or TXT file containing recipient emails.
                        </p>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: "2px dashed #d2d8e5",
                        borderRadius: "12px",
                        background: "#fafbff",
                        padding: "24px 20px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        textAlign: "center",
                        flex: 1,
                        minHeight: "140px",
                      }}
                    >
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "12px",
                          background: "#eeedff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#5b5af7",
                          marginBottom: "10px",
                        }}
                      >
                        <Upload size={22} />
                      </div>
                      <strong
                        style={{
                          fontSize: "14px",
                          color: "#1e293b",
                          marginBottom: "4px",
                        }}
                      >
                        Click to upload your leads
                      </strong>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                        CSV or TXT files supported
                      </span>
                    </div>

                    {fileName && (
                      <div
                        style={{
                          marginTop: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 14px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            minWidth: 0,
                          }}
                        >
                          <FileText size={18} color="#5b5af7" />
                          <div style={{ minWidth: 0 }}>
                            <strong
                              style={{
                                display: "block",
                                fontSize: "13px",
                                color: "#1e293b",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {fileName}
                            </strong>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>
                              {recipients.length} email
                              {recipients.length !== 1 ? "s" : ""} detected
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={removeFile}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#94a3b8",
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </section>
                </div>

                {/* RIGHT COLUMN */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    minWidth: 0,
                  }}
                >
                  {/* SENDER SELECTION */}
                  <section style={cardStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "18px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "#eeedff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#5b5af7",
                        }}
                      >
                        <UserCheck size={19} />
                      </div>
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#172033",
                          }}
                        >
                          Sender
                        </h2>
                        <p
                          style={{
                            margin: "3px 0 0",
                            color: "#94a3b8",
                            fontSize: "13px",
                          }}
                        >
                          Choose the sending account.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Send From</label>
                      {loadingSenders ? (
                        <div style={{ fontSize: "13px", color: "#64748b" }}>
                          Loading senders...
                        </div>
                      ) : senders.length === 0 ? (
                        <div
                          style={{
                            padding: "14px",
                            background: "#fff7ed",
                            border: "1px solid #ffedd5",
                            borderRadius: "10px",
                            textAlign: "center",
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 10px",
                              fontSize: "13px",
                              color: "#c2410c",
                            }}
                          >
                            No sender account found.
                          </p>
                          <button
                            type="button"
                            onClick={() => navigate("/senders")}
                            style={{
                              padding: "6px 14px",
                              border: "1px solid #fdba74",
                              borderRadius: "8px",
                              background: "#ffffff",
                              color: "#c2410c",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Add Sender
                          </button>
                        </div>
                      ) : (
                        <select
                          value={senderId}
                          onChange={(e) => setSenderId(e.target.value)}
                          style={{ ...inputStyle, cursor: "pointer" }}
                          required
                        >
                          {senders.map((sender) => (
                            <option key={sender.id} value={sender.id}>
                              {sender.name} ({sender.email})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </section>

                  {/* SCHEDULE */}
                  <section style={cardStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "18px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "#fff3df",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#f59e0b",
                        }}
                      >
                        <Clock size={19} />
                      </div>
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#172033",
                          }}
                        >
                          Schedule
                        </h2>
                        <p
                          style={{
                            margin: "3px 0 0",
                            color: "#94a3b8",
                            fontSize: "13px",
                          }}
                        >
                          Configure timing and delivery pacing.
                        </p>
                      </div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={labelStyle}>Start Time</label>
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        style={inputStyle}
                        required
                      />
                      <small style={helpStyle}>
                        First email will begin at this time.
                      </small>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={labelStyle}>Delay Between Emails</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="number"
                          min="0"
                          value={delayMs}
                          onChange={(e) => setDelayMs(e.target.value)}
                          style={{ ...inputStyle, paddingRight: "48px" }}
                          required
                        />
                        <span
                          style={{
                            position: "absolute",
                            right: "14px",
                            top: "14px",
                            fontSize: "13px",
                            color: "#64748b",
                          }}
                        >
                          ms
                        </span>
                      </div>
                      <small style={helpStyle}>
                        Minimum delay between outgoing emails.
                      </small>
                    </div>

                    <div>
                      <label style={labelStyle}>Hourly Email Limit</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="number"
                          min="1"
                          value={hourlyLimit}
                          onChange={(e) => setHourlyLimit(e.target.value)}
                          style={{ ...inputStyle, paddingRight: "64px" }}
                          required
                        />
                        <span
                          style={{
                            position: "absolute",
                            right: "14px",
                            top: "14px",
                            fontSize: "13px",
                            color: "#64748b",
                          }}
                        >
                          / hour
                        </span>
                      </div>
                      <small style={helpStyle}>
                        Max emails allowed per hour.
                      </small>
                    </div>
                  </section>

                  {/* SUMMARY */}
                  <section style={cardStyle}>
                    <h3
                      style={{
                        margin: "0 0 16px",
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#172033",
                      }}
                    >
                      Campaign Summary
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "14px",
                      }}
                    >
                      <span style={{ color: "#64748b" }}>Recipients</span>
                      <strong style={{ color: "#1e293b" }}>
                        {recipients.length}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "14px",
                      }}
                    >
                      <span style={{ color: "#64748b" }}>Delay</span>
                      <strong style={{ color: "#1e293b" }}>{delayMs} ms</strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        fontSize: "14px",
                      }}
                    >
                      <span style={{ color: "#64748b" }}>Hourly Limit</span>
                      <strong style={{ color: "#1e293b" }}>
                        {hourlyLimit}
                      </strong>
                    </div>
                  </section>

                  {/* ACTIONS */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      width: "100%",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => navigate("/campaigns")}
                      disabled={loading}
                      style={{
                        flex: "0 0 100px",
                        height: "48px",
                        border: "1px solid #d7deea",
                        borderRadius: "10px",
                        background: "#ffffff",
                        color: "#475569",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        loading ||
                        loadingSenders ||
                        senders.length === 0
                      }
                      style={{
                        flex: 1,
                        height: "48px",
                        border: "none",
                        borderRadius: "10px",
                        background:
                          loading || loadingSenders || senders.length === 0
                            ? "#a5a6f6"
                            : "#5b5af7",
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        cursor:
                          loading || loadingSenders || senders.length === 0
                            ? "not-allowed"
                            : "pointer",
                        boxShadow: "0 4px 14px rgba(91, 90, 247, 0.25)",
                      }}
                    >
                      <Send size={16} />
                      {loading ? "Scheduling..." : "Schedule Campaign"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}