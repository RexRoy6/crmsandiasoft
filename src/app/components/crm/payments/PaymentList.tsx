"use client";

import ListCard from "@/app/components/crm/ListCard";
import { formatDate } from "@/lib/utils/date";
import { Receipt, Trash2 } from "lucide-react";

export default function PaymentList({
  payments,
  onDeleteSuccess,
}: {
  payments: any[];
  onDeleteSuccess?: () => void;
}) {
  async function handleDelete(id: number) {
    if (!confirm("¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer.")) return;

    try {
      const res = await fetch(`/api/company/payments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        alert("Error al eliminar el pago");
        return;
      }

      onDeleteSuccess?.();
    } catch {
      alert("Error de conexión");
    }
  }

  if (payments.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded-lg border border-gray-100">
        Aún no hay pagos registrados.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-2">
      {payments.map((payment) => (
        <ListCard
          key={payment.id}
          title={`Pago #${payment.id}`}
          link="#"
          content={
            <div className="flex flex-col gap-3 mt-2">
              
              {/* Etiqueta del Ticket (Estilo Financiero) */}
              {payment.ticketNumber && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md w-fit border border-gray-200">
                  <Receipt size={14} className="text-gray-500" />
                  Ticket: {payment.ticketNumber}
                </div>
              )}

              {/* Lista de Conceptos (Items) */}
              <div className="flex flex-col gap-2">
                {payment.items.map((item: any) => (
                  <div
                    key={`p${payment.id}-c${payment.contractId}-i${item.contractItemId}`}
                    className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 tracking-tight">
                        {item.service.name}
                        {item.service.description && (
                          <span className="text-xs text-gray-500 ml-1 font-normal">
                            - {item.service.description}
                          </span>
                        )}
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-gray-900">
                      ${item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          {/* Metadatos del Pago */}
          <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-700">
            <div className="grid grid-cols-2 gap-2">
              <span><strong>Moneda:</strong> {payment.currency}</span>
              <span><strong>Total:</strong> ${payment.amount}</span>
              <span>
                <strong>Método:</strong>{" "}
                <span className="capitalize">{payment.paymentMethod}</span>
              </span>
              <span>
                <strong>Fecha de Pago:</strong>{" "}
                {payment.paidAt ? formatDate(payment.paidAt) : "—"}
              </span>
            </div>
            
            <span className="text-xs text-gray-400 mt-1">
              Registrado en sistema: {formatDate(payment.createdAt)}
            </span>
          </div>

          {/* Botón de Eliminar */}
          <div className="flex justify-start mt-3">
            <button
              onClick={() => handleDelete(payment.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:outline-none"
            >
              <Trash2 size={14} />
              Eliminar
            </button>
          </div>
        </ListCard>
      ))}
    </div>
  );
}