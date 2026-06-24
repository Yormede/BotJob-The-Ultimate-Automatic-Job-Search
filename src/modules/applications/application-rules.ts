export type ApplicationActionState = {
  lastAction: string;
  nextAction: string;
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
