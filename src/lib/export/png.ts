import { toPng } from "html-to-image";

const SKIP_CLASSES = [
  "react-flow__minimap",
  "react-flow__controls",
  "react-flow__panel",
  "react-flow__attribution",
];

/** Render a DOM element (the canvas preview) to a downloaded PNG. */
export async function exportElementToPng(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: "#080d1a",
    pixelRatio: 2,
    filter: (node) => {
      if (!(node instanceof Element)) return true;
      return !SKIP_CLASSES.some((c) => node.classList?.contains(c));
    },
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
