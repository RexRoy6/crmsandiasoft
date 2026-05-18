"use client";

import { useState } from "react";
import PageHeader from "@/app/components/crm/PageHeader";
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
            <PageHeader
                title={`Create service 👉`}
                buttonLabel="+ Create Service"
                onClick={() => {
                    setShowForm(true);
                }}
            />
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