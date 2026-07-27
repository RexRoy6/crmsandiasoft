"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardCard from "@/app/components/DashboardCard";
import Toast from "@/app/components/Toast";
import PageHeader from "@/app/components/crm/PageHeader";
import { Home } from "lucide-react";

// Utilidades para formateo de números (convención de México)
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("es-MX").format(num);
};

const formatCurrency = (num: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0, // Cambia a 2 si deseas ver centavos (.00)
  }).format(num);
};

export default function CompanyDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const meRes = await fetch("/api/company/me", { credentials: "include" });
      if (meRes.status === 401) {
        router.replace("/");
        return;
      }
      if (!meRes.ok) throw new Error("No se pudo verificar la sesión");

      const dashRes = await fetch("/api/company/dashboard", { credentials: "include" });
      if (!dashRes.ok) throw new Error("No se pudieron cargar las métricas");

      const dashData = await dashRes.json();
      setStats(dashData);
    } catch (err: any) {
      setError(err.message || "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="relative">
      <PageHeader title="Inicio" icon={Home} />

      {error && (
        <Toast message={error} onClose={() => setError("")} />
      )}

      {/* Grid responsivo con ajuste de altura (auto-rows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 auto-rows-fr">
        
        {loading && (
          Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className="flex flex-col justify-between h-full p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mt-4" />
            </div>
          ))
        )}

        {!loading && stats && (
          <>
            <DashboardCard 
              title="Clientes" 
              value={formatNumber(stats.clients || 0)} 
              href="/company/clients"
            />
            <DashboardCard 
              title="Eventos" 
              value={formatNumber(stats.events || 0)} 
              href="/company/events"
            />
            <DashboardCard 
              title="Contratos Activos" 
              value={formatNumber(stats.contractsActive || 0)} 
              href="/company/contracts"
            />
            <DashboardCard 
              title="Ingresos del Mes" 
              value={formatCurrency(stats.revenueThisMonth || 0)} 
              href="/company/payments"
            />
            <DashboardCard 
              title="Saldos Pendientes" 
              value={formatCurrency(stats.pendingPayments || 0)} 
              href="/company/payments"
            />
          </>
        )}
      </div>
    </div>
  );
}