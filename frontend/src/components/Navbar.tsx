import { Bell, User } from "lucide-react";
import { useEffect, useState } from "react";

interface UserData {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
}

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";

  return (
    <header
      style={{
        height: "76px",
        width: "100%",
        backgroundColor: "#5b5af7",
        borderBottom: "1px solid #4f4ee0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      {/* LEFT SIDE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            padding: 0,
            fontSize: "18px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1,
          }}
        >
          Email Scheduler
        </h2>
      </div>

      {/* RIGHT SIDE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {/* NOTIFICATION */}
        <button
          type="button"
          aria-label="Notifications"
          style={{
            width: "42px",
            height: "42px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            cursor: "pointer",
            position: "relative",
            padding: 0,
          }}
        >
          <Bell size={21} strokeWidth={1.8} />

          <span
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "7px",
              height: "7px",
              backgroundColor: "#f43f5e",
              borderRadius: "50%",
              border: "2px solid #5b5af7",
            }}
          />
        </button>

        {/* USER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* AVATAR */}
          <div
            style={{
              width: "42px",
              height: "42px",
              minWidth: "42px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.22)",
              border: "1px solid rgba(255, 255, 255, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              color: "#ffffff",
            }}
          >
            {user?.avatarUrl && !imageError ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                onError={() => {
                  setImageError(true);
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <User size={21} strokeWidth={1.8} />
            )}
          </div>

          {/* NAME + EMAIL */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: 0,
            }}
          >
            <strong
              style={{
                margin: 0,
                padding: 0,
                fontSize: "14px",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: "20px",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </strong>

            <span
              style={{
                margin: 0,
                padding: 0,
                fontSize: "12px",
                fontWeight: 400,
                color: "#e0e7ff",
                lineHeight: "18px",
                whiteSpace: "nowrap",
              }}
            >
              {displayEmail}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}