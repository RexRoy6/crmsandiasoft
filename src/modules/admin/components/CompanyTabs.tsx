import { Contract, User } from "../types/admin";
import { companyStyles } from "@/styles/companyAdmin.styles";
import CompanyTeamTab from "./CompanyTeamTab";

interface Props {
  users: User[];
  contracts: Contract[];
  activeTab: "team" | "events" | "services";
  setActiveTab: (v: "team" | "events" | "services") => void;
  onCreateOwner: (email: string, password: string) => void;
  onDeactivateUser: (userId: number) => void;
}

export default function CompanyTabs({
  users,
  contracts,
  activeTab,
  setActiveTab,
  onCreateOwner,
  onDeactivateUser
}: Props) {
  console.log(1, contracts);
  return (
    <div style={companyStyles.container}>
      <div style={companyStyles.card}>
        <div style={companyStyles.tabs}>
          <span
            style={
              activeTab === "team" ? companyStyles.activeTab : companyStyles.tab
            }
            onClick={() => setActiveTab("team")}
          >
            Team Users
          </span>

          <span
            style={
              activeTab === "events"
                ? companyStyles.activeTab
                : companyStyles.tab
            }
            onClick={() => setActiveTab("events")}
          >
            Events
          </span>

          <span
            style={
              activeTab === "services"
                ? companyStyles.activeTab
                : companyStyles.tab
            }
            onClick={() => setActiveTab("services")}
          >
            Services Catalog
          </span>
        </div>

        {activeTab === "team" && <CompanyTeamTab 
        users={users} 
        onCreateOwner={onCreateOwner}
        onDeactivateUser={onDeactivateUser} />}

        {activeTab === "events" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {contracts.length === 0 ? (
              <p>No hay eventos</p>
            ) : (
              contracts.map((contract) => (
                <div
                  key={contract.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Información principal */}
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <strong style={{ fontSize: 15 }}>
                      {/* {contract.event?.name} */}
                    </strong>

                    <span style={{ fontSize: 13, color: "#6b7280" }}>
                      {/* Cliente: {contract.client?.name} */}
                    </span>
                  </div>

                  {/* Etiquetas */}
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <span
                      style={{
                        background: "#f3f4f6",
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {/* ${contract.totalAmount} */}
                    </span>

                    <span
                      style={{
                        background:
                          contract.status === "active" ? "#dcfce7" : "#fee2e2",
                        color:
                          contract.status === "active" ? "#166534" : "#991b1b",
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {contract.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "services" && (
          <div style={companyStyles.tabContent}>
            <p>Catálogo de servicios próximamente...</p>
          </div>
        )}
      </div>
    </div>
  );
}
