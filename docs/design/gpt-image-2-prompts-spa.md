# BotJob - Prompts GPT Image 2 pour la SPA

## Mode d'emploi

- Generer chaque image separement.
- Desktop recommande : `2048x1440`.
- Mobile recommande : `1088x2304`.
- Utiliser une qualite elevee pour ameliorer les textes et les petits composants.
- Les images servent de direction artistique. Les textes, espacements et composants devront ensuite etre reconstruits proprement dans Figma.
- Ne pas demander plusieurs ecrans dans une seule image.

## 01 - Connexion desktop

```text
Use case: ui-mockup
Asset type: high-fidelity desktop SaaS authentication screen
Primary request: Design the desktop login page for "BotJob", a private SaaS application that creates ATS resumes, cover letters, outreach messages and tracks job applications. Show a straight-on full-screen product screenshot, 2048x1440, no browser chrome and no device mockup.
Style/medium: shippable premium product UI, dark theme but never pure black, professional network inspiration without copying LinkedIn. Carbon background, graphite surfaces, restrained electric blue accent, teal used only for AI-related signals, amber only for warnings. Crisp geometric typography, subtle 1px borders, 6-8px radii, precise spacing, clean outline icons similar to Lucide.
Composition/framing: elegant two-zone authentication shell. Left side is a restrained brand/product panel with the BotJob wordmark, a compact visual showing a job offer becoming a CV, letter and tracked application, plus three short benefits. Right side contains the login form in a focused panel. Do not make a marketing landing page.
Required UI text (French, verbatim): "Bon retour sur BotJob", "Email ou nom d'utilisateur", "Mot de passe", "Se connecter", "Continuer avec Google", "Continuer avec Apple", "Mot de passe oubliÃ© ?", "Pas encore de compte ?", "CrÃ©er un compte".
Details: email icon, lock icon, eye visibility icon, Google and Apple buttons, clear focus state, discreet security message. Make the interface credible for React TypeScript implementation.
Constraints: highly readable French text, realistic form proportions, WCAG-friendly contrast, no decorative orbs, no purple, no excessive glow, no giant headline, no nested cards, no stock photo, no watermark, no extra text.
```

## 02 - Connexion mobile

```text
Use case: ui-mockup
Asset type: high-fidelity mobile SaaS authentication screen
Primary request: Design the mobile login page for "BotJob", a private job-application SaaS. Straight-on portrait screen, 1088x2304, no phone frame.
Style/medium: premium dark product UI, carbon background, graphite form surface, electric blue primary action, teal reserved for AI, amber for warnings, clean geometric sans-serif typography, subtle borders, compact 8px radii, outline icons similar to Lucide.
Composition/framing: BotJob mark and wordmark at the top, concise welcome text, login form immediately visible, social login buttons, password recovery and registration link. Use the full mobile width intelligently with safe-area spacing. No desktop sidebar and no bottom navigation before authentication.
Required UI text (French, verbatim): "Bon retour", "Connectez-vous pour reprendre vos candidatures.", "Email ou nom d'utilisateur", "Mot de passe", "Se connecter", "Continuer avec Google", "Continuer avec Apple", "Mot de passe oubliÃ© ?", "CrÃ©er un compte".
Details: email icon, lock icon, password visibility icon, strong keyboard-friendly field sizing, primary button easy to reach.
Constraints: readable French text, no landing-page hero, no illustration taking half the viewport, no gradients, no purple, no glassmorphism overload, no watermark, no extra text.
```

## 03 - Inscription desktop

