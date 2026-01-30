import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LogIn } from "lucide-react";

// YPI Al Azhar Brand Colors
const colors = {
  primaryBlue: "#0053C5",
  primaryGreen: "#00b060",
  secondaryYellow: "#FECE00",
  gray: "#3d3d3d",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/admin");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Email atau password salah");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 100%)",
        overflow: "hidden",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Login Container */}
      <div
        style={{
          position: "relative",
          width: "450px",
          height: "450px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Animated Circles */}
        <div
          className="circles-wrapper"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            animation: "rotate 20s linear infinite",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`circle circle-${i}`}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "5px solid",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                borderColor:
                  i === 1
                    ? colors.primaryBlue
                    : i === 2
                      ? colors.secondaryYellow
                      : i === 3
                        ? colors.primaryGreen
                        : colors.gray,
                animation: `pulse${i} 3s ease-in-out infinite ${(i - 1) * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Login Box */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            background: "transparent",
            padding: "40px",
            borderRadius: "20px",
            width: "320px",
            textAlign: "center",
          }}
        >
          {/* Logo - Generic Mosque SVG */}
          <div style={{ marginBottom: "1rem" }}>
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ margin: "0 auto", display: "block" }}
            >
              {/* Dome */}
              <path
                d="M50 10 C30 10, 20 35, 20 50 L80 50 C80 35, 70 10, 50 10Z"
                fill={colors.primaryBlue}
              />
              {/* Crescent */}
              <circle cx="50" cy="8" r="5" fill={colors.secondaryYellow} />
              <circle cx="52" cy="8" r="4" fill={colors.primaryBlue} />
              {/* Building */}
              <rect
                x="20"
                y="50"
                width="60"
                height="35"
                fill={colors.primaryBlue}
              />
              {/* Door */}
              <path
                d="M40 85 L40 60 C40 55, 60 55, 60 60 L60 85Z"
                fill="white"
              />
              {/* Windows */}
              <circle cx="30" cy="65" r="5" fill="white" />
              <circle cx="70" cy="65" r="5" fill="white" />
              {/* Minarets */}
              <rect
                x="10"
                y="30"
                width="8"
                height="55"
                fill={colors.primaryGreen}
              />
              <rect
                x="82"
                y="30"
                width="8"
                height="55"
                fill={colors.primaryGreen}
              />
              <circle cx="14" cy="28" r="6" fill={colors.primaryGreen} />
              <circle cx="86" cy="28" r="6" fill={colors.primaryGreen} />
              <circle cx="14" cy="22" r="2" fill={colors.secondaryYellow} />
              <circle cx="86" cy="22" r="2" fill={colors.secondaryYellow} />
            </svg>
          </div>

          <h2
            style={{
              color: colors.primaryBlue,
              marginBottom: "30px",
              fontSize: "28px",
              fontWeight: 600,
            }}
          >
            Login
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div style={{ marginBottom: "20px" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  border: `2px solid ${colors.primaryBlue}`,
                  borderRadius: "25px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  outline: "none",
                  background: "white",
                  boxSizing: "border-box",
                }}
                onFocus={(e) =>
                  (e.target.style.boxShadow = `0 0 0 3px ${colors.primaryBlue}20`)
                }
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: "20px" }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••••"
                required
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  border: `2px solid ${colors.primaryBlue}`,
                  borderRadius: "25px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  outline: "none",
                  background: "white",
                  boxSizing: "border-box",
                }}
                onFocus={(e) =>
                  (e.target.style.boxShadow = `0 0 0 3px ${colors.primaryBlue}20`)
                }
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: "10px 15px",
                  borderRadius: "25px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  fontSize: "13px",
                  marginBottom: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "12px",
                background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.primaryGreen})`,
                border: "none",
                borderRadius: "25px",
                color: "white",
                fontSize: "16px",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 5px 20px ${colors.primaryBlue}50`;
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isLoading ? (
                <>
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>

            {/* Links */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
                fontSize: "13px",
              }}
            >
              <a
                href="/display"
                style={{
                  color: colors.primaryBlue,
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = colors.primaryGreen;
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = colors.primaryBlue;
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                Lihat Display
              </a>
              <a
                href="#"
                style={{
                  color: colors.primaryBlue,
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = colors.primaryGreen;
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = colors.primaryBlue;
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                Bantuan
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse1 {
          0% {
            transform: translate(-50%, -50%) scale(0.95);
            opacity: 0.8;
            border-radius: 45% 55% 48% 52% / 42% 48% 52% 58%;
          }
          25% {
            transform: translate(-50%, -50%) scale(1.02);
            opacity: 0.9;
            border-radius: 58% 42% 55% 45% / 48% 62% 38% 52%;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.05);
            opacity: 1;
            border-radius: 52% 48% 62% 38% / 53% 45% 55% 47%;
          }
          75% {
            transform: translate(-50%, -50%) scale(0.98);
            opacity: 0.9;
            border-radius: 38% 62% 45% 55% / 58% 52% 48% 42%;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.95);
            opacity: 0.8;
            border-radius: 45% 55% 48% 52% / 42% 48% 52% 58%;
          }
        }

        @keyframes pulse2 {
          0% {
            transform: translate(-50%, -50%) scale(0.92) rotate(10deg);
            opacity: 0.8;
            border-radius: 55% 45% 58% 42% / 52% 48% 52% 48%;
          }
          25% {
            transform: translate(-50%, -50%) scale(1.0) rotate(10deg);
            opacity: 0.9;
            border-radius: 42% 58% 45% 55% / 48% 60% 40% 52%;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08) rotate(10deg);
            opacity: 1;
            border-radius: 48% 52% 40% 60% / 55% 45% 55% 45%;
          }
          75% {
            transform: translate(-50%, -50%) scale(1.0) rotate(10deg);
            opacity: 0.9;
            border-radius: 60% 40% 52% 48% / 42% 58% 42% 58%;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.92) rotate(10deg);
            opacity: 0.8;
            border-radius: 55% 45% 58% 42% / 52% 48% 52% 48%;
          }
        }

        @keyframes pulse3 {
          0% {
            transform: translate(-50%, -50%) scale(0.98) rotate(-10deg);
            opacity: 0.8;
            border-radius: 40% 60% 52% 48% / 45% 55% 45% 55%;
          }
          25% {
            transform: translate(-50%, -50%) scale(1.05) rotate(-10deg);
            opacity: 0.9;
            border-radius: 52% 48% 45% 55% / 58% 42% 58% 42%;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.02) rotate(-10deg);
            opacity: 1;
            border-radius: 60% 40% 58% 42% / 52% 48% 52% 48%;
          }
          75% {
            transform: translate(-50%, -50%) scale(0.95) rotate(-10deg);
            opacity: 0.9;
            border-radius: 45% 55% 42% 58% / 40% 60% 40% 60%;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.98) rotate(-10deg);
            opacity: 0.8;
            border-radius: 40% 60% 52% 48% / 45% 55% 45% 55%;
          }
        }

        @keyframes pulse4 {
          0% {
            transform: translate(-50%, -50%) scale(1) rotate(5deg);
            opacity: 0.8;
            border-radius: 48% 52% 55% 45% / 50% 50% 50% 50%;
          }
          25% {
            transform: translate(-50%, -50%) scale(1.08) rotate(5deg);
            opacity: 0.9;
            border-radius: 62% 38% 48% 52% / 45% 55% 45% 55%;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
            opacity: 1;
            border-radius: 50% 50% 38% 62% / 58% 42% 58% 42%;
          }
          75% {
            transform: translate(-50%, -50%) scale(1.05) rotate(5deg);
            opacity: 0.9;
            border-radius: 38% 62% 52% 48% / 52% 48% 52% 48%;
          }
          100% {
            transform: translate(-50%, -50%) scale(1) rotate(5deg);
            opacity: 0.8;
            border-radius: 48% 52% 55% 45% / 50% 50% 50% 50%;
          }
        }
      `}</style>
    </div>
  );
}
