"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ErrorBox from "@/app/components/ErrorBox";
import PageHeader from "@/app/components/crm/PageHeader";
import CreateForm from "@/app/components/crm/CreateForm";
import ListCard from "@/app/components/crm/ListCard";

export default function ContractServicesPage() {

  const params = useParams();
  const contractId = Number(params.contractId);

  const [services, setServices] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number | undefined>();

  /* create form */

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    serviceId: "",
    quantity: "",
    unitPrice: "",
  });

  const fields = [
    { name: "serviceId", label: "Service ID", type: "number" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "unitPrice", label: "Unit Price", type: "number" },
  ];

  /* ---------- FETCH SERVICES ---------- */

  const fetchServices = async () => {

    try {

      setLoading(true);

      const res = await fetch(
        `/api/company/contracts/${contractId}/services`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        setError("Failed to fetch services");
        setErrorCode(res.status);
        return;
      }

      const data = await res.json();

      setServices(data);

    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- CREATE SERVICE ---------- */

  const createService = async () => {

    try {

      const res = await fetch(
        `/api/company/contracts/${contractId}/services`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId: Number(form.serviceId),
            quantity: Number(form.quantity),
            unitPrice: Number(form.unitPrice),
          }),
        }
      );

      if (!res.ok) {

        const data = await res.json();

        if (data?.error?.fieldErrors) {
          const messages = Object.values(data.error.fieldErrors)
            .flat()
            .join(", ");

          setError(messages);
        } else {
          setError("Failed to add service");
        }

        return;
      }

      setShowForm(false);

      setForm({
        serviceId: "",
        quantity: "",
        unitPrice: "",
      });

      fetchServices();

    } catch {
      setError("Connection error");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div>

      <PageHeader
        title={`Contract ${contractId} Services`}
        buttonLabel="+ Add Service"
        onClick={() => setShowForm(true)}
      />

      {showForm && (

        <CreateForm
          title="Add Service to Contract"
          fields={fields}
          form={form}
          setForm={setForm}
          onSubmit={createService}
          onCancel={() => setShowForm(false)}
        />

      )}

      {error && <ErrorBox message={error} code={errorCode} />}

      {loading && <p>Loading services...</p>}

      {!loading && services.length === 0 && (
        <p>No services added yet.</p>
      )}

      {!loading && services.length > 0 && (

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >

          {services.map((item) => {

            const subtotal =
              Number(item.quantity) *
              Number(item.unitPrice);

            return (

              <ListCard
                key={item.id}
                title={`Service ${item.serviceId}`}
                extra={[
                  `Quantity: ${item.quantity}`,
                  `Unit Price: $${item.unitPrice}`,
                  `Subtotal: $${subtotal}`,
                ]}
                link={`/company/contracts/${contractId}/services/${item.id}`}
              />

            );
          })}

        </div>

      )}

    </div>
  );
}