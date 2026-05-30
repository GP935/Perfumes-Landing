/* ============================================================
   KAĒL Experiencia — Tweaks
   ============================================================ */
const { useEffect } = React;

const EXP_DEFAULTS = /*EDITMODE-BEGIN*/{
  "intensidad": "Intenso",
  "accent": "#c9a86a",
  "grano": true,
  "cursor": true
}/*EDITMODE-END*/;

const EXP_ACCENTS = ["#c9a86a", "#b8763f", "#8a9a7b", "#9d7bb0"];
const MOTION_MAP = { "Sutil": 0.6, "Medio": 1.0, "Intenso": 1.35 };

function ExpApp() {
  const [t, setTweak] = useTweaks(EXP_DEFAULTS);

  useEffect(() => {
    document.documentElement.style.setProperty("--motion", MOTION_MAP[t.intensidad] ?? 1);
  }, [t.intensidad]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  useEffect(() => {
    const g = document.querySelector(".grain");
    if (g) g.style.display = t.grano ? "" : "none";
  }, [t.grano]);

  useEffect(() => {
    const on = t.cursor;
    document.querySelectorAll(".cursor-dot, .cursor-ring").forEach((el) => {
      el.style.display = on ? "" : "none";
    });
    document.body.style.cursor = on ? "" : "auto";
  }, [t.cursor]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Movimiento" />
      <TweakRadio
        label="Intensidad"
        value={t.intensidad}
        options={["Sutil", "Medio", "Intenso"]}
        onChange={(v) => setTweak("intensidad", v)}
      />
      <TweakToggle label="Grano de cine" value={t.grano} onChange={(v) => setTweak("grano", v)} />
      <TweakToggle label="Cursor personalizado" value={t.cursor} onChange={(v) => setTweak("cursor", v)} />

      <TweakSection label="Acento" />
      <TweakColor
        label="Color"
        value={t.accent}
        options={EXP_ACCENTS}
        onChange={(v) => setTweak("accent", v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<ExpApp />);
