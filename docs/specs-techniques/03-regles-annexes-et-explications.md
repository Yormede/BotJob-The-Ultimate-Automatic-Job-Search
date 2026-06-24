---
title: BotJob - Regles annexes et explications techniques
date: 2026-06-14
tags:
  - BotJob
  - regles
  - architecture
  - OAuth
  - IA
status: draft
---

# BotJob - Regles Annexes et Explications Techniques

Ce document stocke les regles, choix annexes et explications qui ne doivent pas etre perdus pendant la conception.

## Auth OAuth

### Chronologie d'une connexion OAuth classique

1. L'utilisateur clique sur `Continuer avec Google` ou `Continuer avec Apple`.
2. BotJob redirige l'utilisateur vers le fournisseur OAuth avec:
   - client id;
   - redirect URI;
   - scopes demandes;
   - state anti-CSRF;
   - PKCE si utilise.
3. L'utilisateur s'identifie chez Google/Apple.
4. Le fournisseur demande l'accord pour partager certaines informations.
5. Le fournisseur redirige vers BotJob avec un `code` temporaire.
6. Le backend BotJob echange ce `code` contre des tokens cote serveur.
7. BotJob recupere l'identite minimale: identifiant fournisseur, email, email verifie, nom, prenom, photo si disponible.
8. BotJob cherche si un compte OAuth existe deja avec `provider + providerUserId`.
9. Si oui, BotJob connecte l'utilisateur.
10. Si non, BotJob rattache l'OAuth a un compte existant ou cree un nouveau compte selon le flow choisi.
11. BotJob cree sa propre session applicative.
12. Le navigateur recoit un cookie de session BotJob.

### Bonne pratique V1

Regle: ne pas stocker les access tokens OAuth si BotJob ne doit pas appeler l'API Google/Apple apres connexion.

Donnees utiles a stocker:

- provider: `google` ou `apple`;
- providerUserId;
- email du provider;
- scopes accordes;
- date de liaison;
- date de derniere connexion;
- snapshot minimal du profil.

Ce qu'on ne stocke pas par defaut:

- access token OAuth;
- refresh token OAuth;
- "hash OAuth" generique, car ce n'est pas utile si on stocke deja `provider + providerUserId`.

## Sessions

### Choix recommande V1

Regle: utiliser une session serveur avec cookie HTTP-only.

Flow:

1. Login reussi.
2. Backend cree une session en base.
3. Backend genere un token aleatoire.
4. Backend stocke seulement le hash du token dans `sessionTokenHash`.
5. Backend envoie le token brut dans un cookie:
   - `HttpOnly`;
   - `Secure` en production;
   - `SameSite=Lax` ou `Strict`;
   - expiration longue.
6. A chaque requete, le backend lit le cookie, hash le token, retrouve la session et identifie l'utilisateur.

Pourquoi pas access token + refresh token en V1:

- plus complexe;
- surtout utile pour API mobile, clients tiers, ou architecture tres distribuee;
- une session cookie serveur suffit pour une SPA web classique.

### Utilite des champs session

- `lastSeenAt`: utile pour afficher les sessions actives, detecter une activite recente et faire du nettoyage.
- `userAgent`: utile pour afficher "Chrome Windows" ou "Safari iPhone" dans les sessions.
- `ipHash`: utile pour indice securite sans stocker l'IP brute.
- `expiresAt`: utile pour expiration automatique.
- `revokedAt`: utile pour deconnexion d'une session.

## Preferences Tableau

Regle: les filtres temporaires restent dans le front tant que l'utilisateur ne clique pas sur un bouton de sauvegarde.

Nom possible du bouton:

- `Enregistrer cette vue`;
- `Sauvegarder l'affichage`;
- `Garder cette vue`.

Donnees sauvegardees:

- colonnes visibles;
- ordre des colonnes;
- tri;
- densite;
- nom de la vue.

Donnees non sauvegardees automatiquement:

- recherche en cours;
- filtre temporaire;
- scroll;
- selection de lignes.

`density` signifie seulement la densite visuelle du tableau:

- compact;
- comfortable;
- spacious.

Ce n'est pas un filtre de donnees.

## Profil Maitre IA

### Consignes personnalisees utilisateur

Regle: chaque utilisateur dispose d'un document libre de consignes personnalisees.

Nom d'export:

```txt
custom-instructions.md
```

Le contenu peut contenir n'importe quelle directive metier choisie par l'utilisateur.

Exemples:

- ne jamais inventer une competence;
- toujours produire des phrases courtes;
- ne pas modifier la structure globale du CV;
- mettre certains projets en avant selon le poste;
- eviter certains termes;
- respecter une marche a suivre particuliere.

Utilisation:

