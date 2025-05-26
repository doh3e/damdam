import Modal from './modal';

export default function AlertModal({
  message,
  submessage,
  onClose,
}: {
  message: string;
  submessage?: string;
  onClose: () => void;
}) {
  return <Modal message={message} submessage={submessage ?? ''} onClose={onClose} />;
}
