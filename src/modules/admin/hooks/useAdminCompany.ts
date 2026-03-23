import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Company, User, Contract } from "../types/admin";
import { fetchContracts } from "../services/adminService";

export function useAdminCompany(companyId: string) {
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"team" | "events" | "services">(
    "team",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suspendConfirm, setSuspendConfirm] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    if (!companyId) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const [companyRes, usersRes] = await Promise.all([
          fetch(`/api/admin/companies/${companyId}`),
          fetch(`/api/admin/companies/${companyId}/users`),
        ]);

        if (!companyRes.ok) throw new Error("Error empresa");
        if (!usersRes.ok) throw new Error("Error usuarios");

        const companyData = await companyRes.json();
        const usersData = await usersRes.json();

        setCompany(companyData);
        setUsers(usersData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  const handleEdit = () => {
    router.push(`/admin/companies/${companyId}/edit`);
  };

  const handleSuspend = async () => {
    if (!suspendConfirm) {
      setSuspendConfirm(true);
      return;
    }

    await fetch(`/api/admin/companies/${companyId}`, {
      method: "DELETE",
      credentials: "include",
    });

    setSuspendConfirm(false);
  };
  const loadContracts = async () => {
    try {
      const result = await fetchContracts();

      setContracts(result.data || []); // ✅ FIX
    } catch {
      setError("Error al cargar eventos");
    }
  };

  useEffect(() => {
    if (activeTab === "events") {
      loadContracts();
    }
  }, [activeTab]);



  //crear users:
  const createOwner = async (email: string, password: string) => {
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Error creando usuario");

      //  refrescar usuarios
      const usersRes = await fetch(`/api/admin/companies/${companyId}/users`);
      const usersData = await usersRes.json();
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message);
    }

  };

  //desactivar usuarios
  const deactivateUser = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error desactivando usuario");

      //  refrescar lista
      const usersRes = await fetch(`/api/admin/companies/${companyId}/users`);
      const usersData = await usersRes.json();
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    company,
    users,
    contracts,
    activeTab,
    setActiveTab,
    loading,
    error,
    suspendConfirm,
    setSuspendConfirm,
    handleEdit,
    handleSuspend,
    createOwner,
    deactivateUser
  };
}
