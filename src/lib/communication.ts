/** Communication menu model — pure data, no UI. */

export interface CommunicationOption {
  id: string;
  label: string;
  message: string;
  urgent?: boolean;
}

export const COMMUNICATION_OPTIONS: CommunicationOption[] = [
  { id: "water", label: "Water", message: "I would like some water, please." },
  { id: "food", label: "Food", message: "I would like something to eat, please." },
  { id: "pain", label: "Pain", message: "I am in pain. Please help me.", urgent: true },
  { id: "help", label: "Help", message: "I need help right now.", urgent: true },
  { id: "call-caregiver", label: "Call Caregiver", message: "Please call my caregiver." },
  { id: "adjust-bed", label: "Adjust Bed", message: "Please help me adjust my bed." },
  { id: "bathroom", label: "Bathroom", message: "I need to use the bathroom, please." },
  { id: "yes", label: "Yes", message: "Yes." },
  { id: "no", label: "No", message: "No." },
  { id: "message", label: "Message", message: "I would like to spell out a message." },
];