```text
Use case: ui-mockup
Asset type: high-fidelity desktop registration screen
Primary request: Design the desktop registration page for BotJob. Straight-on full-screen SaaS UI, 2048x1440, no browser chrome.
Style/medium: dark premium operational product, carbon and graphite palette, electric blue CTA, teal AI detail, warm neutral typography, precise borders, 6-8px radii, clean Lucide-style icons.
Composition/framing: compact brand rail on the left; large structured registration area on the right using a clear two-column form. Group fields into "IdentitÃ©", "Connexion" and "TÃ©lÃ©phone". Include a small internal avatar selector preview with several original professional/cartoon avatar thumbnails and no upload control. Keep the entire form credible and scannable.
Required UI text (French, verbatim): "CrÃ©er votre espace BotJob", "PrÃ©nom", "Nom", "Nom d'utilisateur", "Email", "Mot de passe", "Confirmer le mot de passe", "Pays", "NumÃ©ro de tÃ©lÃ©phone", "Choisir un avatar", "CrÃ©er mon compte", "DÃ©jÃ  inscrit ?", "Se connecter".
Details: password strength hint, country selector, phone icon, user icon, mail icon, lock icons, checkbox for terms, Google and Apple alternatives placed secondary.
Constraints: no user avatar upload button, no GitHub OAuth, no giant card, no marketing sections, no purple, no excessive glow, readable French, no watermark, no extra text.
```

## 04 - Inscription mobile

```text
Use case: ui-mockup
Asset type: high-fidelity mobile registration screen
Primary request: Design a mobile registration page for BotJob, portrait 1088x2304, straight-on app screenshot with no phone frame.
Style/medium: premium dark SaaS UI, carbon background, graphite field surfaces, electric blue primary CTA, teal reserved for AI, restrained amber validation, geometric sans-serif, Lucide-style icons, compact radii.
Composition/framing: scrollable single-column registration flow. BotJob wordmark and title at top. Use clear section separators for identity, account and phone. Show a horizontally scrollable internal avatar gallery with selected state. Sticky or visually anchored bottom CTA, respecting safe areas.
Required UI text (French, verbatim): "CrÃ©er votre espace", "IdentitÃ©", "PrÃ©nom", "Nom", "Compte", "Nom d'utilisateur", "Email", "Mot de passe", "Confirmer le mot de passe", "TÃ©lÃ©phone", "Pays", "NumÃ©ro de tÃ©lÃ©phone", "Avatar BotJob", "CrÃ©er mon compte", "Se connecter".
Details: field icons, password strength, selected avatar ring, terms checkbox.
Constraints: no avatar upload, no GitHub button, no desktop sidebar, no bottom app navigation before authentication, no gradients, no purple, no watermark, no extra text.
```

## 05 - VÃ©rification email desktop

```text
Use case: ui-mockup
Asset type: high-fidelity desktop email verification screen
Primary request: Design BotJob's desktop email verification page using a code entered on the website, not a confirmation link. Straight-on 2048x1440 product screenshot.
Style/medium: premium dark SaaS UI, carbon background, graphite panel, electric blue action, teal success states, amber expiration warning, precise typography and Lucide-style mail and shield icons.
Composition/framing: centered verification workspace with a restrained BotJob brand header. Show a large mail/shield icon, explanation, six separate code input cells, countdown/resend information, primary verification button and secondary send/resend actions. Include an invalid or expired-code inline error example below the code fields without making the screen alarming.
Required UI text (French, verbatim): "VÃ©rifiez votre email", "Saisissez le code reÃ§u par email.", "Code de vÃ©rification", "VÃ©rifier le code", "Envoyer le code", "Renvoyer le code", "Le code expire dans 09:42", "Code invalide ou expirÃ©", "Changer d'adresse email".
Constraints: do not show validation by clickable email link, no large marketing copy, no purple, no excessive glow, accessible contrast, no watermark, no extra text.
```

## 06 - VÃ©rification email mobile