1. L'utilisateur modifie ses consignes dans le Studio IA.
2. Le backend enregistre le contenu texte en BDD.
3. Lors d'un appel IA, la fonction metier charge les consignes.
4. Elle compose le contexte avec:
   - regles systeme BotJob;
   - droits et interdictions;
   - consignes personnalisees;
   - profil maitre utile;
   - offre ou candidature concernee;
   - demande courante.
5. Le provider envoie le prompt final au modele.

Regle de priorite:

- les regles systeme et de securite BotJob priment;
- les consignes utilisateur viennent ensuite;
- la demande courante vient ensuite.

Recommandation:

- stocker le contenu dans la BDD;
- proposer import/export en Markdown;
- ne pas creer un vrai fichier physique par utilisateur tant qu'un besoin technique ne l'impose pas.

### Mots cles des axes de recherche

`keywords`:

- mots qui favorisent l'association d'une offre avec un axe;
- exemple: `LLM`, `RAG`, `agent IA` pour `Developpeur IA`.

`excludedKeywords`:

- mots qui indiquent qu'une offre ne correspond probablement pas a l'axe;
- exemple: `senior 10 ans`, `commercial terrain`.

Decision V1:

- ne pas les stocker;
- le titre de l'axe, le contrat, la localisation, les consignes personnalisees et l'analyse IA doivent suffire;
- les ajouter seulement si les tests montrent des erreurs d'association recurrentes.

### Champs retires ou a repousser

- `sourceSummary`: retire pour l'instant.
- `writingPreferences`: retire pour l'instant.
- `neverUse`: retire pour l'instant.

Ils pourront revenir si le besoin devient clair.

### Life trace

Definition:

`lifeTrace` est une chronologie synthese du parcours utilisateur.

Utilite possible:

- aider l'IA a comprendre l'ordre du parcours;
- expliquer une reconversion;
- choisir quels projets mettre en avant;
- eviter que l'IA lise le profil comme une liste plate.

Exemple:

```txt
2023 - Debut formation developpement web
2024 - Projets personnels React/Node
2025 - Homelab Proxmox/Docker
2026 - Recherche alternance developpeur IA
```

Decision actuelle:

- on le garde comme option utile;
- il n'est pas obligatoire en V1;
- l'assistant IA peut l'alimenter.

## Chat IA

### Rendu type chat

Pour avoir un rendu classique:

- stocker chaque message utilisateur;
- stocker chaque message assistant;
- conserver l'ordre chronologique;
- afficher les messages au fur et a mesure;
- streamer la reponse assistant si possible.

### WebSocket ou streaming HTTP

Recommandation V1:

- commencer avec streaming HTTP/SSE ou reponse classique;
- WebSocket seulement si on a besoin d'une conversation bidirectionnelle permanente.

Pourquoi:

- WebSocket est plus lourd;
- pour un assistant IA, le besoin principal est souvent de streamer une reponse du serveur vers le client;
- SSE ou streaming fetch suffit souvent.

### Historique envoye a l'IA

Oui, l'IA a besoin de contexte. Mais on n'envoie pas forcement tout l'historique brut.

Strategie:

- derniers messages recents;
- resume de conversation si longue;
- contexte metier utile;
- droits et limites de l'assistant;
- donnees de la candidature ou du profil concerne.

### Conversations

V1:

- stockage simple des messages;
- pas de rollback;
- pas de gestion fine de versions.

V2:

- sessions de conversation;
- archivage par sujet;
- rollback ou historique de modifications;
- reprise intelligente de conversation.

### `appliedUpdates`

Champ retire en V1.

Idee initiale:

- garder la liste des modifications appliquees par un message IA.

Pourquoi retire:

- tu ne veux pas de retour version precedente en V1;
- si l'IA modifie mal, on corrige manuellement;
- le rollback sera une fonctionnalite V2.

## Prompt pour apprendre les normes d'un chatbot IA

```txt
Explique-moi comme à un développeur débutant comment concevoir proprement un chatbot IA dans une application web.

Je veux comprendre:
- les messages user / assistant / system;
- la différence entre historique complet, contexte utile et résumé de conversation;
- comment streamer une réponse IA;
- quand utiliser WebSocket, SSE ou HTTP classique;
- comment stocker les conversations en base;
- comment gérer les permissions de l'assistant;
- comment éviter qu'il modifie des données interdites;
- comment organiser le code backend;
- comment organiser le code frontend;
- comment tester un chatbot IA.

Donne-moi une explication progressive, des schémas simples, puis un exemple TypeScript côté frontend et backend.
```

## Templates

Regle: l'utilisateur peut fournir un template sous forme HTML/CSS, PDF ou image.

Si la source n'est pas HTML/CSS:

- le front detecte le type;
- affiche un popup:

```txt
Attention: votre CV est un PDF ou une image. BotJob va tenter de recréer un template HTML/CSS, mais le rendu peut ne pas être fidèle à 100%.
```

Ensuite:

