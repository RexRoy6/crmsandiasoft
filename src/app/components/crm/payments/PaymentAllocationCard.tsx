"use client";

import { AlertCircle } from "lucide-react";

type Item = {
  id: number;
  quantity: number;
  unitPrice: number | string;
  paidAmount?: number;
  remainingAmount?: number;
  service: {
    name: string;
    description?: string;
  };
};

type Props = {
  items: Item[];
  formItems: {
    contractItemId: number;
    amount: number | string;
  }[];
  setForm: (fn: (prev: any) => any) => void;
};

export default function PaymentAllocationCard({
  items,
  formItems,
  setForm,
}: Props) {
  
  const formatMoney = (val: number) => 
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(val);

  return (
    <div className="flex flex-col gap-3 bg-white p-4 md:p-5 border border-gray-200 rounded-xl shadow-sm">
      <h4 className="text-sm font-bold text-gray-900 tracking-tight mb-2">Desglose a Pagar</h4>
      
      {items.map((item, index) => {
        const total = item.quantity * Number(item.unitPrice);
        const paid = item.paidAmount || 0;
        const remaining = item.remainingAmount ?? total - paid;
        
        const currentItemForm = formItems[index];
        const rawValue = currentItemForm?.amount;
        const valueStr = rawValue === undefined || rawValue === null || rawValue === "" ? "" : String(rawValue);
        const numValue = Number(rawValue || 0);

        // --- VALIDACIONES ---
        let errorMsg = "";
        if (numValue > remaining) {
          errorMsg = `El abono no puede superar el saldo restante (${formatMoney(remaining)}).`;
        } else if (numValue < 0) {
          errorMsg = "El abono no puede ser negativo.";
        }

        return (
          <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
            
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-sm text-gray-900">{item.service.name}</span>
              <span className="text-xs text-gray-500">
                {item.quantity} × {formatMoney(Number(item.unitPrice))} = <strong className="text-gray-700">{formatMoney(total)}</strong>
              </span>
              <span className="text-xs font-medium text-green-700 mt-0.5">Pagado: {formatMoney(paid)}</span>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs text-gray-500">Resta</span>
                  <span className="text-sm font-semibold text-gray-900">{formatMoney(remaining)}</span>
                </div>

                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={valueStr}
                    max={remaining}
                    min={0}
                    placeholder="0.00"
                    className={`w-28 pl-6 pr-3 py-1.5 text-sm font-semibold bg-white border rounded-md focus:outline-none focus:ring-1 transition-all ${
                      errorMsg 
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/30 text-red-700" 
                        : "border-gray-300 focus:ring-black focus:border-black"
                    }`}
                    onChange={(e) => {
                      const valStr = e.target.value;
                      setForm((prev: any) => {
                        const updated = [...prev.items];
                        updated[index] = { 
                          ...updated[index], 
                          contractItemId: item.id,
                          amount: valStr === "" ? "" : Number(valStr) 
                        };
                        return { ...prev, items: updated };
                      });
                    }}
                  />
                </div>
              </div>
              
              {errorMsg && (
                <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 animate-pulse">
                  <AlertCircle size={12} /> {errorMsg}
                </span>
              )}
            </div>
            
          </div>
        );
      })}

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
        <span className="text-sm font-medium text-gray-500">Monto Total a Abonar:</span>
        <span className="text-lg font-black text-gray-900">
          {formatMoney(formItems.reduce((sum, i) => sum + (Number(i?.amount) || 0), 0))}
        </span>
      </div>
    </div>
  );
}