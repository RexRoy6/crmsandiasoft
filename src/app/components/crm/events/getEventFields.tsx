import type { Field }
    from "@/app/components/crm/CreateForm";

import ClientSelector
    from "@/app/components/crm/clients/ClientSelector";

import {
    formatDate,
} from "@/lib/utils/date";
import type {
    EventFormState,
} from "@/types/forms/eventForm";


interface Props {
    form: EventFormState;

    setForm: React.Dispatch<
        React.SetStateAction<EventFormState>
    >;
}

export function getEventFields({
    form,
    setForm,
}: Props): Field[] {

    return [
        {
            name: "clientId",

            label: "Client",
            hideInput: true,
            readOnly: true,

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
            label: "Event Name",
        },

        {
            name: "eventDate",

            label: "Event Date",

            type: "date",

            after: (
                <p
                    style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        marginTop: 4,
                    }}
                >
                    {form.eventDate
                        ? `📅 Fecha seleccionada: ${formatDate(form.eventDate)}`
                        : "📅 Selecciona una fecha"}
                </p>
            ),
        },
        {
            name: "eventStart",
            label: "Hora Inicio",
            type: "time",
        },

        {
            name: "eventEnd",
            label: "Hora Final",
            type: "time",
        },

        {
            name: "location",
            label: "Location",
        },

        {
            name: "notes",
            label: "Notes",
            type: "textarea",
        },
    ];
}