"use client";

import { useState } from "react";
import CreateForm, { Field } from "@/app/components/crm/CreateForm";

type Props = {
    onSubmit: (form: any) => Promise<boolean | void>;
    // Le quitamos el "?" para que TypeScript sepa que siempre recibirá una función
    onCancel: () => void;
};

export default function ServiceCreateForm({ onSubmit, onCancel }: Props) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        stockTotal: 1,
        priceBase: "",
    });

    const fields: Field[] = [
        {
            name: "name",
            label: "Nombre del Servicio",
        },
        {
            name: "description",
            label: "Descripción",
        },
        {
            name: "stockTotal",
            label: "Inventario (Stock)",
            type: "number",
        },
        {
            name: "priceBase",
            label: "Precio Base",
            type: "number",
        },
    ];

    async function handleSubmit() {
        const payload = {
            ...form,
            stockTotal: Number(form.stockTotal), 
            priceBase: String(form.priceBase),  
        };

        const result = await onSubmit(payload);

        if (result === false) return;

        setForm({
            name: "",
            description: "",
            stockTotal: 1,
            priceBase: "",
        });
    }

    return (
        <CreateForm
            title="Registrar Nuevo Servicio"
            fields={fields}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onCancel={onCancel}
        />
    );
}