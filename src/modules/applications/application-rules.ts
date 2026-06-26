export type ApplicationActionState = {
  lastAction: string;
  nextAction: string;
};

export type JobAxisRule = {
  title: string;
  contractTypes: string[];
  locations: Array<{ label?: string | null }>;
};

export function applyManualLastAction(
  state: ApplicationActionState,
  newLastAction: string,
): ApplicationActionState {
  return {
    lastAction: newLastAction.trim(),
    nextAction: "",
  };
}

export function buildApplicationSearchText(parts: Array<string | null | undefined>): string {
  return parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function buildJobAxisMismatchWarnings(
  axis: JobAxisRule | null,
  application: {
    contractType?: string | null;
    locationLabel?: string | null;
    fullOfferText?: string | null;
  },
): string[] {
  if (!axis) return [];

  // ponytail: cheap text matching is enough for a V1 warning; upgrade to structured parsing if false positives become noisy.
  const offerText = normalizeText(
    [application.contractType, application.locationLabel, application.fullOfferText]
      .filter(Boolean)
      .join(" "),
  );
  const warnings: string[] = [];

  if (axis.contractTypes.length && !axis.contractTypes.some((contractType) => offerText.includes(normalizeText(contractType)))) {
    warnings.push(`L'offre ne semble pas correspondre aux contrats de l'axe ${axis.title}.`);
  }

  const axisLocations = axis.locations
    .map((location) => normalizeText(location.label))
    .filter(Boolean);

  if (axisLocations.length && !axisLocations.some((location) => offerText.includes(location))) {
    warnings.push(`L'offre ne semble pas correspondre aux localisations de l'axe ${axis.title}.`);
  }

  return warnings;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
