---
title: BotJob - Audit de couverture fonctionnelle Figma
date: 2026-06-23
tags:
  - BotJob
  - Figma
  - UX
  - audit
status: active
---

# Audit de couverture fonctionnelle Figma

> [!summary] Verdict
> Les 11 routes principales de la SPA sont présentes, mais la maquette n'est pas encore fonctionnellement complète. Il manque surtout des sous-vues, modales et états nécessaires aux actions déjà affichées.

## Routes principales

| Route | Couverture |
| --- | --- |
| `/login` | Complète |
| `/register` | Partielle : sélection d'avatar manquante |
| `/verify-email` | Complète |
| `/reset-password` | Complète |
| `/new-password` | Complète |
| `/app/dashboard` | Partielle : configurations et overlay IA manquants |
| `/app/create` | Partielle : validation finale et alertes manquantes |
| `/app/applications` | Partielle : outils du tableau sans vues dédiées |
| `/app/applications/:id` | Partielle : édition et actions métier manquantes |
| `/app/studio` | Partielle : gestion réelle des axes et templates manquante |
| `/app/settings` | Incomplète : seule la section Sécurité est détaillée |

## Vues indispensables à ajouter

### Priorité 1 - Bloquantes pour le parcours principal

- [ ] Sélection d'avatar lors de l'inscription.
- [x] Création, modification, suppression, priorité et activation d'un axe de recherche.
- [x] Gestion d'un template : ajout/import, remplacement, suppression, copie HTML et téléchargement.
- [ ] Alertes de création : axe incompatible, template non ATS, source PDF/image recréée imparfaitement.
- [ ] Validation finale des quatre rendus : CV, lettre, message et entrée de suivi.
- [ ] Retouche d'un rendu par prompt avant validation.
- [ ] Confirmation d'export et d'archivage de la candidature.
- [ ] Sections Settings `Apparence`, `Compte` et `Désactivation`.

### Priorité 2 - Nécessaires aux actions affichées

- [ ] Overlay dashboard avec compte à rebours de 5 secondes avant création.
- [ ] Configuration des statistiques du dashboard.
- [ ] Menu avatar desktop : Settings, Compte, Sécurité et déconnexion.
- [ ] Filtres du tableau de candidatures.
- [ ] Choix des colonnes, densité et sauvegarde d'une vue.
- [ ] Aperçu plein écran d'un fichier généré.
- [x] Modification d'une candidature dans une modale globale.
- [ ] Ajout/modification d'un contact, d'une note, d'une relance et d'un entretien.
- [ ] Modale `Récupérer mes données depuis une autre IA`.
- [ ] Sections Settings `Données` et `Paiement`, même sous forme d'états futurs explicites.

### Priorité 3 - États système et cas limites

- [ ] État vide : aucune candidature.
- [ ] État vide : aucun axe de recherche.
- [ ] État vide : aucun template.
- [ ] Chargement et erreur de génération.
- [ ] Session expirée avec reconnexion.
- [ ] Candidature introuvable ou supprimée.
- [x] Page `404` desktop et mobile.
- [ ] FAQ et Tutoriel minimaux, ou retrait de leurs liens tant qu'ils ne sont pas créés.

## Pages devenues inutiles

Les décisions les plus récentes remplacent certains anciens écrans :

- pas de page `Onboarding` obligatoire ;
- pas de page `Profil candidat` séparée : elle est intégrée au Profil maître IA ;
- pas de page `Offres` séparée en V1 : l'offre est saisie dans la création et conservée dans la candidature ;
- pas de page séparée par mode d'automatisation : la V1 actuelle retient uniquement le mode Normal ;
- pas de page Scrappeur fonctionnelle en V1 : une section future désactivée suffit.

## Périmètre recommandé

Pour obtenir une maquette réellement prototypable sans multiplier inutilement les routes :

- conserver les 23 frames principales ;
- ajouter environ 16 à 20 frames d'états ou overlays réutilisables ;
- utiliser des variantes de composants pour les confirmations, erreurs, champs et alertes ;
- ne créer une nouvelle route que pour `404`, FAQ et Tutoriel si leurs liens restent visibles.

## Ajouts du 2026-06-23

- composant `Toast` :
  - succès et erreur ;
  - contenu simple, liste de liens ou liste de fichiers ;
  - titre et message éditables ;
- composant `Modal` :
  - tailles Small, Medium et Large ;
  - zone de contenu libre ;
- modale d'édition de candidature desktop/mobile ;
- modale de gestion des axes desktop/mobile ;
- modale de gestion des templates desktop/mobile ;
- le remplacement d'un template accepte uniquement un nouveau fichier HTML/CSS ou un nouveau texte HTML ;
- l'ancien code n'est pas injecté dans l'éditeur : il peut être copié ou téléchargé ;
- boutons contextuels `Modifier`, `Gérer les axes` et `Gérer templates` reliés aux overlays ;
- pages 404 desktop/mobile.
