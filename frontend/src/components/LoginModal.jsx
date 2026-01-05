import { useState } from "react";

function LoginModal({ onClose, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Default credentials
  const ADMIN_USERNAME = "waled";
  const ADMIN_PASSWORD = "Cars4Gloucester$$";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Simulate authentication delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check credentials
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        onLoginSuccess();
        setUsername("");
        setPassword("");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const styles = {
    backdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modal: {
      background: "var(--surface)",
      borderRadius: "12px",
      padding: "2rem",
      width: "100%",
      maxWidth: "400px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      border: "1px solid var(--border)",
    },
    header: {
      marginBottom: "1.5rem",
      textAlign: "center",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "600",
      color: "var(--text)",
      margin: 0,
      marginBottom: "0.5rem",
    },
    subtitle: {
      fontSize: "0.9rem",
      color: "var(--text-secondary)",
      margin: 0,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.4rem",
    },
    label: {
      fontSize: "0.8rem",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "var(--text)",
    },
    input: {
      padding: "0.7rem 0.9rem",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      fontSize: "0.9rem",
      background: "var(--surface-soft)",
      color: "var(--text)",
      fontFamily: "inherit",
      transition: "border-color 0.2s",
    },
    error: {
      backgroundColor: "rgba(220, 38, 38, 0.1)",
      border: "1px solid rgba(220, 38, 38, 0.3)",
      color: "#dc2626",
      padding: "0.75rem",
      borderRadius: "6px",
      fontSize: "0.85rem",
      marginBottom: "0.5rem",
    },
    actions: {
      display: "flex",
      gap: "0.8rem",
      marginTop: "1.5rem",
    },
    btnPrimary: {
      flex: 1,
      padding: "0.7rem 1rem",
      background: "var(--primary)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "0.9rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    btnSecondary: {
      flex: 1,
      padding: "0.7rem 1rem",
      background: "var(--surface-soft)",
      color: "var(--text)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      fontSize: "0.9rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    helpText: {
      fontSize: "0.75rem",
      color: "var(--text-secondary)",
      marginTop: "1rem",
      padding: "0.75rem",
      background: "var(--surface-soft)",
      borderRadius: "6px",
      border: "1px dashed var(--border)",
    },
  };

  return (
    <div style={styles.backdrop} onClick={handleBackdropClick}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Admin Login</h2>
          <p style={styles.subtitle}>Enter your credentials to access the admin panel</p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              id="username"
              type="text"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={isLoading}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              required
            />
          </div>

          <div style={styles.actions}>
            <button
              type="submit"
              style={styles.btnPrimary}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.opacity = "0.9";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "1";
              }}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={() => onClose()}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = "var(--border)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "var(--surface-soft)";
              }}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default LoginModal;