```text
Use case: ui-mockup
Asset type: high-fidelity mobile email verification screen
Primary request: Design the mobile BotJob email verification screen based on entering a six-digit code. Portrait 1088x2304, no phone frame.
Style/medium: premium dark product UI, carbon background, graphite controls, blue CTA, teal confirmation details, amber timer, clean outline mail and shield icons.
Composition/framing: centered content in the upper half, six large code cells sized for touch, visible timer, primary verify button, secondary resend action and a small inline expired-code state. Keep the page focused and calm.
Required UI text (French, verbatim): "VÃ©rifiez votre email", "Saisissez le code reÃ§u par email.", "VÃ©rifier le code", "Envoyer le code", "Renvoyer le code", "Le code expire dans 09:42", "Code invalide ou expirÃ©".
Constraints: no email-link confirmation, no bottom app navigation, no purple, no gradient, no decorative illustration, no watermark, no extra text.
```

## 07 - Mot de passe oubliÃ© desktop

```text
Use case: ui-mockup
Asset type: high-fidelity desktop password reset request screen
Primary request: Design BotJob's desktop "forgot password" page. Straight-on full-screen 2048x1440 SaaS screenshot.
Style/medium: premium dark UI with carbon background, graphite form panel, electric blue CTA, muted neutral text, precise spacing, Lucide-style key, mail and arrow-left icons.
Composition/framing: restrained auth shell consistent with the login page. Focused form panel containing one email-or-username field, clear explanation, send button, back-to-login action, and a compact success confirmation state visible beside or below the form.
Required UI text (French, verbatim): "RÃ©initialiser le mot de passe", "Indiquez votre email ou nom d'utilisateur.", "Email ou nom d'utilisateur", "Envoyer les instructions", "Instructions envoyÃ©es", "Consultez votre boÃ®te email pour continuer.", "Retour Ã  la connexion".
Constraints: not a landing page, no extra fields, no purple, no glass overload, no watermark, no extra text.
```

## 08 - Mot de passe oubliÃ© mobile

```text
Use case: ui-mockup
Asset type: high-fidelity mobile password reset request screen
Primary request: Design BotJob's mobile forgot-password page, portrait 1088x2304, straight-on screen, no phone frame.
Style/medium: dark premium SaaS UI, carbon background, graphite input, blue primary CTA, teal success, clear outline key and mail icons.
Composition/framing: back button, BotJob wordmark, focused title and explanatory text, one large input, full-width CTA, then a compact success message and login return link. Keep the important controls in comfortable thumb reach.
Required UI text (French, verbatim): "RÃ©initialiser le mot de passe", "Email ou nom d'utilisateur", "Envoyer les instructions", "Instructions envoyÃ©es", "Retour Ã  la connexion".
Constraints: no bottom app navigation, no illustration, no gradient, no purple, no watermark, no extra text.
```

## 09 - Nouveau mot de passe desktop

```text
Use case: ui-mockup
Asset type: high-fidelity desktop new-password screen
Primary request: Design the desktop BotJob page used to define a new password after reset. Straight-on 2048x1440 product screenshot.
Style/medium: premium dark authentication UI, carbon and graphite, blue CTA, teal success, restrained amber validation, crisp typography, Lucide-style lock, shield-check and visibility icons.
Composition/framing: centered form with code/token status, new-password and confirmation fields, visible password requirements checklist, strength indicator and a compact success state leading back to login.
Required UI text (French, verbatim): "CrÃ©er un nouveau mot de passe", "Nouveau mot de passe", "Confirmer le mot de passe", "Au moins 12 caractÃ¨res", "Une majuscule et un chiffre", "Mettre Ã  jour le mot de passe", "Mot de passe mis Ã  jour", "Se connecter".
Constraints: security-focused but not intimidating, no marketing content, no purple, no excessive glow, no watermark, no extra text.
```

## 10 - Nouveau mot de passe mobile

