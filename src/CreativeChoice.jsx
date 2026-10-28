import { useEffect } from "react";
import { symbols } from "./data.js";
import { useCreativeCatalog } from "./CreativeCatalog.jsx";
import SketchPad from "./SketchPad.jsx";

export default function CreativeChoice({ response, setResponse }) {
  const { resources, load } = useCreativeCatalog();
  const kind =
    response.mode === "color"
      ? "colors"
      : response.mode === "song"
        ? "songs"
        : null;
  const resource = kind ? resources[kind] : null;
  useEffect(() => {
    if (kind) load(kind);
  }, [kind, load]);

  function mode(next) {
    setResponse({
      ...response,
      mode: next,
      choice: "",
      drawing: "",
      choiceLabel: "",
      choiceSource: "",
    });
  }
  function choose(item) {
    setResponse({
      ...response,
      choice: item.value,
      choiceLabel: item.label,
      choiceSource: item.source || "Preset symbol",
    });
  }
  let items = resource?.items || symbols;
  // Refreshes or an API failure must not silently discard an existing choice.
  if (
    response.choice &&
    !items.some((item) => item.value === response.choice)
  ) {
    items = [
      {
        value: response.choice,
        label: response.choiceLabel || response.choice,
        source: response.choiceSource,
      },
      ...items,
    ];
  }
  const imageMode = response.mode === "symbol" || response.mode === "sketch";
  return (
    <fieldset className="expression-picker">
      <legend>What represents where you are right now?</legend>
      <div className="mode-tabs" aria-label="Expression type">
        <button
          type="button"
          aria-pressed={response.mode === "color"}
          className={response.mode === "color" ? "selected" : ""}
          onClick={() => {
            if (response.mode !== "color") mode("color");
          }}
        >
          A color
        </button>
        <button
          type="button"
          aria-pressed={imageMode}
          className={imageMode ? "selected" : ""}
          onClick={() => {
            if (!imageMode) mode("symbol");
          }}
        >
          Image or Symbol
        </button>
        <button
          type="button"
          aria-pressed={response.mode === "song"}
          className={response.mode === "song" ? "selected" : ""}
          onClick={() => {
            if (response.mode !== "song") mode("song");
          }}
        >
          A song
        </button>
      </div>
      {imageMode && (
        <div
          className="image-mode-options"
          aria-label="Image or symbol options"
        >
          <button
            type="button"
            className="text-button"
            aria-pressed={response.mode === "symbol"}
            onClick={() => {
              if (response.mode !== "symbol") mode("symbol");
            }}
          >
            Choose a symbol
          </button>
          <button
            type="button"
            className="text-button"
            aria-pressed={response.mode === "sketch"}
            onClick={() => {
              if (response.mode !== "sketch") mode("sketch");
            }}
          >
            Draw your own
          </button>
        </div>
      )}
      {resource && (
        <div className={`catalog-status catalog-${resource.status}`}>
          <p role="status" aria-live="polite">
            {resource.status === "loading" || resource.status === "idle"
              ? `Loading ${kind === "colors" ? "a ColorMind palette" : "songs from Apple or iTunes"}… You can use these presets now.`
              : resource.status === "live"
                ? kind === "colors"
                  ? "Fresh palette from ColorMind."
                  : resource.items[0]?.source === "iTunes song suggestions"
                    ? "Song suggestions from iTunes. These are search results, not a popularity chart."
                    : "Popular songs from Apple’s public chart. Titles only; no audio is played."
                : kind === "colors"
                  ? "ColorMind is unavailable. Using a preset palette."
                  : "Live song services are unavailable. Showing preset songs; these are not current chart results."}
          </p>
          <button
            type="button"
            className="text-button"
            disabled={
              resource.status === "loading" || resource.status === "idle"
            }
            onClick={() => load(kind, true)}
          >
            {resource.status === "live" ? "Refresh choices" : "Try again"}
          </button>
        </div>
      )}
      {response.mode === "sketch" ? (
        <SketchPad
          value={response.drawing}
          onChange={(drawing) =>
            setResponse({
              ...response,
              drawing,
              choiceLabel: "An original sketch",
              choiceSource: "Your sketch",
            })
          }
        />
      ) : (
        <div
          className={`expression-options ${response.mode}-options`}
          role="group"
          aria-label={
            response.mode === "song"
              ? "Choose a song title"
              : `Choose a ${response.mode}`
          }
        >
          {items.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={response.choice === item.value}
              className={`expression-option ${response.choice === item.value ? "chosen" : ""}`}
              onClick={() => choose(item)}
            >
              {response.mode === "color" ? (
                <span
                  className="color-option"
                  style={{ background: item.value }}
                >
                  {response.choice === item.value && (
                    <span aria-hidden="true">✓</span>
                  )}
                </span>
              ) : response.mode === "symbol" ? (
                <span className="symbol-option">{item.value}</span>
              ) : (
                <span className="song-note" aria-hidden="true">
                  ♫
                </span>
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
      <p className="field-hint">No right meaning. Make it your own.</p>
    </fieldset>
  );
}
