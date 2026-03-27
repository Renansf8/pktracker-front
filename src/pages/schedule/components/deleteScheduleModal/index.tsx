import { Button } from "@/components/ui/button";
import ReactModal from "react-modal";

interface DeleteScheduleModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onDelete: () => void;
}

export const DeleteScheduleModal = ({
  isOpen,
  onRequestClose,
  onDelete,
}: DeleteScheduleModalProps) => {
  const handleDelete = () => {
    onDelete();
    onRequestClose();
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      ariaHideApp={false}
      style={{
        overlay: {
          backgroundColor: "rgba(243, 243, 243, 0.555)",
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        content: {
          backgroundColor: "#363636",
          position: "relative",
          inset: "auto",
          background: "white",
          padding: "24px",
          borderRadius: "8px",
          width: "400px",
          maxWidth: "90%",
          border: "none",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <div className="text-text-primary text-center text-lg font-bold">
        Tem certeza que deseja remover o torneio da grade?
      </div>
      <div className="flex gap-2 justify-around mt-4">
        <Button className="font-bold" variant="destructive" onClick={handleDelete}>
          Remover
        </Button>
        <Button
          className="font-bold bg-[#ffffff]"
          variant="secondary"
          onClick={onRequestClose}
        >
          Cancelar
        </Button>
      </div>
    </ReactModal>
  );
};

