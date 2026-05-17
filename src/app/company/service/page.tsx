"use client";

import ErrorBox from "@/app/components/ErrorBox";

import PageHeader from "@/app/components/crm/PageHeader";

import ServiceCreateForm from
"@/app/components/crm/services/ServiceCreateForm";

import ServiceList from
"@/app/components/crm/services/ServiceList";

import { useCompanyServices }
from "@/app/hooks/services/useCompanyServices";

export default function ServicesPage() {

    const {

        services,

        loading,

        error,

        errorCode,

        createService,

    } = useCompanyServices();

    return (

        <div>

            <PageHeader
                title="Services"
                buttonLabel="+ New Service"
            />

            {error && (
                <ErrorBox
                    message={error}
                    code={errorCode}
                />
            )}

            <ServiceCreateForm
                onSubmit={createService}
            />

            <ServiceList
                services={services}
                loading={loading}
            />

        </div>
    );
}