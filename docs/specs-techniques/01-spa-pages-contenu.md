---
title: BotJob - SPA privee, pages et contenu
date: 2026-06-13
tags:
  - BotJob
  - SPA
  - UX
  - specifications
status: draft
---

# BotJob - SPA Privee

Ce document cadre les pages de l'application privee BotJob. Il ne concerne pas les pages legales, contact, FAQ publique ou autres pages statiques marketing, qui seront traitees apres l'application.

## Decision Generale

La landing publique reste statique. La SPA privee commence a l'authentification et contient le vrai produit.

Routes principales:

```txt
/login
/register
/verify-email
/reset-password
/new-password
/app/dashboard
/app/create
/app/applications
/app/applications/:id
/app/studio
/app/settings
```

## Zone Auth

### `/login`

Objectif: connecter l'utilisateur.

Contenu:

- champ email ou username;
- champ mot de passe;
- bouton connexion;
- bouton connexion Google;
- bouton connexion Apple;
- lien mot de passe oublie;
- lien inscription.

### `/register`

Objectif: creer un compte.

Contenu:

- email;
- username;
- mot de passe;
- confirmation mot de passe;
- nom;
- prenom;
- pays du numero;
- numero de telephone;
- avatar facultatif.

Comportement avatar:

- si l'utilisateur ne choisit rien, BotJob selectionne un avatar aleatoire depuis la banque interne;
- un bouton ouvre une modale de selection d'avatar;
- aucun upload utilisateur en V1.

### `/verify-email`

Objectif: valider l'email par code saisi sur le site.

Contenu:

- message indiquant que le compte doit etre valide;
- champ code de verification;
- bouton `Verifier le code`;
- bouton `Envoyer le code`;
- bouton `Renvoyer le code`;
- message d'erreur si code invalide ou expire.

Decision:

- pas de validation par lien email en V1;
- validation par code saisi sur le site;
- le bouton d'envoi du code est disponible pendant ou apres l'inscription selon le flow final.

### `/reset-password`

Objectif: demander un code ou lien de reinitialisation.

Contenu:

- champ email ou username;
- bouton envoyer instruction;
- retour utilisateur clair.

### `/new-password`

Objectif: definir un nouveau mot de passe.

Contenu:

- code ou token;
- nouveau mot de passe;
- confirmation;
- bouton validation.

## Page `Studio IA`

Ancien nom provisoire: onboarding, workspace, espace donnees IA.

Route:

```txt
/app/studio
```

Objectif: centraliser les donnees qui permettent a l'IA de comprendre l'utilisateur, ses objectifs de recherche, ses templates et les futures automatisations.

Cette page n'est pas bloquante apres inscription. L'utilisateur arrive directement dans l'application apres connexion/validation. Le Studio IA sert a enrichir la qualite des generations.

### Desktop

La page est divisee en sections deplacables, pliables et agrandissables:

- Profil maitre IA;
- Axes de recherche;
- Templates;
- Scrappeur BotJob.

### Mobile

La page affiche une sorte de header interne avec les titres de sections:

- Profil maitre IA;
- Axes de recherche;
- Templates;
- Scrappeur BotJob.

Au clic sur un titre, la section apparait dynamiquement comme une vue ou un panneau de contenu. La fermeture revient a la liste des sections.

### Section Profil Maitre IA

Objectif: stocker les informations personnelles et professionnelles utiles pour adapter les candidatures.

Contenu:

- texte descriptif expliquant le role de la section;
- espace structure pour:
  - vie personnelle utile;
  - projets personnels;
  - projets professionnels;
  - formations professionnelles;
  - formations personnelles;
  - competences professionnelles;
  - competences personnelles;
  - experiences;
  - preferences de formulation;
  - informations a ne jamais utiliser;
- chat assistant IA local a la page pour mettre a jour automatiquement le profil maitre;
- bouton `Recuperer mes donnees depuis une autre IA`.

Recommandation de structure:

- ne pas faire un unique champ texte informe;
- ne pas forcer non plus l'utilisateur a remplir 30 formulaires rigides;
- utiliser des sections structurees modifiables, et permettre a l'assistant IA de ranger automatiquement le contenu donne par l'utilisateur.

