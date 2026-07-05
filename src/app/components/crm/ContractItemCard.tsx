"use client";

import { useEffect, useState } from "react";
import ListCard from "./ListCard";
import { formatTime, toLocalInput } from "@/lib/utils/date";
import { Clock, FileText, Wallet } from "lucide-react";

type Props = {
  item: any;
  onUpdate: (id: number, data: any) => Promise<void>;
  onDelete: (id: number) => void;
};

export default function ContractItemCard({ item, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    serviceId: "",
    quantity: "",
    serviceNotes: "",
    operationStart: "",
    operationEnd: "",
  });

  useEffect(() => {
    setForm({
      serviceId: String(item.service?.id || ""),
      quantity: String(item.quantity || ""),
      serviceNotes: item.serviceNotes || "",
      operationStart: toLocalInput(item.operationStart),
      operationEnd: toLocalInput(item.operationEnd),
    });
  }, [item]);

  const service = item.service;
  const subtotalView = Number(item.quantity || 0) * Number(item.unitPrice || 0);
  const subtotalEdit = Number(form.quantity || 0) * Number(item.unitPrice || 0);

  const formatMoney = (val: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(val);

  return (
    <>
      {!editing ? (
        // MODO LECTURA
        <ListCard
          title={service?.name || "Servicio"}
          subtitle={service?.description}
          actions={[
            { label: "Editar", onClick: () => setEditing(true) },
            { label: "Quitar", onClick: () => onDelete(item.id) },
          ]}
          content={
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Cantidad</span>
                <span className="font-semibold text-gray-900">{item.quantity}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Precio Unitario</span>
                <span className="font-medium text-gray-900">{formatMoney(item.unitPrice)}</span>
              </div>

              <div className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-200 mt-1">
                <span className="text-gray-600 font-semibold">Subtotal</span>
                <span className="font-bold text-gray-900">{formatMoney(subtotalView)}</span>
              </div>

              {item.operationStart && item.operationEnd && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 text-sm">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Clock size={14} /> Horario
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatTime(item.operationStart)} - {formatTime(item.operationEnd)}
                  </span>
                </div>
              )}

              {item.serviceNotes && (
                <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 italic flex gap-2 items-start">
                   <FileText size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  {item.serviceNotes}
                </div>
              )}
            </div>
          }
        />
      ) : (
        // MODO EDICIÓN
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm mb-3 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="mb-4 pb-3 border-b border-gray-100">
            <h3 className="m-0 text-base font-bold text-gray-900">{service?.name}</h3>
            <p className="m-0 text-sm text-gray-500 mt-1">{service?.description}</p>
          </div>

          <div className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Cantidad</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full md:w-1/3 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700 flex items-center gap-1"><Clock size={12}/> Inicio</label>
                <input
                  type="datetime-local"
                  value={form.operationStart || ""}
                  onChange={(e) => setForm({ ...form, operationStart: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700 flex items-center gap-1"><Clock size={12}/> Fin</label>
                <input
                  type="datetime-local"
                  value={form.operationEnd || ""}
                  onChange={(e) => setForm({ ...form, operationEnd: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700 flex items-center gap-1"><FileText size={12}/> Notas Adicionales</label>
              <textarea
                value={form.serviceNotes}
                onChange={(e) => setForm({ ...form, serviceNotes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-y"
              />
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
              <span className="text-sm font-semibold text-gray-600 flex items-center gap-1.5"><Wallet size={16}/> Subtotal</span>
              <span className="text-lg font-bold text-gray-900">{formatMoney(subtotalEdit)}</span>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => {
                  onUpdate(item.id, {
                    quantity: Number(form.quantity),
                    serviceNotes: form.serviceNotes,
                    operationEnd: form.operationEnd,
                    operationStart: form.operationStart,
                  });
                  setEditing(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors focus:outline-none"
              >
                Guardar Cambios
              </button>

              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}