"use client";

import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";
import { UserRole } from "@/db/schema"; // Mantenemos tu importación correcta

export default function CompanyShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: UserRole;
}) {
  // Estado para controlar el menú en celulares
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      
      {/* Sidebar a la izquierda */}
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        role={role}
      />

      {/* Contenedor derecho para el resto del contenido */}
      <div className="flex flex-1 flex-col min-w-0">
        
        <Topbar 
          collapsed={false} 
          onToggle={() => setIsMobileMenuOpen(true)} 
        />

        {/* Área donde se inyectan todas las páginas de /company */}
        <main className="flex-1 overflow-y-auto bg-bg-secondary p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}