```text
Use case: ui-mockup
Asset type: high-fidelity mobile new-password screen
Primary request: Design BotJob's mobile page for setting a new password. Portrait 1088x2304, no phone frame.
Style/medium: premium dark SaaS authentication UI, carbon background, graphite inputs, electric blue CTA, teal valid indicators, amber incomplete indicators, Lucide-style lock and eye icons.
Composition/framing: concise title, two touch-friendly password fields, live requirements list, strength bar, full-width submit button and success confirmation. No app navigation because the user is not connected yet.
Required UI text (French, verbatim): "Nouveau mot de passe", "Confirmer le mot de passe", "Au moins 12 caractÃ¨res", "Une majuscule et un chiffre", "Mettre Ã  jour", "Mot de passe mis Ã  jour", "Se connecter".
Constraints: no gradient, no purple, no decorative art, no watermark, no extra text.
```

## 11 - Dashboard desktop

```text
Use case: ui-mockup
Asset type: high-fidelity desktop private SaaS dashboard
Primary request: Design BotJob's authenticated desktop dashboard, a premium operational cockpit for creating and tracking job applications. Straight-on full-screen screenshot, 2048x1440, no browser chrome.
Style/medium: sophisticated dark SaaS interface, not pure black. Carbon background, layered graphite surfaces, one electric blue action accent, teal only for AI actions, amber for due follow-ups. Dense but breathable, 6-8px radii, subtle borders, crisp typography, restrained depth. Clean Lucide-style icons beside every navigation label and relevant action.
Composition/framing: fixed left sidebar with BotJob logo and icon+text menu: "Dashboard", "CrÃ©er CV/LDM/message", "Candidatures", "Studio IA", "Settings", "FAQ", "Tutoriel". Dashboard-only top header with avatar menu and logout. Main content uses an asymmetric command-center layout: large AI assistant chat at left, configurable statistics top-right, quick CV creation directly below the chat, profile summary with three visible search axes, and compact recent applications list with search.
Required UI text (French, verbatim): "Bonjour Ahmed", "Assistant IA", "CrÃ©ation rapide CV", "CV ATS 1 colonne", "Lettre de motivation", "Message d'approche", "CrÃ©er la candidature", "Candidatures ce mois", "Axes de recherche", "Candidatures rÃ©centes".
AI rule shown subtly: "L'assistant peut agir sur vos donnÃ©es mÃ©tier, jamais sur email, tÃ©lÃ©phone, mot de passe, sÃ©curitÃ© ou paiement."
Details: recent applications include company, role, location and date. Show realistic statuses "EnvoyÃ©e", "Entretien", "Ã€ relancer". Add meaningful search, calendar, file-plus, table, brain, settings and logout icons.
Constraints: no score, no marketing hero, no excessive empty space, no nested cards, no purple, no bokeh/orbs, no giant glass panels, no watermark, no extra text.
```

## 12 - Dashboard mobile

```text
Use case: ui-mockup
Asset type: high-fidelity mobile private SaaS dashboard
Primary request: Design BotJob's authenticated mobile dashboard, portrait 1088x2304, straight-on screen with no phone frame.
Style/medium: premium dark operational UI, carbon and graphite palette, blue primary actions, teal AI indicator, amber follow-up warnings, compact radii, clean Lucide-style icons.
Composition/framing: no desktop dashboard header. Top begins with "Bonjour Ahmed" and a compact notification/avatar row. Show horizontally scrollable statistic tiles, a prominent AI assistant module, compact quick-creation module, profile/search-axis summary and recent applications. Fixed bottom navigation with icon+text items: "Dashboard", "CrÃ©er", "Candidatures", "Menu".
Required UI text (French, verbatim): "Bonjour Ahmed", "Assistant IA", "CrÃ©ation rapide", "CV ATS 1 colonne", "CrÃ©er", "Candidatures rÃ©centes", "Dashboard", "CrÃ©er", "Candidatures", "Menu".
Details: touch-friendly controls, safe-area padding, no horizontal overflow, no tiny table. Recent applications must become stacked rows/cards.
Constraints: no desktop sidebar, no header copied from desktop, no score, no purple, no giant empty region, no watermark, no extra text.
```

## 13 - CrÃ©ation CV/LDM/message desktop

