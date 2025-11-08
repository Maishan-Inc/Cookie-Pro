import type { ConsentChoices } from "@/lib/validation";
import { NECESSARY_ONLY_EVENTS } from "@/lib/constants";

export function filterEventsByConsent({
  events,
  consent,
}: {
  events: Array<{
    type: string;
    purpose?: string;
  } & Record<string, unknown>>;
  consent: ConsentChoices | null;
}) {
  return events.filter((event) => {
    if (!consent) {
      return NECESSARY_ONLY_EVENTS.has(event.type);
    }

    if (!event.purpose) return true;
    const allowed = consent[event.purpose as keyof ConsentChoices];
    if (typeof allowed === "boolean") {
      return allowed;
    }
    return false;
  });
}
