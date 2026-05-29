/* ============================================================
   KAĒL — Tweaks app
   Applies aesthetic directions onto the page via CSS variables.
   ============================================================ */
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "ambiance": "Marbre",
  "accent": "oklch(0.70 0.075 75)",
  "display": "Cormorant Garamond",
  "grain": true
}/*EDITMODE-END*/;

const ACCENTS = [
  "oklch(0.70 0.075 75)",   /* or antique */
  "oklch(0.70 0.075 35)",   /* ambre rosé */
  "oklch(0.70 0.075 150)",  /* sauge */
  "oklch(0.66 0.075 320)"   /* prune */
];

const DISPLAY_FONTS = ["Cormorant Garamond", "Playfair Display", "Spectral"];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.body.classList.toggle("theme-noir", t.ambiance === "Noir");
  }, [t.ambiance]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--font-display",
      `"${t.display}", Georgia, serif`
    );
  }, [t.display]);

  useEffect(() => {
    document.querySelectorAll(".hero__grain").forEach((g) => {
      g.style.display = t.grain ? "" : "none";
    });
  }, [t.grain]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Ambiance" />
      <TweakRadio
        label="Atmosphère"
        value={t.ambiance}
        options={["Marbre", "Noir"]}
        onChange={(v) => setTweak("ambiance", v)}
      />
      <TweakToggle
        label="Grain cinéma"
        value={t.grain}
        onChange={(v) => setTweak("grain", v)}
      />

      <TweakSection label="Accent" />
      <TweakColor
        label="Couleur"
        value={t.accent}
        options={ACCENTS}
        onChange={(v) => setTweak("accent", v)}
      />

      <TweakSection label="Typographie" />
      <TweakSelect
        label="Titre"
        value={t.display}
        options={DISPLAY_FONTS}
        onChange={(v) => setTweak("display", v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);
