import { useEffect, useRef } from "react";
import { colors, songs, symbols } from "./data.js";
import CreativeChoice from "./CreativeChoice.jsx";
export { default as SketchPad } from "./SketchPad.jsx";

export function Flower() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M20 5v12" transform={`rotate(${i * 45} 20 20)`} />
      ))}
    </svg>
  );
}

const iconPaths = {
  arrow: "M5 12h14m-6-6 6 6-6 6",
  chevron: "m9 5 7 7-7 7",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12M6 18 18 6",
  lock: "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3",
  people:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  clock: "M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
  messages: "M14 9V4H2v11h4l4 4v-4h4V9Zm3-1h5v11h-4l-4 3v-4",
  signpost: "M12 3v19M4 5h13l4 4-4 4H4z",
  sprout:
    "M12 22v-8m0 4C4 18 2 11 3 6c6 0 10 4 9 12Zm0-4c0-7 4-11 10-12 0 7-4 12-10 12",
  pause: "M8 5v14M16 5v14",
  play: "m8 4 12 8-12 8z",
  reset: "M3 10a9 9 0 1 1 1 8M3 4v6h6",
  exit: "M9 4H3v16h6m6-12 4 4-4 4M8 12h12",
  copy: "M9 9h12v12H9zM5 15H3V3h12v2",
  sparkles:
    "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4",
  music:
    "M9 18V5l12-2v13M9 8l12-2M9 18a3 3 0 1 1-3-3c1.66 0 3 1.34 3 3Zm12-2a3 3 0 1 1-3-3c1.66 0 3 1.34 3 3Z",
  layers: "m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5",
  coffee:
    "M3 4h14v10a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V4Zm14 1h2a3 3 0 1 1 0 6h-2M2 22h17",
  shuffle:
    "M3 5h3c4 0 8 14 12 14h3m-4-4 4 4-4 4M3 19h3c4 0 8-14 12-14h3m-4-4 4 4-4 4",
  wind: "M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h5a3 3 0 1 1-3 3",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  info: "M12 11v6m0-10h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  pencil: "m16 3 5 5-13 13H3v-5L16 3ZM13 6l5 5",
  leaf: "M20 3C6 1 2 9 6 15s15 4 14-12ZM4 21l11-12",
  shield: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4Zm-4 10 3 3 5-6",
};
export function Icon({ name, size = 20, className = "", ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d={iconPaths[name] || iconPaths.sparkles} />
    </svg>
  );
}
export function Brand({ onClick }) {
  return (
    <button
      className="brand"
      onClick={onClick}
      aria-label="Two Perspectives home"
    >
      <span className="brand-mark">
        <i />
        <i />
      </span>
      <span>
        two perspectives<span className="brand-dot">.</span>
      </span>
    </button>
  );
}
export function HeroArt() {
  return (
    <div
      className="hero-art"
      aria-label="Two different shapes looking at each other, with a shared space between them"
      role="img"
    >
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <span className="art-small-star star-one">
        <Flower />
      </span>
      <span className="art-small-star star-two">✧</span>
      <div className="art-note note-one">
        <span className="note-dot lavender" /> I see it this way.
      </div>
      <svg
        className="faces"
        viewBox="0 0 530 450"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="grain"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r=".6" fill="#293526" opacity=".05" />
          </pattern>
        </defs>
        <path
          d="M120 80C62 103 51 164 68 217c12 39 8 57-6 94-18 49 8 78 62 83 52 5 113-5 137-51 22-44 1-88-1-128-2-37 17-74-9-105-30-36-86-47-131-30Z"
          fill="#C5D0B5"
        />
        <path
          d="M120 80C62 103 51 164 68 217c12 39 8 57-6 94-18 49 8 78 62 83 52 5 113-5 137-51 22-44 1-88-1-128-2-37 17-74-9-105-30-36-86-47-131-30Z"
          fill="url(#grain)"
        />
        <path
          d="M354 69c-56-5-93 25-99 80-3 25 0 43-15 58l-21 21c-7 8-3 16 10 19l23 6c3 48-9 89 22 117 28 26 99 20 137-9 33-24 37-60 31-103-6-42-1-56 3-86 9-62-33-98-91-103Z"
          fill="#EBC0A7"
        />
        <path
          d="M354 69c-56-5-93 25-99 80-3 25 0 43-15 58l-21 21c-7 8-3 16 10 19l23 6c3 48-9 89 22 117 28 26 99 20 137-9 33-24 37-60 31-103-6-42-1-56 3-86 9-62-33-98-91-103Z"
          fill="url(#grain)"
        />
        <path
          d="M186 156c20-9 32-4 36 2m-20 13v12m105-25c16-9 27-6 34-1m-21 13v12"
          stroke="#404336"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M194 260c14 10 29 8 39-2m56-2c11 8 22 6 30-2"
          stroke="#404336"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <ellipse cx="176" cy="225" rx="17" ry="9" fill="#ACBA9A" opacity=".6" />
        <ellipse
          cx="347"
          cy="226"
          rx="17"
          ry="9"
          fill="#DDA48C"
          opacity=".55"
        />
        <path
          d="M130 334c-8-28-8-54-1-78m3 29-17-9m14 29 19-17"
          stroke="#7D9169"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="m377 112 5 13 14 1-11 9 3 14-11-8-12 8 4-14-11-9 14-1 5-13Z"
          stroke="#B3836F"
          strokeWidth="1.2"
        />
        <path
          d="M232 110c7-13 20-22 35-24"
          stroke="#F8F7F3"
          strokeWidth="2"
          strokeDasharray="4 6"
          strokeLinecap="round"
        />
      </svg>
      <div className="art-note note-two">
        Oh, I hadn’t thought of that. <span className="note-dot peach" />
      </div>
      <div className="art-caption">
        <span className="caption-line" /> Different views. A little more
        understanding.
      </div>
    </div>
  );
}
export function Modal({ title, children, onClose, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-inner">
        <button
          className="icon-button modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
export function Avatar({ index, small = false }) {
  return (
    <span
      className={`avatar avatar-${index} ${small ? "small" : ""}`}
      aria-hidden="true"
    >
      {index === 0 ? "a" : "b"}
      <span>·</span>
    </span>
  );
}
export function ChoiceDisplay({ response, compact = false }) {
  if (!response) return null;
  const option = (
    response.mode === "color"
      ? colors
      : response.mode === "symbol"
        ? symbols
        : songs
  ).find((c) => c.value === response.choice);
  return (
    <div className={`choice-display ${compact ? "compact" : ""}`}>
      {response.mode === "sketch" ? (
        <img
          src={response.drawing}
          className="sketch-preview"
          alt="Participant's abstract sketch"
        />
      ) : response.mode === "color" ? (
        <span
          className="display-swatch"
          style={{ background: response.choice }}
        />
      ) : response.mode === "symbol" ? (
        <span className="display-symbol">{response.choice}</span>
      ) : (
        <span className="song-bubble">
          <Icon name="music" size={22} />
        </span>
      )}
      <span>
        {response.mode === "sketch"
          ? "An original sketch"
          : response.choiceLabel ||
            option?.label ||
            response.choice ||
            "Not chosen"}
      </span>
    </div>
  );
}
export const ExpressionPicker = CreativeChoice;
