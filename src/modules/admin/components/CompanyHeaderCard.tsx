import { Company } from "../types/admin";
import { companyStyles } from "@/styles/companyAdmin.styles";

interface Props {
  company: Company;
  suspendConfirm: boolean;
  setSuspendConfirm: (v: boolean) => void;
  onEdit: () => void;
  onSuspend: () => void;
}

export default function CompanyHeaderCard({
  company,
  suspendConfirm,
  setSuspendConfirm,
  onEdit,
  onSuspend,
}: Props) {
  const isSuspended = !!company.deletedAt;

  return (
    <div style={companyStyles.container}>
      <div style={companyStyles.companyCard}>
        <div style={companyStyles.companyInfo}>
          <div style={companyStyles.companyLogo}>
            <div style={companyStyles.placeholderLogo}>
              {company.name.charAt(0).toUpperCase()}
            </div>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <h3 style={companyStyles.companyName}>
                {company.name}
              </h3>

              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 600,
                  backgroundColor: isSuspended ? "#fee2e2" : "#dcfce7",
                  color: isSuspended ? "#b91c1c" : "#15803d",
                }}
              >
                {isSuspended ? "Suspendida" : "Activa"}
              </span>
            </div>

            {isSuspended && company.deletedAt && (
              <p style={companyStyles.companyMeta}>
                Suspendida el{" "}
                {new Date(company.deletedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div style={companyStyles.actions}>
          <button onClick={onEdit} style={companyStyles.editBtn}>
            Edit
          </button>

          {isSuspended ? (
            <span
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Empresa suspendida
            </span>
          ) : suspendConfirm ? (
            <div style={companyStyles.confirmBox}>
              <span>¿Seguro?</span>

              <button
                onClick={onSuspend}
                style={companyStyles.confirmYes}
              >
                Sí
              </button>

              <button
                onClick={() => setSuspendConfirm(false)}
                style={companyStyles.confirmNo}
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={onSuspend}
              style={companyStyles.suspendBtn}
            >
              Suspend
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
