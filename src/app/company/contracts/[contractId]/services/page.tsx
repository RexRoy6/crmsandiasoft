"use client";

import { useParams } from "next/navigation";

import EventInfoCard from "@/app/components/crm/EventInfoCard";

import PageHeader from "@/app/components/crm/PageHeader";

import ErrorBox from "@/app/components/ErrorBox";

import ContractServiceForm
from "@/app/components/crm/contracts/ContractServiceForm";

import ContractServicesList
from "@/app/components/crm/contracts/ContractServicesList";

import {
  useContractServices
} from "@/app/hooks/contracts/useContractServices";

export default function ContractServicesPage() {

  const params = useParams();

  const contractId =
    Number(params.contractId);

  const {
    services,
    companyServices,
    contract,

    loading,

    error,
    errorCode,

    createService,
    deleteItem,
    updateItem,
  } = useContractServices(contractId);

  const contractTotal =
    services.reduce((sum, item) => {
      return (
        sum +
        Number(item.quantity) *
        Number(item.unitPrice)
      );
    }, 0);

  return (
    <div>

      {contract?.eventId && (
        <EventInfoCard
          eventId={contract.eventId}
        />
      )}

      <PageHeader
        title={`Contract ${contractId} Services`}
      />

      <p>
        Contract Total: ${contractTotal}
      </p>

  <ContractServiceForm
    companyServices={companyServices}
    contract={contract}
    onSubmit={createService}
/>

      {error && (
        <ErrorBox
          message={error}
          code={errorCode}
        />
      )}

      <ContractServicesList
        services={services}
        loading={loading}
        onDelete={deleteItem}
        onUpdate={updateItem}
      />

    </div>
  );
}