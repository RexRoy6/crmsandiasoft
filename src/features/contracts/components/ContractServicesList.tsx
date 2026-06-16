"use client";

import ContractItemCard
    from "@/app/components/crm/ContractItemCard";

type Props = {
    services: any[];

    loading: boolean;

    onDelete: (
        itemId: number
    ) => Promise<void>;

    onUpdate: (
        itemId: number,
        data: any
    ) => Promise<void>;
};

export default function ContractServicesList({
    services,
    loading,
    onDelete,
    onUpdate,
}: Props) {

    if (loading) {
        return (
            <p>
                Loading services...
            </p>
        );
    }

    if (services.length === 0) {
        return (
            <p>
                No services added yet.
            </p>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
            }}
        >

            {services.map((item) => (

                <ContractItemCard
                    key={item.id}
                    item={item}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                />

            ))}

        </div>
    );
}