```text
Use case: ui-mockup
Asset type: high-fidelity desktop application-generation workspace
Primary request: Design BotJob's desktop page for creating a CV, cover letter and outreach message from a job offer. Straight-on 2048x1440 private SaaS screenshot.
Style/medium: premium dark productivity interface, carbon background, graphite work surfaces, electric blue primary action, teal AI progress, amber compatibility warnings, Lucide-style file, link, map-pin, calendar, template and wand icons.
Composition/framing: keep the fixed left app sidebar. Main workspace is a practical three-zone editor: left column contains job-offer form fields; center column contains generation settings and progress; right column contains a realistic document preview panel. Use a compact top stepper: "Offre", "Options", "GÃ©nÃ©ration", "Validation".
Required fields/text (French, verbatim): "CrÃ©er une candidature", "URL de l'offre", "Entreprise", "Localisation", "Date de l'offre", "Texte complet de l'offre", "Commentaire", "Axe de recherche", "Template CV", "CV ATS 1 colonne", "Lettre de motivation", "Message d'approche", "Autoriser l'IA Ã  modifier la mise en page et le design", "Lancer la gÃ©nÃ©ration".
Progress messages visible: "J'analyse l'offre...", "Je prÃ©pare le CV...", "Je rÃ©dige la lettre...", "Je gÃ©nÃ¨re le message...".
Details: one mode only, labelled "Normal". Show warning if a non-HTML source template may be recreated imperfectly. Preview tabs: "CV", "Lettre", "Message".
Constraints: no YOLO/Assisted/Strict/Verifier modes, no hidden technical thinking tags, no score, no marketing copy, no purple, no watermark, no extra text.
```

## 14 - CrÃ©ation CV/LDM/message mobile

```text
Use case: ui-mockup
Asset type: high-fidelity mobile application-generation workspace
Primary request: Design BotJob's mobile page for creating a tailored application. Portrait 1088x2304, no phone frame.
Style/medium: premium dark productivity UI, carbon and graphite, blue CTA, teal generation progress, amber warnings, Lucide-style icons, compact but touch-friendly.
Composition/framing: no desktop sidebar. Use a sticky compact stepper with four stages: "Offre", "Options", "GÃ©nÃ©ration", "Validation". Show the "Offre" stage as the main state with URL, company, location, complete offer text and search-axis selector. Below, collapsible output options and a sticky full-width generation button. Include a small preview thumbnail, not a tiny unreadable full desktop document.
Required UI text (French, verbatim): "CrÃ©er une candidature", "URL de l'offre", "Entreprise", "Localisation", "Texte complet de l'offre", "Axe de recherche", "CV ATS 1 colonne", "Lettre de motivation", "Message d'approche", "Mode Normal", "Lancer la gÃ©nÃ©ration".
Bottom navigation: icon+text "Dashboard", "CrÃ©er", "Candidatures", "Menu", with "CrÃ©er" active.
Constraints: no desktop three-column layout squeezed into mobile, no score, no extra automation modes, no purple, no watermark, no extra text.
```

## 15 - Candidatures desktop

```text
Use case: ui-mockup
Asset type: high-fidelity desktop application-tracking table
Primary request: Design BotJob's desktop job-application tracking page as a dense but breathable operational data grid. Straight-on 2048x1440 private SaaS screenshot.
Style/medium: premium dark data-product UI, carbon background, graphite rows, electric blue active controls, teal interview status, amber follow-up status, red refusal status, neutral archived state. Precise typography, tabular numerals, subtle separators, Lucide-style search, filter, columns, bookmark, download, copy and external-link icons.
Composition/framing: fixed left app sidebar. Main area has page title, global search, filter controls, saved-view selector, "Enregistrer cette vue", column chooser, density selector and export action. Below is a sophisticated CSS-grid-style table, not a plain browser HTML table. Sticky header, selectable rows, row action menu.
Required UI text (French, verbatim): "Candidatures", "Rechercher", "Filtres", "Colonnes", "Vue principale", "Enregistrer cette vue", "DensitÃ©", "Exporter", "Entreprise", "Poste", "Axe", "Statut", "Candidature", "Contact", "DerniÃ¨re action", "Prochaine action".
Sample rows: Nova Labs / DÃ©veloppeur IA / Entretien; Acme Studio / Frontend React / Ã€ relancer; DataForge / Assistant data / EnvoyÃ©e; WebQAM / Chef de projet digital / Entretien.
Details: visually combine contract type, location and application date in one composed cell. Copy-row action must imply all hidden fields are included. No score column.
Constraints: no Kanban board as primary view, no huge cards, no score, no purple, no illegible tiny text, no watermark, no extra text.
```

