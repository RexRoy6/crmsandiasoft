"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Star, Briefcase, Users, AlarmClock, 
  FileText, CreditCard, Calendar, Settings, X 
} from "lucide-react";

interface SidebarProps {
  user?: any;
  isOpen: boolean; 
  onClose: () => void; 
  role?: string;
}

const menu = [
  { label: "Home", href: "/company", icon: Home },
  { label: "Registro Rapido", href: "/company/contracts/new", icon: Star },
  { label: "Services", href: "/company/service", icon: Briefcase },
  { label: "Clients", href: "/company/clients", icon: Users },
  { label: "Events", href: "/company/events", icon: AlarmClock },
  { label: "Contracts", href: "/company/contracts", icon: FileText },
  { label: "Payments", href: "/company/payments", icon: CreditCard },
  { label: "Calendar", href: "/company/calendar", icon: Calendar },
  { label: "Settings", href: "/company/settings", icon: Settings },
];

export default function Sidebar({ user, isOpen, onClose, role }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay oscuro para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" 
          onClick={onClose}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border-color bg-sidebar-bg transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Cabecera del Sidebar con Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border-color">
          <div className="flex items-center gap-3">
            <Image
              src="/sandiasoft.png"
              alt="logo"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="font-semibold text-text-primary tracking-tight">Sandiasoft</span>
          </div>
          <button onClick={onClose} className="md:hidden text-text-secondary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        {/* Navegación Dinámica */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="flex flex-col gap-1">
            <p className="px-3 pb-2 text-xs font-medium text-text-secondary uppercase tracking-wider">
              Menu
            </p>
            
            {menu.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-brand-primary text-brand-primary-foreground shadow-sm" // Negro con letras blancas
                      : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary" // Gris con hover sutil
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Perfil del Usuario al fondo */}
        {user && (
          <div className="border-t border-border-color p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary truncate">{user.name}</span>
              <span className="text-xs text-text-secondary truncate">{user.email}</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}