"use client";

import { useState } from "react";

import CreateForm, {
    Field
} from "@/app/components/crm/CreateForm";

export default function ServiceCreateForm({

    onSubmit,

}: {
    onSubmit: (form: any) => Promise<boolean>;
}) {

    const [showForm, setShowForm] =
        useState(false);

    const [form, setForm] = useState({

        name: "",

        description: "",

        stockTotal: 1,

        priceBase: "",
    });

    const fields: Field[] = [

        {
            name: "name",
            label: "Name",
        },

        {
            name: "description",
            label: "Description",
        },

        {
            name: "stockTotal",
            label: "Stock",
            type: "number",
        },

        {
            name: "priceBase",
            label: "Base Price",
        },
    ];

    async function handleSubmit() {

        const ok = await onSubmit(form);

        if (!ok) return;

        setShowForm(false);

        setForm({

            name: "",

            description: "",

            stockTotal: 1,

            priceBase: "",
        });
    }

    return (

        <>

            <button
                onClick={() => setShowForm(true)}
            >
                + New Service
            </button>

            {showForm && (

                <CreateForm
                    title="Create Service"
                    fields={fields}
                    form={form}
                    setForm={setForm}
                    onSubmit={handleSubmit}
                    onCancel={() =>
                        setShowForm(false)
                    }
                />
            )}
        </>
    );
}