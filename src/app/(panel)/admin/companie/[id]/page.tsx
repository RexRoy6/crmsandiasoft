"use client";

import { useParams } from "next/navigation";
import { useAdminCompany } from "@/modules/admin/hooks/useAdminCompany";

import CompanyHeaderCard from "@/modules/admin/components/CompanyHeaderCard";
import CompanyTabs from "@/modules/admin/components/CompanyTabs";
import ErrorBanner from "@/modules/admin/components/ErrorBanner";

export default function AdminCompanyPage() {
  const params = useParams();
  const companyId = params.id as string;

  const {
    company,
    users,
    contracts,
    loading,
    actionError,
    clearActionError,
    loadError,
    activeTab,
    setActiveTab,
    suspendConfirm,
    setSuspendConfirm,
    handleEdit,
    handleSuspend,
    createOwner,
    deactivateUser,
  } = useAdminCompany(companyId);

 if (loading) return <p>Cargando...</p>;
  if (loadError || !company) return <p>Error al cargar empresa</p>;

  return (
    <>
      <ErrorBanner error={actionError} clear={clearActionError} />

      <CompanyHeaderCard
        company={company}
        suspendConfirm={suspendConfirm}
        setSuspendConfirm={setSuspendConfirm}
        onEdit={handleEdit}
        onSuspend={handleSuspend}
      />

      <CompanyTabs
        users={users}
        contracts={contracts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCreateOwner={createOwner}
        onDeactivateUser={deactivateUser}
      />
    </>
  );
}
