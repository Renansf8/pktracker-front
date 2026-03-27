import { Button } from "@/components/ui/button";
import ReactModal from "react-modal";

interface ImportScheduleModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onRequestClose: () => void;
  onConfirm: () => void;
}

export const ImportScheduleModal = ({
  isOpen,
  isLoading,
  onRequestClose,
  onConfirm,
}: ImportScheduleModalProps) => {
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
          width: "420px",
          maxWidth: "90%",
          border: "none",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <div className="text-text-primary text-center text-lg font-bold">
        Deseja adicionar toda a grade de torneios de hoje?
      </div>
      <p className="mt-2 text-center text-sm text-zinc-600">
        Isso vai criar todos os torneios da grade usando a data atual e o
        horario configurado em cada item.
      </p>
      <div className="mt-5 flex justify-around gap-2">
        <Button
          className="font-bold"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Adicionando..." : "Sim, adicionar"}
        </Button>
        <Button
          className="font-bold bg-[#ffffff]"
          variant="secondary"
          onClick={onRequestClose}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </ReactModal>
  );
};

