import { useEffect,useState } from "react";
import { API_BASE_URL } from "../appConfig";
type AppointmentDaysCardProps = {
  groupedDays: Record<string, string[]>;
  selectedDay: string | null;
  handleDateSelection: (day: string) => void;
};

function formatDay(value: string, lenght: "short" | "long" | "narrow" | undefined) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: lenght,
    day: "2-digit",
    timeZone: "UTC"
  }).format(new Date(value));
}


export default function AppointmentDaysCard({groupedDays,selectedDay,handleDateSelection}: AppointmentDaysCardProps){
    return(
        
        <div className="mt-5 space-y-5">
              {Object.entries(groupedDays).map(([month, monthDays]) => (
                <div className="surface p-5" key={month}>
                  <h3 className="text-lg font-bold capitalize text-slate-950">
                    {month}
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    
                    {monthDays.map((day) => (
                      <button
                        className={`rounded-md border px-4 py-3 text-left text-sm font-semibold transition cursor-pointer ${
                          selectedDay === day
                            ? "border-teal-700 bg-teal-700 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                        }`}
                
                        key={day}
                        onClick={() => handleDateSelection(day)}
                        type="button"
                      >
                    {formatDay(day,"short")} 
                      </button>
                    ))}
                  </div>
                 
                </div>
              ))}
            </div>
    );


}