## 16 - Candidatures mobile

```text
Use case: ui-mockup
Asset type: high-fidelity mobile job-application tracking screen
Primary request: Design BotJob's mobile applications tracking page, portrait 1088x2304, no phone frame.
Style/medium: premium dark operational UI, carbon background, graphite application rows, blue actions, teal/amber/red status accents, clear Lucide-style icons.
Composition/framing: top title and search field, horizontal filter chips, saved-view control, then a vertical list of dense application items rather than a compressed desktop table. Each item shows company, role, status, location/contract/date, last action and next action, with an overflow menu. A bottom sheet trigger handles columns, density, export and save-view functions.
Required UI text (French, verbatim): "Candidatures", "Rechercher", "Filtres", "Vue principale", "Enregistrer la vue", "Nova Labs", "DÃ©veloppeur IA", "Entretien", "Prochaine action", "Relancer demain".
Bottom navigation: "Dashboard", "CrÃ©er", "Candidatures", "Menu", with "Candidatures" active.
Constraints: no horizontal desktop table, no score, no oversized cards, no purple, no watermark, no extra text.
```

## 17 - DÃ©tail candidature desktop

```text
Use case: ui-mockup
Asset type: high-fidelity desktop application-detail workspace
Primary request: Design BotJob's desktop detail page for one job application. Straight-on 2048x1440 private SaaS screenshot.
Style/medium: premium dark case-management interface, carbon background, layered graphite sections, blue actions, teal AI-authored history markers, amber follow-up dates, clean Lucide-style building, link, map-pin, calendar, file, history, note, contact and refresh icons.
Composition/framing: fixed left app sidebar. Top case header shows company, role, status, associated search axis, offer link, location, contract type, offer date and application date. Under it, use a structured two-column workspace: main column has full offer text with summary, generated files and artifact previews; right rail has internal contact, notes, follow-ups and interviews. Bottom or central timeline shows unified history events with author labels "utilisateur", "assistant", "systÃ¨me".
Required UI text (French, verbatim): "Nova Labs", "DÃ©veloppeur IA en alternance", "Entretien", "Axe : DÃ©veloppeur IA", "Voir l'offre", "Modifier", "GÃ©nÃ©rer une nouvelle version", "RÃ©sumÃ© de l'offre", "Offre complÃ¨te", "Fichiers gÃ©nÃ©rÃ©s", "CV", "Lettre de motivation", "Message d'approche", "Historique", "Relances", "Entretiens", "Notes", "Contact interne".
Details: no dedicated ambiguous "Action assistant IA" section; AI changes appear in the general timeline with author "assistant".
Constraints: no score, no marketing layout, no excessive card nesting, no purple, no watermark, no extra text.
```

## 18 - DÃ©tail candidature mobile

