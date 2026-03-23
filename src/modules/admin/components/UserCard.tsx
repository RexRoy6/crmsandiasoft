import { User } from "../types/admin";
import { companyStyles } from "@/styles/companyAdmin.styles";

export default function UserCard({ user, onDeactivate }: { user: User, onDeactivate: (userId: number) => void; }) {
  const initials = (user.name ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("");

  const isInactive = !!user.deletedAt;

  return (
    <div
      style={{
        ...companyStyles.userCard,
        opacity: isInactive ? 0.5 : 1,
        background: isInactive ? "#f9fafb" : "#fff",
      }}
    >
      <div style={companyStyles.userAvatar}>{initials}</div>

      <div style={{ flex: 1 }}>
        <div style={companyStyles.userName}>{user.name ?? ""}</div>
        <div style={companyStyles.userEmail}>{user.email ?? ""}</div>

        <div style={{ fontSize: 12, marginTop: 4 }}>
          {isInactive ? (
            <span style={{ color: "#991b1b" }}>Desactivado</span>
          ) : (
            <span style={{ color: "#166534" }}>Activo</span>
          )}
        </div>

      </div>

      <button
        onClick={() => {
          if (isInactive) return;

          if (confirm("¿Desactivar este usuario?")) {
            onDeactivate(user.id);
          }
        }}
        disabled={isInactive}
        style={{
          background: isInactive ? "#e5e7eb" : "#fee2e2",
          color: isInactive ? "#6b7280" : "#991b1b",
          border: "none",
          padding: "6px 10px",
          borderRadius: 6,
          cursor: isInactive ? "not-allowed" : "pointer",
          fontSize: 12,
        }}
      >
        {isInactive ? "Desactivado" : "Desactivar"}
      </button>

    </div>
  );
}
