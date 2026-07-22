export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        gap: "16px",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          letterSpacing: "0.1em",
          color: "var(--accent)",
          fontSize: "12px",
          textTransform: "uppercase",
        }}
      >
        Próximamente
      </span>
      <h1 style={{ fontSize: "48px", margin: 0, fontWeight: 800 }}>BOUNTY</h1>
      <p style={{ color: "var(--text-dim)", maxWidth: "480px", margin: 0 }}>
        El juego social para tus fiestas con amigos: retos, sabotajes y una
        temporada donde alguien siempre paga la cena.
      </p>
      <a
        href="/privacy"
        style={{ color: "var(--text-dim)", fontSize: "14px", marginTop: "32px" }}
      >
        Política de privacidad
      </a>
    </main>
  );
}