```text
Use case: ui-mockup
Asset type: high-fidelity mobile application-detail screen
Primary request: Design BotJob's mobile detail view for a job application, portrait 1088x2304, no phone frame.
Style/medium: premium dark case-management UI, carbon and graphite, blue primary action, teal AI history markers, amber follow-ups, Lucide-style icons.
Composition/framing: compact sticky case header with back button, role, company and status. Below, segmented tabs: "AperÃ§u", "Fichiers", "Historique", "Suivi". Show the "AperÃ§u" tab with offer summary, key metadata, contact and next action. Include sticky bottom actions "Modifier" and "Nouvelle version". Full offer text opens via an accordion.
Required UI text (French, verbatim): "DÃ©veloppeur IA en alternance", "Nova Labs", "Entretien", "AperÃ§u", "Fichiers", "Historique", "Suivi", "Voir l'offre", "RÃ©sumÃ© de l'offre", "Contact interne", "Prochaine action", "Modifier", "Nouvelle version".
Bottom navigation may remain visible but visually secondary.
Constraints: do not squeeze every desktop panel into one mobile screen, no score, no purple, no watermark, no extra text.
```

## 19 - Studio IA desktop

```text
Use case: ui-mockup
Asset type: high-fidelity desktop AI workspace
Primary request: Design BotJob's desktop "Studio IA", the workspace that teaches the assistant about the candidate. Straight-on 2048x1440 private SaaS screenshot.
Style/medium: premium dark modular workspace, carbon canvas, graphite movable panels, blue standard actions, teal AI actions, amber future/experimental states, subtle grid alignment, Lucide-style brain, target, template, timeline, upload/import and automation icons.
Composition/framing: fixed left app sidebar with "Studio IA" active. Main workspace contains four modular sections that look movable, collapsible and resizable without becoming floating glass cards: "Profil maÃ®tre IA", "Axes de recherche", "Templates", "Scrappeur BotJob". Give "Profil maÃ®tre IA" the largest area with structured subsections and a local AI chat. Show a life-trace timeline. Axes are compact editable rows. Templates show CV and letter thumbnails with ATS badges. Scrappeur BotJob is clearly marked as future and disabled.
Required UI text (French, verbatim): "Studio IA", "Profil maÃ®tre IA", "Axes de recherche", "Templates", "Scrappeur BotJob", "RÃ©cupÃ©rer mes donnÃ©es depuis une autre IA", "Projets personnels", "ExpÃ©riences", "CompÃ©tences professionnelles", "Trace de vie", "Ajouter un axe", "Template par dÃ©faut", "BientÃ´t disponible".
Details: explain through structure, not long onboarding text. The page is optional and non-blocking.
Constraints: do not call it onboarding or workspace, no giant free-text field, no 30 rigid forms, no active scraper controls in V1, no purple, no watermark, no extra text.
```

## 20 - Studio IA mobile

```text
Use case: ui-mockup
Asset type: high-fidelity mobile AI workspace
Primary request: Design BotJob's mobile "Studio IA", portrait 1088x2304, no phone frame.
Style/medium: premium dark modular product UI, carbon and graphite, teal AI indicators, blue normal actions, amber future states, clear Lucide-style icons.
Composition/framing: top title, then an internal section navigator showing four large icon+text rows: "Profil maÃ®tre IA", "Axes de recherche", "Templates", "Scrappeur BotJob". Show "Profil maÃ®tre IA" selected and opened as a full mobile panel with a close/back action. Within it, display structured expandable sections, a compact life-trace timeline and a local assistant input. Do not show all four desktop panels simultaneously.
Required UI text (French, verbatim): "Studio IA", "Profil maÃ®tre IA", "Axes de recherche", "Templates", "Scrappeur BotJob", "Trace de vie", "Ajouter une information", "Demander Ã  l'assistant", "RÃ©cupÃ©rer mes donnÃ©es depuis une autre IA".
Bottom navigation: "Dashboard", "CrÃ©er", "Candidatures", "Menu".
Constraints: no desktop grid compressed into mobile, no active scraper controls, no purple, no watermark, no extra text.
```

## 21 - Settings desktop