Definition de `trace de vie utilisateur alimentee par IA`:

> Une chronologie synthetique du parcours de l'utilisateur, reconstruite par l'IA a partir de son CV, de ses projets, de ses formations, de ses experiences et de ses ajouts manuels. Elle ne sert pas a etre affichee publiquement. Elle sert a comprendre l'evolution du profil, a choisir les meilleurs arguments et a adapter les candidatures.

Exemple:

```txt
2023 - Formation developpement web
2024 - Projets personnels React/Node
2025 - Homelab Proxmox/Docker et projets IA
2026 - Recherche alternance/developpeur IA
```

Modal `Recuperer mes donnees depuis une autre IA`:

- affiche un prompt a copier;
- bouton rapide `Copier le prompt`;
- zone de conseil en bas;
- le conseil indique de ne pas coller directement la reponse dans le profil maitre IA;
- l'utilisateur doit coller la reponse dans le chat assistant BotJob afin que l'assistant trie et mette a jour les bonnes sections.

### Section Axes de Recherche

Ancien nom: recherches actives d'emploi, job searches.

Nom retenu: **Axes de recherche**.

Paragraphe d'explication:

> Les axes de recherche representent les differents titres de poste que vous recherchez, avec leur type de contrat, leur localisation et leurs criteres. BotJob les utilise pour comprendre si une offre correspond plutot a votre recherche de developpeur logiciel, developpeur IA, job etudiant, alternance ou autre objectif.

Contenu:

- liste des axes;
- ajout d'un axe;
- modification d'un axe;
- suppression d'un axe;
- titre recherche;
- type de contrat recherche: CDI, CDD, alternance, interim, freelance, stage, temps partiel, autre;
- localisation souhaitee;
- remote/hybride/presentiel;
- mots cles importants;
- exclusions;
- priorite;
- actif/inactif.

### Section Templates

Objectif: gerer les modeles de CV et de lettre.

Contenu:

- liste des templates CV;
- liste des templates lettre de motivation;
- template par defaut;
- nom du template;
- renommer un template;
- ajouter un template;
- supprimer un template;
- telecharger un template;
- apercu du template.

Definition `apercu`:

> Mini sandbox visuelle qui affiche a quoi ressemble le template avec des donnees factices ou un exemple de profil.

Clarification ATS:

- `mode ATS` n'est pas un vrai mode metier independant;
- ce que l'utilisateur comprend vraiment est: CV 1 colonne compatible ATS;
- la case dans la creation doit donc etre formulee comme `CV ATS 1 colonne`;
- si un CV n'est pas compatible ATS, BotJob ne devrait pas le presenter comme un CV ATS.

V2:

- bibliotheque de templates;
- templates partageables;
- marketplace ou galerie enrichie.

### Section Scrappeur BotJob

Ancien nom: automatisation future.

Nom retenu: **Scrappeur BotJob**.

Objectif V1:

- section non fonctionnelle;
- mini landing interne;
- expliquer que plus tard BotJob pourra chercher des offres, postuler, mettre a jour le tableau et proposer des relances.

## Dashboard

Route:

```txt
/app/dashboard
```

Page principale apres connexion.

### Header Dashboard

Desktop uniquement:

- nom/logo BotJob;
- bouton deconnexion;
- avatar utilisateur;
- clic avatar: sous-menu avec settings, compte, securite, deconnexion.

Mobile:

- pas de header dashboard;
- navigation par bottom navbar.

### Bloc Bienvenue + Assistant IA

Position: gauche.

Contenu:

- message de bienvenue;
- chat assistant IA.

Pouvoirs de l'assistant:

- tout faire comme l'utilisateur sur les donnees metier;
- mettre a jour une candidature;
- ajouter un refus;
- ajouter un entretien;
- conseiller une relance;
- retrouver une offre;
- mettre a jour le tableau de suivi;
- modifier les donnees du profil maitre IA;
- aider a structurer les axes de recherche;
- aider a modifier des remarques, contacts, relances, entretiens, historiques.

Interdictions:

