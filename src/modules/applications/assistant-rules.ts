export type AssistantDecision =
  | { kind: "event"; eventType: "next_action" | "follow_up" | "interview" | "status_change" | "note"; label: string }
  | { kind: "forbidden"; message: string }
  | { kind: "unknown"; message: string };

export function assistantDecisionFromPrompt(prompt: string): AssistantDecision {
  const normalized = prompt.trim().replace(/\s+/g, " ");
  const lower = normalized.toLowerCase();

  if (!normalized) return { kind: "unknown", message: "Demande vide." };
  if (/(email|mot de passe|t[eé]l[eé]phone|paiement|supprim|d[eé]sactiv)/.test(lower)) {
    return {
      kind: "forbidden",
      message: "Je ne peux pas modifier les donnees sensibles du compte. Passez par Settings pour cette action.",
    };
  }
  if (/(entretien|interview)/.test(lower)) return { kind: "event", eventType: "interview", label: normalized };
  if (/(refus|refus[eé]|rejet|rejet[eé])/.test(lower)) return { kind: "event", eventType: "status_change", label: normalized };
  if (/(relance|relancer|follow.?up)/.test(lower)) return { kind: "event", eventType: "follow_up", label: normalized };
  if (/(prochaine action|next action|faire ensuite|a faire|à faire)/.test(lower)) return { kind: "event", eventType: "next_action", label: normalized };
  if (/(note|remarque)/.test(lower)) return { kind: "event", eventType: "note", label: normalized };

  return {
    kind: "unknown",
    message: "Je peux ajouter une relance, un entretien, un refus, une note ou une prochaine action sur la candidature selectionnee.",
  };
}
