// Trie les visuels Instagram (assets/raw/) dans assets/<catégorie>/ avec des noms lisibles,
// puis les prépare pour le web dans public/media/<catégorie>/ (next/image sert ensuite AVIF/WebP à la bonne taille).
//   npm run media
//
// Écartées volontairement : 02 (carte des prix : son contenu est repris en HTML dans data/produits.json),
// 05 (présentoir à sucettes, peu lisible), 34, 35 et 36 (collages « avant / après » des travaux, avec texte incrusté).
// La photo de profil (logo.jpg) n'est pas un logo : ce sont des minis gâteaux battus, gardés pour la galerie.
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const raw = (n) => `raw/maison-freville_${n}.jpg`;

// [fichier source (dans assets/), catégorie, nom]
const PICKS = [
  [raw("29_ClUU-H3M4E5"), "hero", "gateau-battu-tranche"],

  [raw("logo"), "gateau-battu", "minis-battus-sortie-du-four"],
  [raw("31_CjliHAPM38q"), "gateau-battu", "minis-battus-sous-cloche"],
  [raw("12_DCtuL8-OUEa"), "gateau-battu", "battu-garni-creme-abricot"],
  [raw("15_DAIs-pKOZ9L"), "gateau-battu", "baba-battu-au-rhum"],

  [raw("01_DLFIT_4Ndcy"), "patisseries", "eclairs-chocolat"],
  [raw("06_DOJE7j7AgfR"), "patisseries", "eclair-chocolat-noisettes"],
  [raw("26_CwQGLSTsmYd"), "patisseries", "eclair-nutella"],
  [raw("07_DOJEt1AgqmQ"), "patisseries", "tartelette-citron-meringuee"],
  [raw("30_Cj-UqKUsawE"), "patisseries", "tartelette-citron-dessus"],
  [raw("08_DLKjWMwIrzw"), "patisseries", "chou-fraises-amandes"],
  [raw("09_DJCD_E6sCsj"), "patisseries", "dome-coco"],
  [raw("16_C_-rQAfo0Ph"), "patisseries", "merveilleux-chocolat"],
  [raw("23_Cw0IYdMs7Bo"), "patisseries", "tarte-fraises"],
  [raw("24_Cw0IVrpsESW"), "patisseries", "tartelettes-fraises-vanille"],
  [raw("25_Cw0ITEFMzaD"), "patisseries", "entremets-fraises"],
  [raw("32_ChdD4qAMcjX"), "patisseries", "entremets-fruits-rouges"],
  [raw("11_DDsIljsOCMw"), "patisseries", "plateau-minis-choux"],
  [raw("28_CoJ0wjCM5Qm"), "patisseries", "coffret-chocolats-maison"],

  [raw("14_DAqK5mRO7t9"), "sale", "tourte-maison"],

  [raw("04_DTC1xLkgmEh"), "saisons", "brioche-des-rois"],
  [raw("13_DBywlLlIZDY"), "saisons", "halloween-cercueil-chocolat"],
  [raw("10_DHODsH4Mn78"), "saisons", "saint-patrick-trefle"],
  [raw("17_C5Lal_zshWC"), "saisons", "paques-oeuf-lapin"],
  [raw("18_C5Lak0lsGXo"), "saisons", "paques-oeufs-ajoures"],
  [raw("19_C5Laja1MveN"), "saisons", "paques-oeuf-papillons"],
  [raw("20_C5LaZBOMoQG"), "saisons", "paques-mouton-chocolat"],
  [raw("21_C5LaWrOM_T5"), "saisons", "paques-vache-chocolat"],
  [raw("22_C5LaULpsCYa"), "saisons", "paques-poule-chocolat"],

  [raw("03_DapBLotCh2L"), "salon-de-the", "chevalet-salon-de-the"],
  [raw("33_CfJBrnSMq8T"), "salon-de-the", "equipe-devant-la-boutique"],
  [raw("27_Ct2JzgWpv20_video-cover"), "salon-de-the", "facade-enseigne"],
  [raw("37_CegkK_OI7-d"), "salon-de-the", "facade-arches"],
];

const sizes = {};
for (const [src, cat, name] of PICKS) {
  const file = path.join(ROOT, "assets", src);
  await mkdir(path.join(ROOT, "assets", cat), { recursive: true });
  await mkdir(path.join(ROOT, "public/media", cat), { recursive: true });
  await copyFile(file, path.join(ROOT, "assets", cat, `${name}.jpg`));
  const max = cat === "hero" ? 2000 : 1600;
  const info = await sharp(file)
    .rotate()
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(ROOT, "public/media", cat, `${name}.jpg`));
  sizes[`/media/${cat}/${name}.jpg`] = [info.width, info.height];
}
// Emplacements prévus pour les photos à prendre sur place (intérieur du salon de thé, vitrine)
await mkdir(path.join(ROOT, "assets/galerie"), { recursive: true });
await mkdir(path.join(ROOT, "assets/a-photographier"), { recursive: true });

// Image de partage (Open Graph) 1200 × 630 : le gâteau battu tranché, sur fond crème
const hero = path.join(ROOT, "assets", raw("29_ClUU-H3M4E5"));
const cake = await sharp(hero).rotate().resize({ height: 630 }).toBuffer();
const meta = await sharp(cake).metadata();
const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="700" height="630">
  <text x="70" y="250" font-family="Georgia, serif" font-size="46" letter-spacing="9" fill="#2E241C">MAISON FRÉVILLE</text>
  <rect x="70" y="282" width="80" height="1.5" fill="#9A6A36"/>
  <text x="70" y="330" font-family="Georgia, serif" font-style="italic" font-size="27" fill="#6E4A22">Les spécialités de Quesnoy-le-Montant</text>
  <text x="70" y="400" font-family="Arial, sans-serif" font-size="19" letter-spacing="3" fill="#4A3D33">LE VRAI GÂTEAU BATTU DU VIMEU</text>
  <text x="70" y="432" font-family="Arial, sans-serif" font-size="19" letter-spacing="3" fill="#4A3D33">PÂTISSERIE · SALON DE THÉ · AMIENS</text>
</svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#FAF5EC" } })
  .composite([
    { input: cake, left: 1200 - meta.width, top: 0 },
    { input: text, left: 0, top: 0 },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(ROOT, "public/og.jpg"));

await writeFile(path.join(ROOT, "data/media-sizes.json"), JSON.stringify(sizes, null, 1) + "\n");
console.log(`${PICKS.length} images prêtes`);
