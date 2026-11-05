# Maison Fréville – infos à demander à la boutique

Tout ce qui suit est déjà prévu dans le site : il suffit de remplir le fichier indiqué.

| # | Info | Où la mettre | Aujourd'hui |
|---|---|---|---|
| 1 | **Nom à mettre en avant** : « Maison Fréville » ou « Les spécialités de Quesnoy-le-Montant » | `components/Logo.tsx`, `data/site.json` | Les deux, Maison Fréville en premier (comme l'enseigne) |
| 2 | **Son histoire et celle du gâteau battu** : relire le bloc « Depuis 1956 » et la page « Le gâteau battu du Vimeu » | `locales/fr.json` → `story`, `pages.battu` | Texte proposé d'après l'article Dicilà de 2022 (fondation 1956 par Charles Fréville, reprise par Francis en 1981, farine du moulin voisin, œufs d'Huppy) |
| 3 | **Produits et prix** : tailles et prix du gâteau battu, mini battu au chèvre, guimauves, coffrets, galettes | `data/produits.json` | Prix de la carte Instagram et des étiquettes de vitrine ; les autres sont « Prix en boutique » |
| 4 | **Délai de commande** | `data/site.json` → `order.leadHours` | 48 h |
| 5 | **Un portable pour WhatsApp** | `data/site.json` → `whatsapp` (format 33612345678) | Vide : le bouton WhatsApp reste caché |
| 6 | **E-mail de la boutique** (pour recevoir les commandes) | Vercel → `ORDER_NOTIFY_EMAIL` + `RESEND_API_KEY` | **Non branché : tant que ce n'est pas fait, le site demande au client d'appeler** |
| 7 | **Carte du salon de thé** (thés, cafés, formules goûter et prix) | `data/produits.json` → `salon` | Vide : texte d'attente « Café, thé et toutes les pâtisseries de la vitrine » |
| 8 | **Allergènes** (fiche par produit si elle existe) | `locales/*.json` → `faq` | Mention générale : gluten, œufs, lait, fruits à coque possibles |
| 9 | **Photos** de la façade avec la nouvelle enseigne (de face, en lumière du jour) et de l'**intérieur du salon** | `assets/a-photographier/`, puis `public/media/salon-de-the/interieur-salon.jpg` | L'intérieur s'affichera tout seul dans le bloc salon dès que le fichier existe (puis `npm run media` pour la taille) |
| 10 | **Logo** en fichier (SVG, PDF ou PNG haute définition) | `components/Logo.tsx`, `app/icon.svg` | Logo typographique + dessin du gâteau battu, créés pour le site |
| 11 | **SIRET**, raison sociale, responsable de publication | `data/site.json` → `legal` | « à compléter » dans les mentions légales |
| 12 | **Jours fériés et congés** (11 novembre, 25 décembre, 1er janvier, vacances) | `data/horaires.json` → `exceptions` | 25/12 et 01/01 fermés par défaut ; le 11 novembre est considéré ouvert |
| 13 | **Créations de saison** : dates exactes (galettes, Pâques, Saint-Patrick, Noël) | `data/saisons.json` | Dates estimées |
| 14 | **Jeux concours** en cours | `data/annonces.json` (bandeau) | Aucun |
| 15 | **Spécialités picardes** vendues à Amiens (macarons d'Amiens, ficelles picardes, bisteu, pâté de canard, cités en 2022) | `data/produits.json` | Non affichées, faute de confirmation |
| 16 | **Nom de domaine** souhaité (ex. maison-freville.fr) | Vercel → Domains | Adresse vercel.app |
