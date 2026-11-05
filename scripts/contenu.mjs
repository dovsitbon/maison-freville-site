// Génère CONTENU.md : tous les textes du site en français et en anglais, et la carte, pour validation par la boutique.
//   npm run contenu
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = async (f) => JSON.parse(await readFile(path.join(ROOT, f), "utf8"));
const fr = await read("locales/fr.json");
const en = await read("locales/en.json");
const produits = await read("data/produits.json");
const site = await read("data/site.json");

const euro = (n) => (n === null ? "prix en boutique / sur demande" : `${n.toFixed(2).replace(".", ",")} €`);
const SKIP = new Set(["alt", "products", "pages", "meta"]);
const out = [];
const p = (s = "") => out.push(s);

p("# Maison Fréville – contenu du site (à valider)");
p();
p(`Généré depuis \`locales/fr.json\` et \`locales/en.json\`. Pour modifier un texte, modifiez ces fichiers puis relancez \`npm run contenu\`.`);
p();
p("Points à faire valider en priorité :");
p("- **L'histoire** (bloc « Depuis 1956 » et page « Le gâteau battu du Vimeu ») : rédigée d'après un article Dicilà (juillet 2022) et l'ancien site de la boulangerie Fréville. À relire par la maison.");
p("- **Les tailles et prix du gâteau battu**, le **mini battu au chèvre**, les **guimauves** et le **coffret** : prix non connus, affichés « Prix en boutique ».");
p("- **Le délai de commande** (48 h) et les **créneaux de retrait**.");
p("- **La note Google** : 4,8/5 sur 141 avis, relevée le " + site.rating.checked + " (à mettre à jour dans `data/site.json`).");
p();

p("## Référencement (balises title / description)");
p();
for (const [lang, d] of [["FR", fr], ["EN", en]]) {
  p(`**${lang}** · ${d.meta.title}`);
  p();
  p(`> ${d.meta.description}`);
  p();
}

p("## La carte et les prix");
p();
p(`Relevés le ${produits.checked} sur la carte publiée sur Instagram et les étiquettes de la vitrine.`);
p();
for (const c of produits.categories) {
  p(`### ${fr.categories[c.id]} / ${en.categories[c.id]}`);
  p();
  p("| Produit (FR) | Product (EN) | Prix | Disponibilité |");
  p("|---|---|---|---|");
  for (const id of c.items) {
    const it = produits.items[id];
    p(`| ${fr.products[id].name} | ${en.products[id].name} | ${euro(it.price)} | ${fr.patisserie.availability[it.availability]} |`);
  }
  p();
}

const walk = (a, b, prefix) => {
  for (const k of Object.keys(a)) {
    const key = prefix ? `${prefix}.${k}` : k;
    const va = a[k];
    const vb = b?.[k];
    if (typeof va === "string") {
      p(`- \`${key}\``);
      p(`  - FR : ${va.replace(/\n/g, " ↵ ")}`);
      p(`  - EN : ${(vb ?? "").replace(/\n/g, " ↵ ")}`);
    } else if (Array.isArray(va)) {
      va.forEach((x, i) => (typeof x === "string" ? (p(`- \`${key}[${i}]\``), p(`  - FR : ${x}`), p(`  - EN : ${vb?.[i] ?? ""}`)) : walk(x, vb?.[i], `${key}[${i}]`)));
    } else if (va && typeof va === "object") walk(va, vb, key);
  }
};

p("## Textes de la page d'accueil");
p();
for (const section of Object.keys(fr)) {
  if (SKIP.has(section)) continue;
  p(`### ${section}`);
  p();
  walk(fr[section], en[section], section);
  p();
}

p("## Pages");
p();
for (const id of Object.keys(fr.pages)) {
  p(`### ${fr.pages[id].title} / ${en.pages[id].title}`);
  p();
  walk(fr.pages[id], en.pages[id], `pages.${id}`);
  p();
}

p("## Descriptions des produits");
p();
walk(fr.products, en.products, "products");
p();
p("## Textes alternatifs des photos (accessibilité, Google Images)");
p();
walk(fr.alt, en.alt, "alt");
p();

await writeFile(path.join(ROOT, "CONTENU.md"), out.join("\n"));
console.log("CONTENU.md écrit");
