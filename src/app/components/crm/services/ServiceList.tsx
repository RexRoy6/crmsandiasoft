"use client";

import ServiceCard from
"./ServiceCard";

export default function ServiceList({

    services,

    loading,

}: {
    services: any[];

    loading: boolean;
}) {

    if (loading) {
        return <p>Loading services...</p>;
    }

    if (services.length === 0) {
        return <p>No services found.</p>;
    }

    return (

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
            }}
        >

            {services.map((service) => (

                <ServiceCard
                    key={service.id}
                    service={service}
                />
            ))}

        </div>
    );
}