- l'IA convertit/recree le template en HTML/CSS;
- BotJob conserve les fichiers sources;
- BotJob conserve le HTML/CSS genere.

Regle CSS:

- Tailwind interdit pour les templates generes;
- utiliser du CSS classique;
- privilegier Flexbox;
- utiliser CSS Grid seulement quand c'est vraiment utile;
- ne pas modifier la structure globale si l'utilisateur ne l'autorise pas.

`previewImagePath`:

- sert a afficher rapidement une miniature du template;
- evite de rendre tout le HTML/CSS a chaque affichage de liste;
- utile dans la bibliotheque templates, la modale de choix et les comparaisons visuelles.

## Autorisation IA sur Structure et Design

Regle: ajouter une option `Autoriser l'IA à modifier la mise en page et le design`.

Si coche:

```txt
L'utilisateur autorise la modification de la mise en page, du style et du design du CV selon ses directives.
```

Si non coche:

```txt
Interdiction formelle de modifier le style, le design, la structure et la mise en page globale du CV. Adapter uniquement le contenu.
```

## Architecture IA

Architecture retenue pour la reflexion:

### Couche 1 - Provider IA

Interface compatible avec:

- OpenAI;
- Anthropic;
- Qwen;
- OpenRouter.

Variables possibles:

- provider;
- model;
- temperature;
- baseUrl;
- apiKey;
- thinkingMode;
- maxOutputTokens;
- timeoutMs;
- retryCount;
- responseFormat;
- topP;
- frequencyPenalty;
- presencePenalty.

Toutes les IA ne supportent pas toutes ces variables. Le provider adaptera.

### Couche 2 - Capacites provider

Capacites possibles:

- chat;
- sortie structuree JSON;
- tool calls;
- vision/image input;
- file input;
- streaming.

### Couche 3 - Fonctions metier IA

Fonctions BotJob qui appellent l'IA:

- assistant general;
- creation CV;
- creation lettre de motivation;
- creation message d'accompagnement;
- creation ou modification de template;
- mise a jour profil maitre IA;
- proposition de prochaine action.

Decision actuelle:

- garder une couche provider separee;
- garder les fonctions metier separees;
- ne pas multiplier artificiellement les couches si cela rend le code moins lisible.

## Strategie Outputs IA

Point a tester plus tard:

- un seul appel IA pour CV + lettre + message;
- ou plusieurs appels specialises.

Hypothese:

- plusieurs appels seront plus controlables;
- un appel unique sera plus rapide mais plus difficile a corriger;
- il faudra tester cout, qualite et stabilite.

## Methode d'Architecture Metier

Regle: organiser le code en ensembles et sous-ensembles les plus petits possible, sans dependre d'abord du langage ou du framework.

Objectif:

- partir de la logique metier;
- decomposer par responsabilites;
- garder le code maleable;
- rendre chaque sous-ensemble comprehensible.

Exemple:

```txt
IA
  Providers
  Capacites
  Fonctions metier

Candidatures
  Creation
  Suivi
  Historique
  Export

Templates
  Sources
  Conversion
  Preview
  Edition
```

## Dashboard

`createCvOverlay`:

Rappel de son role:

- quand l'utilisateur demande au chat dashboard de creer un CV;
- l'assistant remplit le bloc rapide de creation;
- un overlay apparait sur le chat;
- timer de 5 secondes;
- si l'utilisateur n'annule pas, BotJob lance la creation comme si le bouton avait ete clique.

Decision technique:

- c'est uniquement un etat front temporaire;
- ne pas le stocker en BDD;
- le backend ne recoit que la requete finale de creation apres le timer ou le clic utilisateur.

`quickCreate`:

- retire de l'objet BDD brut;
- c'est un etat front ou un payload envoye a l'API de creation;
- inutile comme donnee persistante.

`recentApplicationsWidget`:

- retire de l'objet BDD brut;
- le front demandera au backend les candidatures recentes avec limite et filtres;
- le fait d'afficher 5 lignes est une decision UI, pas une donnee a stocker.

## Historique Candidature

Role:

- conserver ce qui a change;
- savoir qui a modifie: user, assistant, system;
- comprendre pourquoi `nextAction` a ete videe;
- afficher l'ancienne prochaine action en gris si besoin.

Simplification:

- remplacer `actions`, `nextActions`, `assistantUpdates` par une liste unique `history.events`.

Exemples d'evenements:

- `last_action_changed`;
- `next_action_suggested`;
- `next_action_cleared`;
- `status_changed`;
- `follow_up_added`;
- `interview_added`;
- `assistant_updated_field`.

## Export et Copie

`copyExport` retire de l'objet candidature.

Raison:

- copier une ligne est une action UI ponctuelle;
- on n'a pas besoin de stocker `lastCopiedAt` en V1.

Regle produit conservee:

- quand l'utilisateur copie une ligne, la copie inclut aussi les champs caches par l'affichage.
