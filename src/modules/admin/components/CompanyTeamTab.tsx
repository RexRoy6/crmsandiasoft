import { User } from "../types/admin";
import { companyStyles } from "@/styles/companyAdmin.styles";
import UserCard from "./UserCard";
import { useState } from "react";


export default function CompanyTeamTab({ users,onCreateOwner,onDeactivateUser }:
   { users: User[] ,
     onCreateOwner: (email: string, password: string) => void;
     onDeactivateUser: (userId: number) => void;}) {
  const owners = users.filter((u) => u.role === "owner");
  const staff = users.filter((u) => u.role === "manager" || u.role === "staff");


  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const handleSubmit = () => {
  if (!email || !password) return;
  onCreateOwner(email, password);
  setEmail("");
  setPassword("");
};

  return (
    <>
      <h4 style={companyStyles.sectionTitle}>OWNERS ({owners.length})</h4>

      {owners.length > 0 ? (
        <div style={companyStyles.userGrid}>
          {owners.map((u) => (
            <UserCard key={u.id} user={u} onDeactivate={onDeactivateUser} />
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
            <UserCard key={u.id} user={u}  onDeactivate={onDeactivateUser} />
          ))}
        </div>
      ) : (
        <p style={companyStyles.emptyText}>No managers or staff</p>
      )}

      <div style={{ marginBottom: 20 }}>
  <h4>Crear Owner</h4>

  <input
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />

  <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <button onClick={handleSubmit}>
    Crear
  </button>
</div>

    </>

    
  );
}
