"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

/* ─── Particle canvas ─────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 55;
    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      a: Math.random() * 0.5 + 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196,148,255,${d.a})`;
        ctx.fill();
      });

      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(168,85,247,${0.18 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

/* ─── Divider ─────────────────────────────────── */
function OrDivider() {
  return (
    <div style={styles.dividerRow}>
      <div style={styles.dividerLine} />
      <span style={styles.dividerText}>or</span>
      <div style={styles.dividerLine} />
    </div>
  );
}

/* ─── Animated icon ───────────────────────────── */
function QuizIcon() {
  return (
    <div style={styles.iconWrap}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <text x="14" y="19" textAnchor="middle" fontSize="16" fill="white" fontWeight="700">?</text>
      </svg>
    </div>
  );
}

/* ─── Button component ────────────────────────── */
function QuizBtn({ children, variant = "outline", onClick, href }) {
  const [hov, setHov] = useState(false);
  const [active, setActive] = useState(false);

  const base = {
    width: "100%",
    padding: "15px 0",
    borderRadius: "14px",
    fontSize: "1rem",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, background 0.2s ease",
    border: "none",
    letterSpacing: "0.3px",
    transform: active ? "scale(0.97)" : hov ? "translateY(-3px) scale(1.02)" : "scale(1)",
  };

  const variants = {
    primary: {
      background: hov
        ? "linear-gradient(135deg,#6d28d9,#8b21f5,#c026d3)"
        : "linear-gradient(135deg,#7c3aed,#9333ea,#a855f7)",
      color: "white",
      boxShadow: hov
        ? "0 12px 40px rgba(124,58,237,0.65)"
        : "0 4px 20px rgba(124,58,237,0.45)",
    },
    outline: {
      background: hov ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.05)",
      color: "white",
      boxShadow: hov ? "0 8px 30px rgba(0,0,0,0.25)" : "none",
      border: "1px solid rgba(255,255,255,0.18)",
    },
    ghost: {
      background: "transparent",
      color: "rgba(255,255,255,0.7)",
      boxShadow: "none",
      fontSize: "0.9rem",
      border: "none",
    },
  };

  const merged = { ...base, ...variants[variant] };

  const inner = (
    <button
      style={merged}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      {children}
    </button>
  );

  return href ? <Link href={href} style={{ width: "100%", display: "block" }}>{inner}</Link> : inner;
}

