/**
 * Coerce an LLM text response into parsed JSON. Models occasionally wrap JSON
 * in ```code fences``` or add prose around it, so we extract the outermost
 * object/array before parsing. Throws on unrecoverable output.
 */
export function parseJsonResponse(content: string): unknown {
  const trimmed = content.trim();

  // Fast path: already valid JSON.
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through to extraction
  }

  const withoutFences = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  const start = withoutFences.search(/[[{]/);
  const lastObj = withoutFences.lastIndexOf("}");
  const lastArr = withoutFences.lastIndexOf("]");
  const end = Math.max(lastObj, lastArr);

  if (start === -1 || end === -1 || end < start) {
    throw new Error("Réponse IA illisible (JSON introuvable).");
  }

  return JSON.parse(withoutFences.slice(start, end + 1));
}