```text
Use case: ui-mockup
Asset type: high-fidelity desktop SaaS settings screen
Primary request: Design BotJob's desktop settings page. Straight-on 2048x1440 authenticated SaaS screenshot.
Style/medium: premium dark administrative UI, carbon background, graphite content, blue save actions, teal safe/connected states, amber warnings and restrained red danger zone. Precise typography, Lucide-style palette, user, shield, database, power and credit-card icons.
Composition/framing: fixed app sidebar. Inside settings, add a secondary vertical settings navigation with icon+text sections: "Apparence", "Compte", "SÃ©curitÃ©", "DonnÃ©es", "DÃ©sactivation", "Paiement". Show "SÃ©curitÃ©" selected. Main content contains password change, active sessions with browser/device details, Google and Apple OAuth connections, and revoke-session controls. Sensitive actions must be clearly separated.
Required UI text (French, verbatim): "Settings", "Apparence", "Compte", "SÃ©curitÃ©", "DonnÃ©es", "DÃ©sactivation", "Paiement", "Modifier le mot de passe", "Sessions actives", "Chrome sur Windows", "Safari sur iPhone", "DÃ©connecter cette session", "Google connectÃ©", "Apple non connectÃ©", "Enregistrer".
Details: AI assistant is not allowed to modify any content on this page; show a discreet lock note if useful.
Constraints: no fake active online payment checkout, no casual account deletion button, no purple, no huge cards, no watermark, no extra text.
```

## 22 - Settings mobile

```text
Use case: ui-mockup
Asset type: high-fidelity mobile SaaS settings screen
Primary request: Design BotJob's mobile settings page, portrait 1088x2304, no phone frame.
Style/medium: premium dark administrative UI, carbon and graphite, blue actions, teal connected states, amber warnings, red only for danger actions, Lucide-style icons.
Composition/framing: top back button and "Settings" title. First show an icon+text list of sections: "Apparence", "Compte", "SÃ©curitÃ©", "DonnÃ©es", "DÃ©sactivation", "Paiement". Show the "SÃ©curitÃ©" section opened beneath or as the active full-page panel with password, sessions and OAuth controls. Use mobile accordions or stacked rows, not a desktop settings sidebar.
Required UI text (French, verbatim): "Settings", "SÃ©curitÃ©", "Modifier le mot de passe", "Sessions actives", "Chrome sur Windows", "DÃ©connecter", "Google connectÃ©", "Apple non connectÃ©", "Enregistrer".
Details: clear dangerous-action styling, safe-area spacing, touch-friendly icon rows. The assistant cannot modify account, phone, email, password, security or payment.
Constraints: no desktop sidebar compressed into mobile, no payment checkout, no purple, no watermark, no extra text.
```

## Prompt bonus - Menu mobile plein Ã©cran

```text
Use case: ui-mockup
Asset type: high-fidelity mobile full-screen navigation overlay
Primary request: Design BotJob's authenticated mobile menu overlay, portrait 1088x2304, no phone frame. The overlay covers the current page completely and can close to return to the previous page.
Style/medium: premium dark SaaS navigation, carbon background, graphite active row, electric blue focus outline, clean Lucide-style icons plus text.
Composition/framing: close icon in the top-right, BotJob wordmark, then three clearly separated groups. Main: "Dashboard", "CrÃ©er CV/LDM/message", "Tableau de suivi candidatures", "Studio IA". Preferences: "Settings", "Compte", "SÃ©curitÃ©", "Paiement". Help: "FAQ", "Tutoriel". Every entry has a meaningful outline icon and a short secondary description.
Required UI text (French, verbatim): "Menu", "Dashboard", "CrÃ©er CV/LDM/message", "Tableau de suivi candidatures", "Studio IA", "PrÃ©fÃ©rences", "Settings", "Compte", "SÃ©curitÃ©", "Paiement", "Aide", "FAQ", "Tutoriel".
Constraints: no hamburger menu still visible behind overlay, no desktop sidebar, no purple, no watermark, no extra text.
```
