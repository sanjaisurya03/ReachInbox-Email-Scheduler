import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (!token || !userParam) {
      navigate("/login?error=google_auth_failed", {
        replace: true,
      });
      return;
    }

    try {
      const user = JSON.parse(userParam);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Google callback error:",
        error
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login?error=google_auth_failed", {
        replace: true,
      });
    }
  }, [navigate, searchParams]);

  return (
    <div className="google-callback-page">
      <div className="google-callback-card">
        <div className="google-loader"></div>

        <h2>Signing you in...</h2>

        <p>
          Completing Google authentication. Please wait.
        </p>
      </div>
    </div>
  );
}