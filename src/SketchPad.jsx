import { useEffect, useRef } from "react";

export default function SketchPad({
  value = "",
  onChange,
  width = 600,
  height = 260,
}) {
  const ref = useRef(null);
  const drawing = useRef(false);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let disposed = false;
    ctx.clearRect(0, 0, width, height);
    if (value) {
      const image = new Image();
      image.onload = () => {
        if (!disposed) ctx.drawImage(image, 0, 0, width, height);
      };
      image.src = value;
    }
    return () => {
      disposed = true;
    };
  }, [value, width, height]);

  function point(event) {
    const rect = ref.current.getBoundingClientRect();
    return [
      ((event.clientX - rect.left) * width) / rect.width,
      ((event.clientY - rect.top) * height) / rect.height,
    ];
  }
  function start(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    drawing.current = true;
    ref.current.setPointerCapture(event.pointerId);
    const ctx = ref.current.getContext("2d");
    const [x, y] = point(event);
    ctx.strokeStyle = ctx.fillStyle = "#75628F";
    ctx.lineWidth = 4;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function move(event) {
    if (!drawing.current) return;
    const ctx = ref.current.getContext("2d");
    ctx.lineTo(...point(event));
    ctx.stroke();
  }
  function finish() {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(ref.current.toDataURL("image/png"));
  }
  function clear() {
    drawing.current = false;
    ref.current.getContext("2d").clearRect(0, 0, width, height);
    onChange("");
  }
  return (
    <div className="sketch-pad">
      <canvas
        ref={ref}
        width={width}
        height={height}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={finish}
        onLostPointerCapture={finish}
        aria-label="Draw an image or symbol using a mouse, pen, or touch. Keyboard users can choose a preset symbol instead."
      />
      <div className="sketch-footer">
        <span>A shape, a squiggle, anything.</span>
        <button type="button" className="text-button" onClick={clear}>
          Clear drawing
        </button>
      </div>
      <p className="field-hint">
        Prefer a keyboard? Choose a preset symbol for an equally expressive
        option.
      </p>
      {value && (
        <img
          className="drawing-preview"
          src={value}
          alt="Your current sketch preview"
        />
      )}
    </div>
  );
}
