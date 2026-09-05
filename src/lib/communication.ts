export interface CommunicationOption { id: string; label: string; message: string; urgent?: boolean; angle: number; }
export const COMMUNICATION_OPTIONS: CommunicationOption[] = [
  { id: "water", label: "Water", message: "I need water.", angle: -90 },
  { id: "message", label: "Message", message: "", angle: -140 },
  { id: "food", label: "Food", message: "I need food.", angle: -45 },
  { id: "no", label: "No", message: "No.", angle: 180 },
  { id: "pain", label: "Pain", message: "I am in pain.", urgent: true, angle: 0 },
  { id: "yes", label: "Yes", message: "Yes.", angle: 140 },
  { id: "help", label: "Help", message: "I need help.", urgent: true, angle: 35 },
  { id: "bathroom", label: "Bathroom", message: "I need to use the bathroom.", angle: 125 },
  { id: "adjust-bed", label: "Adjust Bed", message: "Please adjust my bed.", angle: 90 },
  { id: "call-caregiver", label: "Call Caregiver", message: "Please call my caregiver.", angle: 55 },
];
