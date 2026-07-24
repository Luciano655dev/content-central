import type { AutomationState } from "./automation";

export const AUTOMATION_STATE_EVENT = "content-central:automation-state";

export function publishAutomationState(state: AutomationState) {
  window.dispatchEvent(new CustomEvent<AutomationState>(AUTOMATION_STATE_EVENT, { detail: state }));
}
