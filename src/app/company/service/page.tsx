"use client";
import { useEffect, useState } from "react";
import ErrorBox from "@/app/components/ErrorBox";
import PageHeader from "@/app/components/crm/PageHeader";
import CreateForm from "@/app/components/crm/CreateForm";
import ListCard from "@/app/components/crm/ListCard";
import type { Field } from "@/app/components/crm/CreateForm";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  //para crear servicios
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    stockTotal: 1,
    priceBase: "",
  });
  //campos para formulario de servicios
  const serviceFields: Field[] = [
    { name: "name", label: "Name" },
    { name: "description", label: "Description" },
    { name: "stockTotal", label: "Stock", type: "number" },
    { name: "priceBase", label: "Base Price" },
  ];

  const fetchServices = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/company/services", {
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

  const createService = async () => {
    try {
      setError("");
      setErrorCode(undefined);

      const res = await fetch("/api/company/services", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        setError("Failed to create service");
        setErrorCode(res.status);
        return;
      }

      setShowForm(false);

      setForm({
        name: "",
        description: "",
        stockTotal: 1,
        priceBase: "",
      });

      fetchServices(); // refresh list
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
        title="Services"
        buttonLabel="+ New Service"
        onClick={() => setShowForm(true)}
      />
      {showForm && (
        <CreateForm
          title="Create Service"
          fields={serviceFields}
          form={form}
          setForm={setForm}
          onSubmit={createService}
          onCancel={() => setShowForm(false)}
        />
      )}

      {error && <ErrorBox message={error} code={errorCode} />}

      {loading && <p>Loading services...</p>}

      {!loading && services.length === 0 && <p>No services found.</p>}

      {!loading && services.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {services.map((service) => {
            const isActive = !service.deletedAt;
            return (
              <ListCard
                key={service.id}
                title={service.name}
                subtitle={service.description}
                content={
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      marginTop: 6,
                      fontSize: 13,
                      color: "var(--text-primary)",
                    }}
                  >
                    <span>
                      <strong>Stock:</strong> {service.stockTotal}
                    </span>

                    <span>
                      <strong>Price:</strong> ${service.priceBase}
                    </span>
                  </div>
                }
                link={`/company/service/${service.id}`}
                isActive={isActive}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
