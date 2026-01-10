export interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  roomName: string;
  isLoading?: boolean;
  error?: string;
}
