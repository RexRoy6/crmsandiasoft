import type { Field } from "@/app/components/crm/CreateForm";
import ClientSelector from "@/app/components/crm/clients/ClientSelector";
import { formatDate } from "@/lib/utils/date";
import type { EventFormState } from "@/types/forms/eventForm";
import { Calendar } from "lucide-react";

interface Props {
  form: EventFormState;
  setForm: React.Dispatch<React.SetStateAction<EventFormState>>;
}

export function getEventFields({ form, setForm }: Props): Field[] {
  return [
    {
      name: "clientId",
      label: "Cliente",
      hideInput: true,
      readOnly: true,
      required: true,
      fullWidth: true, // Ocupa las 2 columnas (100%)
      after: (
        <ClientSelector
          selected={form.client}
          onSelect={(client) => {
            setForm((prev) => ({
              ...prev,
              clientId: String(client.id),
              client: {
                id: client.id,
                name: client.name,
                phone: client.phone,
              },
            }));
          }}
          onClear={() => {
            setForm((prev) => ({
              ...prev,
              clientId: "",
              client: undefined,
            }));
          }}
        />
      ),
    },
    {
      name: "name",
      label: "Nombre del Evento",
      required: true,
      fullWidth: true, // Ocupa las 2 columnas para escribir nombres largos
    },
    {
      name: "eventDate",
      label: "Fecha del Evento",
      type: "date",
      required: true,
      // Al no tener fullWidth, ocupará 1 columna (50%)
      after: (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-gray-500">
          <Calendar size={14} className="text-gray-400" />
          {form.eventDate
            ? `Fecha confirmada: ${formatDate(form.eventDate)}`
            : "Selecciona un día en el calendario"}
        </div>
      ),
    },
    {
      name: "location",
      label: "Ubicación (Lugar)",
      required: true,
      // Ocupará la columna de al lado de la fecha (50%)
    },
    {
      name: "eventStart",
      label: "Hora de Inicio",
      type: "time",
      // Ocupará 1 columna
    },
    {
      name: "eventEnd",
      label: "Hora de Finalización",
      type: "time",
      // Ocupará la otra columna
    },
    {
      name: "notes",
      label: "Notas Adicionales",
      type: "textarea",
      fullWidth: true, // El textarea siempre debe ocupar 100%
    },
  ];
}