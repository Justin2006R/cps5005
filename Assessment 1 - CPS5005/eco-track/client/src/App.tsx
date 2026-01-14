import { useEffect, useState } from "react";

const API = "http://localhost:3001/api";

const COLORS = {
  bg: "#0b2a1f",        
  header: "#0f3528",    
  panel: "#134234",    
  border: "#2f7d5c",    
  primary: "#6ed3a1",  
  text: "#e6fff4",      
  muted: "#a8d5c2",     
  inputBg: "#0f3528",  
  inputBorder: "#2f7d5c",
  button: "#2f7d5c",
  buttonText: "#e6fff4",
  danger: "#8bdcb5",   
  dangerText: "#0b2a1f"
};

type Appliance = {
  _id: string;
  name: string;
  powerWatts: number;
  isOn: boolean;
};

export default function App() {
  const [token, setToken] = useState<string>(localStorage.getItem("token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [newApplianceName, setNewApplianceName] = useState("");
  const [newApplianceWatts, setNewApplianceWatts] = useState<number>(0);

  const [summary, setSummary] = useState<{ totalKwhLast24h: number; count: number } | null>(null);
  const isLoggedIn = !!token;

  async function api(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  }

  async function register() {
    await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name })
    });
    alert("Registered, press 'login'");
  }

  async function login() {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem("token", data.token);
    setToken(data.token);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setAppliances([]);
    setSummary(null);
  }

  async function loadDashboard() {
    const [apps, sum] = await Promise.all([api("/appliances"), api("/consumption/summary")]);
    setAppliances(apps);
    setSummary(sum);
  }

  async function addAppliance() {
    await api("/appliances", {
      method: "POST",
      body: JSON.stringify({ name: newApplianceName, powerWatts: Number(newApplianceWatts) })
    });
    await loadDashboard();
  }

  async function toggleAppliance(a: Appliance) {
    await api(`/appliances/${a._id}`, {
      method: "PUT",
      body: JSON.stringify({ isOn: !a.isOn })
    });
    await loadDashboard();
  }

  async function log10Mins(a: Appliance) {
    await api("/consumption/log", {
      method: "POST",
      body: JSON.stringify({ applianceId: a._id, minutes: 10 })
    });
    await loadDashboard();
  }

  useEffect(() => {
    if (isLoggedIn) loadDashboard();
    const id = isLoggedIn ? window.setInterval(loadDashboard, 15000) : null;
    return () => {
      if (id) window.clearInterval(id);
    };
  }, [isLoggedIn]);

  const cardStyle: React.CSSProperties = {
    backgroundColor: COLORS.panel,
    border: `1px solid ${COLORS.border}`,
    padding: 16,
    borderRadius: 10
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: COLORS.inputBg,
    color: COLORS.text,
    border: `1px solid ${COLORS.inputBorder}`,
    borderRadius: 8,
    padding: "10px 12px",
    outline: "none"
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: COLORS.button,
    color: COLORS.buttonText,
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        backgroundColor: COLORS.bg,
        color: COLORS.text
      }}
    >

      <header
        style={{
          padding: "22px",
          borderBottom: `2px solid ${COLORS.border}`,
          textAlign: "center",
          backgroundColor: COLORS.header
        }}
      >
        <h1 style={{ margin: 0, color: COLORS.primary }}>Eco Tracker</h1>
        <p style={{ margin: "8px 0 0", color: COLORS.muted }}>
          Monitor your household's item energy consumption.
        </p>
      </header>

      <main style={{ flex: 1, maxWidth: 820, margin: "0 auto", padding: 20, width: "100%" }}>
        {!isLoggedIn ? (
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0, color: COLORS.primary }}>Login / Register</h2>

            <div style={{ display: "grid", gap: 10 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={inputStyle} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                style={inputStyle}
              />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={register} style={buttonStyle}>Register</button>
                <button onClick={login} style={buttonStyle}>Login</button>
              </div>

            </div>
          </div>
        ) : (
          <>
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0, color: COLORS.primary }}>Summary</h2>
              <p style={{ margin: 0 }}>
                Total kwh in the last 24h: <b style={{ color: COLORS.primary }}>{summary?.totalKwhLast24h ?? "..."}</b>
                {"  "} (logs: {summary?.count ?? "..."})
              </p>
              <p style={{ marginTop: 8, color: COLORS.muted }}>
                Refresh every few seconds
              </p>
            </div>

            <div style={{ ...cardStyle, marginTop: 20 }}>
              <h2 style={{ marginTop: 0, color: COLORS.primary }}>Add appliance</h2>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input
                  value={newApplianceName}
                  onChange={(e) => setNewApplianceName(e.target.value)}
                  placeholder="Name (e.g., Kettle)"
                  style={{ ...inputStyle, flex: 1, minWidth: 220 }}
                />
                <input
                  value={newApplianceWatts}
                  onChange={(e) => setNewApplianceWatts(Number(e.target.value))}
                  placeholder="Watts (e.g., 2000)"
                  type="number"
                  style={{ ...inputStyle, width: 170 }}
                />
                <button onClick={addAppliance} style={buttonStyle}>Add</button>
              </div>
            </div>

            <div style={{ ...cardStyle, marginTop: 20 }}>
              <h2 style={{ marginTop: 0, color: COLORS.primary }}>Appliances</h2>
              {appliances.length === 0 ? (
                <p style={{ color: COLORS.muted, margin: 0 }}>No appliances yet.</p>
              ) : (
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {appliances.map((a) => (
                    <li key={a._id} style={{ marginBottom: 12 }}>
                      <b style={{ color: COLORS.primary }}>{a.name}</b>{" "}
                      <span style={{ color: COLORS.muted }}>— {a.powerWatts}W —</span>{" "}
                      <span style={{ color: a.isOn ? COLORS.primary : COLORS.muted }}>
                        {a.isOn ? "ON" : "OFF"}
                      </span>
                      <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button onClick={() => toggleAppliance(a)} style={buttonStyle}>Toggle</button>
                        <button onClick={() => log10Mins(a)} style={buttonStyle}>Log 10 mins</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>

      {isLoggedIn && (
        <footer
          style={{
            padding: 20,
            borderTop: `2px solid ${COLORS.border}`,
            textAlign: "center",
            backgroundColor: COLORS.header
          }}
        >
          <button
            onClick={logout}
            style={{
              backgroundColor: COLORS.danger,
              color: COLORS.dangerText,
              border: "none",
              padding: "10px 18px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 800
            }}
          >
            Logout
          </button>
        </footer>
      )}
    </div>
  );
}