- modifier email;
- modifier mot de passe;
- modifier numero de telephone;
- modifier securite du compte;
- modifier paiement;
- supprimer ou desactiver le compte.

Comportement si demande interdite:

- l'assistant explique la methode;
- exemple: `Rendez-vous dans Settings > Compte pour modifier votre email`;
- il ne fait pas l'action lui-meme.

Comportement si l'utilisateur demande de creer un CV:

- l'assistant ne lance pas directement la generation dans le chat;
- il remplit le bloc `Creation rapide CV` du dashboard avec le prompt et les informations;
- un overlay apparait sur le chat;
- timer visible de 5 secondes;
- si l'utilisateur n'annule pas, BotJob agit comme si l'utilisateur avait clique sur `Creer la candidature`;
- cela lance la creation et redirige vers la page creation avec les donnees pre-remplies.

### Bloc Creation Rapide CV

Position: sous le chat assistant.

Contenu:

- choix template CV;
- case `lettre de motivation`;
- case `CV ATS 1 colonne`;
- case `message d'approche`;
- input offre de poste;
- commentaire libre;
- bouton `Creer la candidature`.

Au clic:

- lance la creation;
- redirige vers `/app/create`;
- les donnees sont pre-remplies;
- la transition doit etre dynamique.

### Bloc Statistiques

Position: haut droite.

Contenu:

- candidatures de la semaine;
- candidatures depuis le mois dernier ou autre periode;
- vue principale grande;
- vue secondaire petite.

Parametrage:

- chaque indicateur peut etre regle sur:
  - 1 semaine;
  - 1 mois;
  - 3 mois;
  - lifetime;
- l'utilisateur peut choisir lequel s'affiche en gros.

### Bloc Profil Resume

Position: droite sous les stats.

Contenu:

- avatar;
- nom;
- prenom;
- liste des axes de recherche visibles.

Axes visibles:

- maximum 3 visibles;
- scrollable;
- effet de bord avec opacite qui disparait.

Format:

```txt
Je recherche "Developpeur IA" - alternance
Je recherche "Developpeur logiciel" - CDI
Je recherche "Job etudiant" - temps partiel
```

### Bloc Candidatures Recentes

Position: dashboard, format condense.

Objectif: retrouver vite une candidature recente ou repondre rapidement si une entreprise appelle.

Contenu:

- recherche rapide;
- maximum 5 candidatures visibles;
- lien vers la candidature;
- nom de candidature ou poste;
- entreprise;
- localisation;
- date de candidature.

Colonnes volontairement reduites. Le tableau complet est dans `/app/applications`.

## Navigation

### Desktop

Aside gauche:

- Dashboard;
- Creer CV/LDM/message;
- Tableau de suivi candidatures;
- Studio IA;
- Settings;
- FAQ;
- Tutoriel.

### Mobile

Bottom navbar:

- Dashboard;
- Creer;
- Candidatures;
- Menu.

Le bouton Menu ouvre un overlay pleine page au-dessus de la page courante. Fermer ou recliquer supprime l'overlay et revient a la page en cours.

Structure du menu mobile:

Bloc principal:

- Dashboard;
- Creer CV/LDM/message;
- Tableau de suivi candidatures;
- Studio IA.

Separation visuelle.

Sous-menu Preferences:

- Settings;
- Compte;
- Securite;
- Paiement.

Separation visuelle.

Sous-menu Aide et pages:

- FAQ;
- Tutoriel;
- pages legales futures.

## Page Creation CV/LDM/message

Route:

```txt
/app/create
```

Objectif: creer les outputs de candidature.

Contenu:

- offre de poste;
- URL de l'offre;
- entreprise;
- localisation;
- date de l'offre si disponible;
- texte complet de l'offre;
- commentaire utilisateur;
- axe de recherche associe;
- choix template;
- option lettre de motivation;
- option CV ATS 1 colonne;
- option message d'approche.

Mode V1:

- un seul mode: Normal;
- aucun blocage apres envoi;
- BotJob cree les outputs demandes.

Feedback pendant generation:

