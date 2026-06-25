const FONT = '600 13px system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const ROW_HEIGHT = 38;
const BAR_GAP = 14;
const LABEL_WIDTH = 168;
const VALUE_WIDTH = 44;
const PAD = 8;
const LABEL_GAP = 12;
const VALUE_GAP = 8;

const token = (styles, name, fallback) =>
  styles.getPropertyValue(name).trim() || fallback;

const fitLabel = (ctx, text, maxWidth) => {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let clipped = text;
  while (clipped.length > 1 && ctx.measureText(`${clipped}…`).width > maxWidth) {
    clipped = clipped.slice(0, -1);
  }
  return `${clipped}…`;
};

export const barChart = (canvas, items) => {
  const ctx = canvas.getContext("2d");
  const styles = getComputedStyle(document.documentElement);
  const dark = document.documentElement.dataset.theme === "dark";

  const accent = token(styles, "--c-orange", "#fe690c");
  const text = dark
    ? token(styles, "--c-white", "#ffffff")
    : token(styles, "--c-ink", "#111114");
  const track = dark
    ? token(styles, "--c-gray-700", "#34343c")
    : token(styles, "--c-gray-200", "#d6d6dc");

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.parentElement?.clientWidth || 320;
  const height = items.length * ROW_HEIGHT + PAD * 2;

  canvas.style.width = "100%";
  canvas.style.height = `${height}px`;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const chartX = LABEL_WIDTH;
  const chartW = Math.max(1, width - LABEL_WIDTH - VALUE_WIDTH);
  const max = Math.max(1, ...items.map((item) => item.value));

  ctx.font = FONT;
  ctx.textBaseline = "middle";

  items.forEach((item, index) => {
    const y = PAD + index * ROW_HEIGHT;
    const barHeight = ROW_HEIGHT - BAR_GAP;
    const centerY = y + barHeight / 2;
    const barWidth = (item.value / max) * chartW;

    ctx.fillStyle = text;
    ctx.textAlign = "left";
    ctx.fillText(fitLabel(ctx, item.label, LABEL_WIDTH - LABEL_GAP), 0, centerY);

    ctx.fillStyle = track;
    ctx.fillRect(chartX, y, chartW, barHeight);

    ctx.fillStyle = accent;
    ctx.fillRect(chartX, y, barWidth, barHeight);

    ctx.fillStyle = text;
    ctx.fillText(String(item.value), chartX + chartW + VALUE_GAP, centerY);
  });
};
