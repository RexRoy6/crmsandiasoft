"use client";

import { useState } from "react";

import PageHeader from "@/app/components/crm/PageHeader";
import SearchBar from "@/app/components/crm/SearchBar";
import ErrorBox from "@/app/components/ErrorBox";
import Pagination from "@/app/components/crm/Pagination";

import PaymentForm from "@/app/components/crm/payments/PaymentForm";
import PaymentList from "@/app/components/crm/payments/PaymentList";

import { useCompanyPayments } from "@/app/hooks/useCompanyPayments";


export default function PaymentsPage() {

 const {
  payments,
  loading,
  error,
  errorCode,
  pagination,
  search,
  setSearch,
  page,
  setPage,
  fetchPayments,
} = useCompanyPayments();

  return (
    <div>
      <PageHeader
        title="Company Payments"
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by client or event"
      />

      <p style={{ fontSize: 12, color: "#6b7280" }}>
        {pagination?.total ?? 0} payments found
      </p>

      {/* reutilizable */}
      <PaymentForm onSuccess={fetchPayments} />

      {error && <ErrorBox message={error} code={errorCode} />}

      {loading ? (
        <p>Loading payments...</p>
      ) : (
        <PaymentList payments={payments} />
      )}

      {pagination && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}