- affichage de petites phrases simples;
- exemple:
  - `J'analyse l'offre...`
  - `J'ai termine l'analyse. Je prepare le CV...`
  - `CV prepare. Je redige la lettre...`
  - `Lettre preparee. Je genere le message...`
- chaque ligne terminee reste visible ou devient un historique court;
- pas de balises techniques type `<think>`.

## Page Tableau de Suivi Candidatures

Route:

```txt
/app/applications
```

Objectif: afficher toutes les candidatures dans un tableau dense, aere, moderne.

Pas un tableau HTML brut. Le rendu peut etre une grille CSS accessible visuellement comme un tableau.

Fonctions obligatoires:

- recherche;
- filtrage;
- choisir les colonnes affichees;
- sauvegarder la vue utilisateur;
- retrouver la meme vue apres deconnexion/reconnexion et sur un autre appareil;
- exporter tout le tableau;
- copier une ligne complete;
- la copie doit inclure aussi les donnees masquees par le filtrage de colonnes.

Colonnes / donnees:

- entreprise;
- poste;
- axe de recherche associe;
- statut;
- date candidature;
- localisation;
- type de contrat;
- contact interne;
- remarque;
- relance 1 date;
- relance 2 date;
- entretien 1 date;
- derniere action;
- prochaine action;
- lien offre;
- lien detail candidature.

Donnees supprimees:

- score.

Fusion visuelle possible:

- type contrat;
- localisation;
- date candidature;

peuvent etre regroupes dans une colonne composee sur le front.

Recherche:

- la recherche ne parcourt pas les documents longs;
- elle utilise des tags/mots cles generes pour chaque candidature;
- les contenus longs exclus:
  - texte complet offre;
  - CV genere;
  - lettre generee;
  - message genere;
  - resume long.

Prochaine action:

- remplie par l'IA;
- si l'utilisateur modifie manuellement `derniere action`, alors `prochaine action` est videe;
- l'ancienne prochaine action peut rester visible en grise dans l'historique pour comprendre ce qui etait prevu avant modification;
- toutes les dernieres actions et prochaines actions sont conservees dans l'historique.

## Page Detail Candidature

Route:

```txt
/app/applications/:id
```

Objectif: afficher tout le dossier d'une candidature.

Contenu obligatoire:

- entreprise;
- poste;
- axe de recherche associe;
- lien de l'offre;
- texte complet de l'offre de poste;
- resume offre;
- localisation;
- type contrat;
- date de l'offre si disponible;
- date de candidature;
- statut;
- contact interne;
- remarques;
- fichiers generes;
- CV genere;
- lettre de motivation generee;
- message d'approche genere;
- historique des dernieres actions;
- historique des prochaines actions;
- relances;
- entretiens;
- notes;
- logs metier utiles;
- bouton modifier;
- bouton generer une nouvelle version.

Action assistant IA:

- le terme est ambigu et n'est pas retenu comme section principale;
- les modifications faites par l'assistant doivent apparaitre dans l'historique general avec auteur `assistant`.

## Settings

Route:

```txt
/app/settings
```

Sections:

- Apparence:
  - theme clair;
  - theme sombre;
  - preference systeme.
- Compte:
  - username;
  - email;
  - nom;
  - prenom;
  - telephone;
  - pays du numero.
- Securite:
  - mot de passe;
  - sessions;
  - OAuth Google;
  - OAuth Apple.
- Donnees:
  - demande de suppression des donnees, fonctionnelle en V2;
  - export des donnees, plus tard si necessaire.
- Desactivation:
  - desactiver mon compte.
- Paiement:
  - plan actuel;
  - facturation future.

## Decisions Importantes

- Le terme `recherches actives` est remplace par `axes de recherche`.
- `onboarding` n'est plus une page obligatoire bloquante apres inscription.
- La page equivalente s'appelle `Studio IA`.
- Le profil candidat est fusionne avec `Profil maitre IA`.
- `Scrappeur BotJob` remplace `Automatisation future`.
- V1 utilise un seul mode: `Normal`.
- Le score est retire de l'interface candidature.
- Les pages legales, contact, FAQ publique et tutoriel complet seront traitees a la fin.
