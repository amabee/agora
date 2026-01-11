import type { Participant } from "./Participant"

export interface ChatParticipantsPanelProps {
  participants: Participant[]
  isOpen: boolean
  onClose: () => void  onRefresh?: () => void;
  isRefreshing?: boolean;}
