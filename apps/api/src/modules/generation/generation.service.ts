import type { ApplicationForGeneration, GeneratedDocumentInput } from "./generation.repository";

export type GenerationInput = {
  includeCv: boolean;
  includeCoverLetter: boolean;
  includeApproachMessage: boolean;
  cvTemplateId: string | null;
  coverLetterTemplateId: string | null;
};

export function normalizeGenerationInput(body: Record<string, unknown> | null): GenerationInput {
  const input = {
    includeCv: optionalBoolean(body?.includeCv) ?? true,
    includeCoverLetter: optionalBoolean(body?.includeCoverLetter) ?? true,
    includeApproachMessage: optionalBoolean(body?.includeApproachMessage) ?? true,
    cvTemplateId: optionalId(body?.cvTemplateId),
    coverLetterTemplateId: optionalId(body?.coverLetterTemplateId),
  };

  if (!input.includeCv && !input.includeCoverLetter && !input.includeApproachMessage) {
    throw new Error("au moins un document est requis");
  }

  return input;
}

export function buildGeneratedDocuments(
  application: ApplicationForGeneration,
  input: GenerationInput,
): GeneratedDocumentInput[] {
  const docs: GeneratedDocumentInput[] = [];
  if (input.includeCv) docs.push({ ...renderCv(application), templateId: input.cvTemplateId });
  if (input.includeCoverLetter) {
    docs.push({ ...renderCoverLetter(application), templateId: input.coverLetterTemplateId });
  }
  if (input.includeApproachMessage) docs.push(renderApproachMessage(application));
  return docs;
}

function renderCv(application: ApplicationForGeneration): GeneratedDocumentInput {
  const title = `CV - ${application.jobTitle} - ${application.company}`;
  const content = [
    `${application.userFirstName} ${application.userLastName}`,
    `${application.jobTitle} cible - ${application.company}`,
    "",
    "Profil",
    "Candidat fullstack oriente produit, capable de transformer un besoin en application testable et maintenable.",
    "",
    "Competences ciblees",
    "- React TypeScript SPA",
    "- Backend Bun TypeScript REST JSON",
    "- PostgreSQL, SQL, JSONB, contraintes et index",
    "- Docker, homelab, GitHub et tests automatises",
    "",
    "Adaptation a l'offre",
    shortOffer(application.fullOfferText),
  ].join("\n");

  return {
    kind: "cv",
    templateId: null,
    title,
    contentText: content,
    htmlContent: `<article><h1>${escapeHtml(application.userFirstName)} ${escapeHtml(application.userLastName)}</h1><h2>${escapeHtml(application.jobTitle)}</h2><p>${escapeHtml(shortOffer(application.fullOfferText))}</p></article>`,
    cssContent: "article{font-family:Arial,sans-serif;line-height:1.45}h1{font-size:24px}h2{font-size:16px;color:#2563eb}",
    isAtsOneColumn: true,
  };
}

function renderCoverLetter(application: ApplicationForGeneration): GeneratedDocumentInput {
  return {
    kind: "cover_letter",
    templateId: null,
    title: `Lettre - ${application.company}`,
    contentText: [
      `Bonjour,`,
      "",
      `Je vous propose ma candidature pour le poste de ${application.jobTitle}.`,
      `Votre offre chez ${application.company} correspond a mon objectif: livrer des produits web utiles, propres et testables.`,
      "",
      "Je peux contribuer sur la partie frontend React, backend TypeScript, base PostgreSQL et integration produit.",
      "",
      "Cordialement,",
      `${application.userFirstName} ${application.userLastName}`,
    ].join("\n"),
    htmlContent: null,
    cssContent: null,
    isAtsOneColumn: true,
  };
}

function renderApproachMessage(application: ApplicationForGeneration): GeneratedDocumentInput {
  return {
    kind: "approach_message",
    templateId: null,
    title: `Message - ${application.company}`,
    contentText: `Bonjour, je suis interesse par le poste de ${application.jobTitle} chez ${application.company}. J'aimerais echanger sur vos besoins et vous montrer comment mon profil fullstack peut aider votre equipe.`,
    htmlContent: null,
    cssContent: null,
    isAtsOneColumn: true,
  };
}

function optionalBoolean(value: unknown) {
  if (value == null) return undefined;
  if (typeof value !== "boolean") throw new Error("option de generation invalide");
  return value;
}

function optionalId(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new Error("template invalide");
  return value;
}

function shortOffer(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 420);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}
