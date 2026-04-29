"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ErrorBox from "@/app/components/ErrorBox";
import PageHeader from "@/app/components/crm/PageHeader";
import CreateForm from "@/app/components/crm/CreateForm";
import type { Field } from "@/app/components/crm/CreateForm";
import EventInfoCard from "@/app/components/crm/EventInfoCard";
import ContractItemCard from "@/app/components/crm/ContractItemCard";


export default function ContractServicesPage() {
  const params = useParams();
  const contractId = Number(params.contractId);

  const [services, setServices] = useState<any[]>([]);
  const [companyServices, setCompanyServices] = useState<any[]>([]);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [contract, setContract] = useState<any>(null);

  const [editForm, setEditForm] = useState({
    serviceId: "",
    quantity: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number | undefined>();

  /* create form */

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    serviceId: "",
    quantity: "",
    unitPrice: "",
    serviceNotes: "",
    operationStart: "",
    operationEnd: "",
  });
  const handleServiceChange = (serviceId: string) => {
    //setError("");

    const service = companyServices.find((s) => String(s.id) === serviceId);

    if (!service) return;

    setForm((prev) => ({
      ...prev,
      serviceId,
      unitPrice: String(service.priceBase), //price
    }));
  };
  const fields: Field[] = [
    {
      name: "serviceId",
      label: "Service",
      type: "select",
      options: companyServices.map((s) => ({
        value: String(s.id),
        label: `${s.name} ($${s.priceBase})`,
      })),
      onChange: handleServiceChange,
    },
    {
      name: "quantity",
      label: "Quantity",
      type: "number",
    },
    {
      name: "unitPrice",
      label: "Unit Price",
      type: "number",
    },
    {
      name: "serviceNotes",
      label: "Notes",
      type: "textarea",
    },
    {
      name: "operationStart",
      label: "Start Time",
      type: "time",//datetime-local
    },
    {
      name: "operationEnd",
      label: "End Time",
      type: "time",//datetime-local
    },
  ];

  /* ---------- FETCH SERVICES ---------- */

  const fetchServices = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/company/contracts/${contractId}/services`, {
        credentials: "include",
      });

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

  const fetchCompanyServices = async () => {
    try {
      const res = await fetch("/api/company/services", {
        credentials: "include",
      });

      if (!res.ok) return;

      const data = await res.json();

      setCompanyServices(data);
    } catch (error) {
      console.error("Failed to load services");
    }
  };

  /* ---------- CREATE SERVICE ---------- */

  const createService = async () => {
    setError("");
    try {
      // const toISO = (value?: string) => {
      //   if (!value) return undefined;
      //   return new Date(value).toISOString();
      // };

      const combineDateTime = (time?: string) => {
        if (!time || !contract?.event?.eventDate) return undefined;

        const date = new Date(contract.event.eventDate);

        const [hours, minutes] = time.split(":");

        date.setHours(Number(hours));
        date.setMinutes(Number(minutes));
        date.setSeconds(0);

        return date.toISOString();
      };


      const res = await fetch(`/api/company/contracts/${contractId}/services`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: Number(form.serviceId),
          quantity: Number(form.quantity),
          unitPrice: Number(form.unitPrice),
          serviceNotes: form.serviceNotes || undefined,

          operationStart: combineDateTime(form.operationStart),//era toIso
          operationEnd: combineDateTime(form.operationEnd),
        }),
      });

      if (!res.ok) {
        const data = await res.json();

        if (data?.error?.fieldErrors) {
          const messages = Object.values(data.error.fieldErrors)
            .flat()
            .join(", ");

          setError(messages);
        } else if (data?.error) {
          if (data.available !== undefined) {
            setError(`${data.error}. Only ${data.available} left.`);
            setForm((prev) => ({
              ...prev,
              quantity: String(data.available), // renderiza en el ux la cantidad disponible
            }));
          } else {
            setError(data.error);
          }
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
        serviceNotes: "",
        operationStart: "",
        operationEnd: "",
      });

      fetchServices();
    } catch {
      setError("Connection error");
    }
  };

  const fetchContract = async () => {
    try {
      const res = await fetch(`/api/company/contracts/${contractId}`, {
        credentials: "include",
      });

      if (!res.ok) return;

      const data = await res.json();
      setContract(data);
    } catch { }
  };

  const deleteItem = async (itemId: number) => {
    setError("");
    if (!confirm("Remove this service from contract?")) return;

    try {
      const res = await fetch(`/api/company/contract-items/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();

        setError(data?.error || "Failed to delete service");

        return;
      }

      fetchServices();
    } catch {
      setError("Connection error");
    }
  };

  const updateItem = async (itemId: number) => {
    setError("");
    try {
      const res = await fetch(`/api/company/contract-items/${itemId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: Number(editForm.serviceId),
          quantity: Number(editForm.quantity),
        }),
      });

      if (!res.ok) {
        setError("Failed to update item");
        return;
      }

      setEditingItemId(null);

      fetchServices();
    } catch {
      setError("Connection error");
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCompanyServices();
    fetchContract();
  }, []);

  const contractTotal = services.reduce((sum, item) => {
    return sum + Number(item.quantity) * Number(item.unitPrice);
  }, 0);

  return (
    <div>
      {contract?.eventId && <EventInfoCard eventId={contract.eventId} />}

      <PageHeader
        title={`Contract ${contractId} Services`}
        buttonLabel="+ Add Service"
        onClick={() => {
          setError("");
          setShowForm(true);
        }}
      />

      <p
        style={{
          fontWeight: "bold",
          fontSize: 18,
          marginBottom: 20,
        }}
      >
        Contract Total: ${contractTotal}
      </p>

      {showForm && (
        <CreateForm
          title="Add Service to Contract"
          fields={fields}
          form={form}
          setForm={setForm}
          onSubmit={createService}
          onCancel={() => {
            setShowForm(false);

            setForm({
              serviceId: "",
              quantity: "",
              unitPrice: "",
              serviceNotes: "",
              operationStart: "",
              operationEnd: "",
            });
          }}
          clearError={() => setError("")}
        />
      )}

      {form.serviceId &&
        (() => {
          const service = companyServices.find(
            (s) => String(s.id) === form.serviceId,
          );

          if (!service) return null;

          return (
            <div>

              <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                📅 Event date: {new Date(contract?.event?.eventDate).toLocaleDateString()}
              </p>

              <p>Stock available: {service.stockTotal}</p>

              {form.quantity && form.unitPrice && (
                <p>
                  Subtotal: ${Number(form.quantity) * Number(form.unitPrice)}
                </p>
              )}
            </div>
          );
        })()}

      {error && <ErrorBox message={error} code={errorCode} />}

      {loading && <p>Loading services...</p>}

      {!loading && services.length === 0 && <p>No services added yet.</p>}

      {!loading && services.length > 0 && (
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
              onDelete={deleteItem}
              onUpdate={async (id, data) => {
                try {
                  //convierte las horas
                  const toISO = (value?: any) => {
                    if (!value) return undefined;

                    // si ya es string ISO válido → no tocar
                    if (
                      typeof value === "string" &&
                      value.includes("T") &&
                      value.includes("Z")
                    ) {
                      return value;
                    }

                    const date = new Date(value);

                    if (isNaN(date.getTime())) return undefined;

                    return date.toISOString();
                  };

                  const res = await fetch(`/api/company/contract-items/${id}`, {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      ...data,
                      operationStart: toISO(data.operationStart),
                      operationEnd: toISO(data.operationEnd),
                    }),
                  });

                  if (!res.ok) {
                    setError("Failed to update item");
                    return;
                  }

                  fetchServices();
                } catch {
                  setError("Connection error");
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
