"use client";

import { useState } from "react";
import ClientSearch from "@/app/components/crm/ClientSearch";
import InlineClientForm from "@/app/components/crm/InlineClientForm";
import { createClient } from "@/services/clients/clientApi";
import { UserPlus, UserCheck, X } from "lucide-react";

export default function ClientSelector({
  selected,
  onSelect,
  onClear,
}: {
  selected?: {
    id: number;
    name: string;
    phone: string;
  };
  onSelect: (client: any) => void;
  onClear?: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  async function handleCreateClient() {
    try {
      if (!form.name || !form.phone) {
        setError("El nombre y teléfono son obligatorios");
        return;
      }

      const newClient = await createClient(form);

      onSelect({
        id: newClient.id,
        name: newClient.name,
        phone: newClient.phone,
      });

      setShowForm(false);
      setForm({ name: "", phone: "", email: "" });
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al crear el cliente");
    }
  }

  return (
    <div className="flex flex-col w-full mt-1.5">
      
      {/* ---------------- ESTADO 1: CLIENTE SELECCIONADO ---------------- */}
      {selected ? (
        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
          <div className="flex flex-col">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <UserCheck size={16} className="text-green-600" />
              {selected.name}
            </span>
            <span className="text-xs text-gray-500 mt-0.5 ml-5">
              {selected.phone}
            </span>
          </div>

          <button
            onClick={onClear}
            title="Cambiar cliente"
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors focus:outline-none"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        /* ---------------- ESTADO 2: BÚSQUEDA Y CREACIÓN ---------------- */
        <div className="flex flex-col gap-3">
          
          {/* Fila del Buscador + Botón (La idea que sugeriste) */}
          {!showForm && (
            <div className="flex items-start gap-2 w-full">
              <div className="flex-1">
                <ClientSearch selected={String(selected?.id || "")} onSelect={onSelect} />
              </div>
              
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 px-3 py-2 h-[38px] text-sm font-medium bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors shadow-sm whitespace-nowrap"
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">Nuevo</span>
              </button>
            </div>
          )}

          {/* Formulario Inline para Crear Cliente */}
          {showForm && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <InlineClientForm
                form={form}
                setForm={setForm}
                onSubmit={handleCreateClient}
                onCancel={() => {
                  setShowForm(false);
                  setError("");
                }}
              />
            </div>
          )}

          {/* Manejo de Errores */}
          {error && (
            <p className="text-sm text-red-500 font-medium animate-pulse">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}