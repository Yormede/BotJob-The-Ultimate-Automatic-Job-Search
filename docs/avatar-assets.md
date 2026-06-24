---
title: BotJob - Avatar assets pipeline
date: 2026-06-11
tags:
  - BotJob
  - assets
  - avatars
  - performance
status: draft
---

# Avatar Assets Pipeline

BotJob V1 utilise une galerie interne d'avatars. L'utilisateur ne peut pas importer son propre fichier depuis l'interface. Il choisit seulement parmi les avatars disponibles.

## Decision Produit

- Pas d'upload utilisateur en V1.
- Avatar choisi parmi une banque interne.
- Banque organisee par familles: `anime`, `cartoon`, `professional`, puis `custom` pour les images fournies manuellement.
- Les images finales sont compressees en WebP pour reduire le poids du SaaS.

## Usage

Placer les images sources fournies manuellement dans:

```txt
assets/avatars/source/inbox
```

Puis lancer:

```powershell
bun scripts/avatars/build-avatar-bank.mjs
```

Si `sharp` n'est pas encore installe dans le projet:

```powershell
bun add -d sharp
```

Le script genere:

```txt
assets/avatars/source/generated       avatars SVG generes pour la banque de depart
assets/avatars/optimized              avatars WebP 256x256
assets/avatars/optimized/thumbs       miniatures WebP 96x96
assets/avatars/avatars.manifest.json  manifeste exploitable par le front
```

## Regle de Licence

Les avatars generes par le script sont des SVG originaux BotJob. Les images ajoutees dans `source/inbox` doivent etre verifiees avant usage public.

Pour un personnage existant, comme Shadow de *The Eminence in Shadow*, l'usage doit rester personnel ou disposer d'une autorisation/licence avant integration dans un SaaS public.

## Sources Possibles

- Banque fournie par AhmiSVG plus tard.
- Avatars originaux crees pour BotJob.
- Generateurs open source avec licences compatibles.

References utiles:

- [DiceBear licenses](https://www.dicebear.com/licenses/)
- [DiceBear Avataaars style](https://www.dicebear.com/styles/avataaars/)
- [Boring Avatars GitHub](https://github.com/boringdesigners/boring-avatars)
