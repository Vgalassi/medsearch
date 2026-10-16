import { formatDay } from "../utils/formatDay";
import { AvailableHour, modeLabels } from "@/app/patient/home/[id]/[appointment]/page";
type AppointmnetHoursCardProps = {
    selectedDay: string | null, 
    isFetchingHours: boolean,
    hours: AvailableHour[],
    selectedHour: AvailableHour | null,
    handleHourSelection: (hour: AvailableHour) => void
}



export default function AppointmentHoursCard({selectedDay,isFetchingHours,hours,selectedHour, handleHourSelection }: AppointmnetHoursCardProps){


    return(
        <aside className="surface p-5">
            <p className="section-kicker">Horários</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              {selectedDay ? formatDay(selectedDay,"long") : "Selecione um dia"}
            </h2>

            {isFetchingHours && (
              <p className="mt-5 rounded-md border border-teal-100 bg-teal-50 px-4 py-3 text-teal-800">
                Carregando horários...
              </p>
            )}

            {!isFetchingHours && selectedDay && hours.length === 0 && (
              <p className="mt-5 text-sm text-slate-600">
                Nenhum horário disponível para este dia.
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              {hours.map((hour,index) => (
                <button
                  className={`rounded-md border px-4 py-3 text-left transition cursor-pointer ${
                    selectedHour?.startTime === hour.startTime
                      ? "border-teal-700 bg-teal-700 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50"
                  }`}
                  key={index}
                  onClick={() => {
                    handleHourSelection(hour)
                  }}
                  type="button"
                >
                  <span className="block text-sm font-bold">{hour.startTime}</span>
                  <span className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                    hour.mode === "ONLINE"
                      ? "bg-sky-50 text-sky-700"
                      : hour.mode === "OFFLINE"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                  }`}>
                    {modeLabels[hour.mode]}
                  </span>
                </button>
              ))}
            </div>
        
        </aside>
    )
}