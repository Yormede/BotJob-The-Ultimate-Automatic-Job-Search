import { buildApplicationSearchText } from "../../../../../src/modules/applications/application-rules";
import type {
  ApplicationEventInput,
  ApplicationInput,
  ApplicationPatchInput,
} from "./applications.repository";

export const APPLICATION_STATUSES = [
  "draft",
  "sent",
  "follow_up",
  "interview",
  "accepted",
  "rejected",
  "archived",
] as const;

export const APPLICATION_EVENT_TYPES = [
  "last_action",
  "next_action",
  "follow_up",
  "interview",
  "note",
  "status_change",
] as const;

export const APPLICATION_EVENT_AUTHORS = ["user", "assistant", "system"] as const;

export function normalizeApplicationInput(body: Record<string, unknown>): ApplicationInput {
  const company = requireText(body.company, "entreprise");
  const jobTitle = requireText(body.jobTitle, "poste");
  const fullOfferText = requireText(body.fullOfferText, "annonce");
  const status = optionalEnum(body.status, APPLICATION_STATUSES, "statut") ?? "draft";
  const appliedAt = optionalDate(body.appliedAt, "date de candidature");
  const offerUrl = optionalText(body.offerUrl);
  if (offerUrl && !isValidUrl(offerUrl)) throw new Error("URL d'offre invalide");

  const input: ApplicationInput = {
    jobAxisId: optionalText(body.jobAxisId),
    company,
    jobTitle,
    offerUrl,
    fullOfferText,
    locationLabel: optionalText(body.locationLabel),
    contractType: optionalText(body.contractType),
    status,
    appliedAt,
    searchText: "",
  };

  return { ...input, searchText: applicationSearchText(input) };
}

export function normalizeApplicationPatch(
  current: ApplicationInput,
  body: Record<string, unknown>,
): ApplicationInput {
  const patch: ApplicationPatchInput = {};

  if ("jobAxisId" in body) patch.jobAxisId = optionalText(body.jobAxisId);
  if ("company" in body) patch.company = requireText(body.company, "entreprise");
  if ("jobTitle" in body) patch.jobTitle = requireText(body.jobTitle, "poste");
  if ("offerUrl" in body) {
    patch.offerUrl = optionalText(body.offerUrl);
    if (patch.offerUrl && !isValidUrl(patch.offerUrl)) throw new Error("URL d'offre invalide");
  }
  if ("fullOfferText" in body) patch.fullOfferText = requireText(body.fullOfferText, "annonce");
  if ("locationLabel" in body) patch.locationLabel = optionalText(body.locationLabel);
  if ("contractType" in body) patch.contractType = optionalText(body.contractType);
  if ("status" in body) patch.status = optionalEnum(body.status, APPLICATION_STATUSES, "statut");
  if ("appliedAt" in body) patch.appliedAt = optionalDate(body.appliedAt, "date de candidature");

  const merged = { ...current, ...patch };
  return { ...merged, searchText: applicationSearchText(merged) };
}

export function normalizeEventInput(body: Record<string, unknown>): ApplicationEventInput {
  return {
    eventType: optionalEnum(body.eventType, APPLICATION_EVENT_TYPES, "type d'evenement") ?? "note",
    label: requireText(body.label, "libelle"),
    state: optionalText(body.state) ?? "active",
    author: optionalEnum(body.author, APPLICATION_EVENT_AUTHORS, "auteur") ?? "user",
    eventAt: optionalDate(body.eventAt, "date d'evenement"),
  };
}

function applicationSearchText(input: ApplicationInput) {
  return buildApplicationSearchText([
    input.company,
    input.jobTitle,
    input.locationLabel,
    input.contractType,
    input.status,
  ]);
}

function requireText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} requis`);
  }

  return value.trim();
}

function optionalText(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new Error("champ texte invalide");
  return value.trim() || null;
}

function optionalDate(value: unknown, label: string) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new Error(`${label} invalide`);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} invalide`);
  return date;
}

function optionalEnum<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  label: string,
): T[number] | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new Error(`${label} invalide`);
  }

  return value;
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
