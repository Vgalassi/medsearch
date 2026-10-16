import { useState } from "react";
import { AvailableHour, AppointmentType  } from "@/app/patient/home/[id]/[appointment]/page"
import { Doctor } from "../types/Doctor";
import { formatDay } from "../utils/formatDay";
const typeLabels: Record<AppointmentType, string> = {
  ONLINE: "Online",
  OFFLINE: "Presencial",
};

type AppointmentConfimatiomModalProps = {
    selectedDay: string,
    selectedHour: AvailableHour,
    doctor: Doctor | null,
    isCreating: boolean,
    createAppointment: (appointmentType: AppointmentType ) => void
    handleCloseModal: () => void


}

export function AppointmentConfirmationModal({selectedDay, selectedHour, doctor,isCreating,createAppointment, handleCloseModal }: AppointmentConfimatiomModalProps){
    const [selectedType, setSelectedType] = useState<AppointmentType>("OFFLINE");
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
        <div className="surface w-full max-w-md p-6 shadow-xl">
            <p className="section-kicker">Confirmar consulta</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Agendar para {selectedHour.startTime}?
            </h2>
            <p className="mt-3 text-slate-600">
            A consulta será criada para {formatDay(selectedDay,"long")} com{" "}
            {doctor?.name ?? "este médico"}.
            </p>
            {selectedHour.mode === "BOTH" ? (
            <label className="mt-5 block">
                <span className="label">Tipo de consulta</span>
                <select
                className="input"
                onChange={(event) =>
                    setSelectedType(event.target.value as AppointmentType)
                }
                value={selectedType}
                >
                <option value="OFFLINE">Presencial</option>
                <option value="ONLINE">Online</option>
                </select>
            </label>
            ) : (
            <p className="mt-5 inline-flex rounded-md bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
                {typeLabels[selectedType]}
            </p>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
                className="btn-secondary cursor-pointer"
                onClick={() => handleCloseModal()}
                type="button"
            >
                Voltar
            </button>
            <button
                className="btn-primary cursor-pointer"
                disabled={isCreating}
                onClick={() => createAppointment(selectedType)}
                type="button"
            >
                {isCreating ? "Agendando..." : "Confirmar"}
            </button>
            </div>
        </div>
        </div>

    )

}