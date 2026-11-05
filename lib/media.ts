import sizes from "@/data/media-sizes.json";

export type Img = { src: string; width: number; height: number };

/** Photo de public/media avec ses dimensions réelles (générées par npm run media). */
export function img(path: string): Img {
  const s = (sizes as Record<string, number[]>)[path];
  if (!s) throw new Error(`Image inconnue : ${path} (lancer npm run media)`);
  return { src: path, width: s[0], height: s[1] };
}