/* ─── Main page ───────────────────────────────── */
export default function Quiz() {
  const [auth, setAuth] = useState(false);
  const [mounted, setMounted] = useState(false);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    setMounted(true);
    axios
      .get("http://localhost:3001")
      .then((res) => {
        if (res.data.status === "success") {
          setAuth(true);
        } else {
          setAuth(false);
          window.location.href = "/loginquiz";
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleLogout = () => {
    axios
      .get("http://localhost:3001/logout")
      .then(() => location.reload(true))
      .catch((err) => console.log(err));
  };

  return (
    <>
      <style>{globalStyles}</style>

      {/* Animated gradient background */}
      <div style={styles.bg} />
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <ParticleCanvas />

      {/* Card */}
      <div style={{ ...styles.card, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)" }}>

        {/* Badge row */}
        <div style={styles.badgeRow}>
          <QuizIcon />
          <span style={styles.badge}>CHALLENGE YOUR MIND</span>
        </div>

        {/* Title */}
        <div style={styles.titleBlock}>
          <h1 style={styles.titleTop}>Welcome to</h1>
          <h1 style={styles.titleBottom}>Quiz Game</h1>
        </div>

        {/* Subtitle */}
        <p style={styles.subtitle}>Test your knowledge. Beat your score.</p>

        {/* Decorative line */}
        <div style={styles.accentLine}>
          <div style={styles.accentLineFill} />
        </div>

        {/* Buttons */}
        <div style={styles.btnGroup}>
          <QuizBtn href="/quizgame" variant="primary">
            Get Started
          </QuizBtn>

          <OrDivider />

          <QuizBtn href="/signup" variant="outline">
            Create Account
          </QuizBtn>

          {auth ? (
            <QuizBtn variant="outline" onClick={handleLogout}>
              Sign Out
            </QuizBtn>
          ) : (
            <QuizBtn href="/loginquiz" variant="outline">
              Sign In
            </QuizBtn>
          )}
        </div>

        {/* Footer */}
        <p style={styles.terms}>
          By continuing, you agree to our{" "}
          <span style={styles.termsLink}>Terms of Service</span>
        </p>

        {/* Down arrow */}
        <button style={styles.arrowBtn} aria-label="Scroll down">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 9l5 5 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </>
  );
}

/* ─── Styles ──────────────────────────────────── */
const styles = {
  bg: {
    position: "fixed",
    inset: 0,
    background: "linear-gradient(135deg,#0f0520 0%,#1e0845 35%,#3b0f72 65%,#5a1590 100%)",
    backgroundSize: "400% 400%",
    animation: "bgShift 12s ease infinite",
    zIndex: -2,
  },
  orb1: {
    position: "fixed",
    top: "-150px",
    left: "-150px",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "#7c3aed",
    filter: "blur(90px)",
    opacity: 0.22,
    animation: "orbFloat1 10s ease-in-out infinite",
    zIndex: -1,
    pointerEvents: "none",
  },
  orb2: {
    position: "fixed",
    bottom: "-100px",
    right: "-100px",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "#a855f7",
    filter: "blur(80px)",
    opacity: 0.2,
    animation: "orbFloat2 13s ease-in-out infinite",
    zIndex: -1,
    pointerEvents: "none",
  },
  orb3: {
    position: "fixed",
    top: "40%",
    left: "55%",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    background: "#6d28d9",
    filter: "blur(70px)",
    opacity: 0.15,
    animation: "orbFloat1 16s ease-in-out infinite reverse",
    zIndex: -1,
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    zIndex: 1,
    background: "rgba(30,8,69,0.55)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    width: "min(88%, 460px)",
    borderRadius: "28px",
    padding: "44px 36px 32px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "auto",
    minHeight: "min-content",
    transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "24px",
  },
  iconWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "linear-gradient(135deg,#7c3aed,#a855f7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 20px rgba(124,58,237,0.5)",
    flexShrink: 0,
  },
  badge: {
    fontSize: "0.72rem",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "500",
    letterSpacing: "2.5px",
    color: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "30px",
    padding: "5px 14px",
    background: "rgba(255,255,255,0.05)",
  },
  titleBlock: {
    textAlign: "center",
    marginBottom: "10px",
  },
  titleTop: {
    margin: 0,
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(1.7rem, 5vw, 2.3rem)",
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 1.2,
    letterSpacing: "-0.5px",
  },
  titleBottom: {
    margin: 0,
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(1.7rem, 5vw, 2.3rem)",
    fontWeight: "800",
    lineHeight: 1.2,
    letterSpacing: "-0.5px",
    background: "linear-gradient(90deg,#c084fc 0%,#a855f7 50%,#7c3aed 100%)",
    backgroundSize: "200% auto",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
    animation: "shimmer 4s linear infinite",
  },
  subtitle: {
    margin: "0 0 20px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    fontWeight: "300",
    letterSpacing: "0.3px",
  },
  accentLine: {
    width: "100%",
    height: "1px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "2px",
    marginBottom: "24px",
    overflow: "hidden",
    position: "relative",
  },
  accentLineFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: "40%",
    background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.6),transparent)",
    animation: "lineSweep 3s ease-in-out infinite",
  },
  btnGroup: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    margin: "2px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255,255,255,0.1)",
  },
  dividerText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.82rem",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: "1px",
  },
  terms: {
    marginTop: "20px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.25)",
    textAlign: "center",
    lineHeight: 1.5,
  },
  termsLink: {
    color: "rgba(168,85,247,0.7)",
    cursor: "pointer",
    textDecoration: "underline",
    textDecorationColor: "rgba(168,85,247,0.3)",
  },
  arrowBtn: {
    marginTop: "16px",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    animation: "arrowBounce 2s ease-in-out infinite",
    transition: "background 0.2s",
  },
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-x: hidden;
    background: #0f0520;
  }
  @keyframes bgShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes orbFloat1 {
    0%, 100% { transform: translate(0,0); }
    50%       { transform: translate(40px,-40px); }
  }
  @keyframes orbFloat2 {
    0%, 100% { transform: translate(0,0); }
    50%       { transform: translate(-30px,30px); }
  }
  @keyframes shimmer {
    0%   { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
  @keyframes lineSweep {
    0%   { left: -40%; }
    100% { left: 140%; }
  }
  @keyframes arrowBounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(5px); }
  }
`;