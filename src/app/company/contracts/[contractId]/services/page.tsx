"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ErrorBox from "@/app/components/ErrorBox";
import PageHeader from "@/app/components/crm/PageHeader";
import CreateForm from "@/app/components/crm/CreateForm";
import type { Field } from "@/app/components/crm/CreateForm";
import ListCard from "@/app/components/crm/ListCard";

export default function ContractServicesPage() {

  const params = useParams();
  const contractId = Number(params.contractId);

  const [services, setServices] = useState<any[]>([]);
  const [companyServices, setCompanyServices] = useState<any[]>([]);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);

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
  });
  const handleServiceChange = (serviceId: string) => {

    const service = companyServices.find(
      (s) => String(s.id) === serviceId
    );

    if (!service) return;

    setForm((prev) => ({
      ...prev,
      serviceId,
      unitPrice: String(service.priceBase)//price
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

  const fetchCompanyServices = async () => {

    try {

      const res = await fetch(
        "/api/company/services",
        { credentials: "include" }
      );

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




  const deleteItem = async (itemId: number) => {
    setError("");
    if (!confirm("Remove this service from contract?")) return;

    try {

      const res = await fetch(
        `/api/company/contract-items/${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

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

      const res = await fetch(
        `/api/company/contract-items/${itemId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId: Number(editForm.serviceId),
            quantity: Number(editForm.quantity),
          }),
        }
      );

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
  }, []);

  const contractTotal = services.reduce((sum, item) => {

    return sum +
      Number(item.quantity) *
      Number(item.unitPrice);

  }, 0);


  return (
    <div>

      <PageHeader
        title={`Contract ${contractId} Services`}
        buttonLabel="+ Add Service"
        onClick={() => setShowForm(true)}
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
          onCancel={() => setShowForm(false)}
        />



      )}

      {form.serviceId && (() => {

        const service = companyServices.find(
          s => String(s.id) === form.serviceId
        );

        if (!service) return null;

        return (
          <div>
            <p>Stock available: {service.stock}</p>

            {form.quantity && form.unitPrice && (
              <p>
                Subtotal: $
                {Number(form.quantity) * Number(form.unitPrice)}
              </p>
            )}
          </div>
        );

      })()}

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

            const service = companyServices.find(
              (s) => s.id === item.serviceId
            );

            const subtotal =
              Number(item.quantity) *
              Number(item.unitPrice);

            return (

              <div
                key={item.id}
                style={{
                  border: "1px solid #ccc",
                  padding: 12,
                }}
              >

                {editingItemId === item.id ? (

                  <>
                    <p>Edit Service</p>

                    <input
                      type="number"
                      placeholder="Service ID"
                      value={editForm.serviceId}
                      onChange={(e) =>
                        setEditForm({ ...editForm, serviceId: e.target.value })
                      }
                    />

                    <input
                      type="number"
                      placeholder="Quantity"
                      value={editForm.quantity}
                      onChange={(e) =>
                        setEditForm({ ...editForm, quantity: e.target.value })
                      }
                    />

                    <button onClick={() => updateItem(item.id)}>
                      Save
                    </button>

                    <button onClick={() => setEditingItemId(null)}>
                      Cancel
                    </button>
                  </>

                ) : (

                  <>

                    <ListCard
                      title={service ? service.name : `Service ${item.serviceId}`}
                      extra={[
                        `Quantity: ${item.quantity}`,
                        `Unit Price: $${item.unitPrice}`,
                        `Subtotal: $${subtotal}`,
                      ]}
                      link="#"
                    />

                    <div style={{ marginTop: 8 }}>

                      <button
                        onClick={() => {
                          setEditingItemId(item.id);
                          setEditForm({
                            serviceId: String(item.serviceId),
                            quantity: String(item.quantity),
                          });
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteItem(item.id)}
                        style={{ marginLeft: 10 }}
                      >
                        Remove
                      </button>

                    </div>
                  </>

                )}

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}