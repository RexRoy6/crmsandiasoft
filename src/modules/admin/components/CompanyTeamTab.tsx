import { User } from "../types/admin";
import { companyStyles } from "@/styles/companyAdmin.styles";
import UserCard from "./UserCard";

export default function CompanyTeamTab({ users }: { users: User[] }) {
  const owners = users.filter((u) => u.role === "owner");
  const staff = users.filter((u) => u.role === "manager" || u.role === "staff");

  return (
    <>
      <h4 style={companyStyles.sectionTitle}>OWNERS ({owners.length})</h4>

      {owners.length > 0 ? (
        <div style={companyStyles.userGrid}>
          {owners.map((u) => (
            <UserCard key={u.id} user={u} />
          ))}
        </div>
      ) : (
        <p style={companyStyles.emptyText}>No owners assigned</p>
      )}

      <h4 style={companyStyles.sectionTitle}>
        MANAGERS & STAFF ({staff.length})
      </h4>

      {staff.length > 0 ? (
        <div style={companyStyles.userGrid}>
          {staff.map((u) => (
            <UserCard key={u.id} user={u} />
          ))}
        </div>
      ) : (
        <p style={companyStyles.emptyText}>No managers or staff</p>
      )}
    </>
  );
}
