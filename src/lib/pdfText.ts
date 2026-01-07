import * as pdfjsLib from "pdfjs-dist";

// Vite-friendly worker setup
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export async function extractPdfTextFromFile(file: File, maxChars = 12000) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let text = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((it: any) => (typeof it.str === "string" ? it.str : ""))
      .join(" ");

    if (pageText.trim()) text += pageText + "\n";
    if (text.length >= maxChars) break;
  }

  if (!text.trim()) return "";
  return text.length > maxChars ? text.slice(0, maxChars) + "\n\n[Truncated]" : text;
}
