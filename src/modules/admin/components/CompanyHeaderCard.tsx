import Image from "next/image";
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
  return (
    <div style={companyStyles.container}>
      <div style={companyStyles.companyCard}>
        <div style={companyStyles.companyInfo}>
          <div style={companyStyles.companyLogo}>
            {/* {company.logo ? (
            <Image
              src={company.logo}
              alt="Company logo"
              width={60}
              height={60}
              style={{ borderRadius: 12 }}
            />
          ) : ( */}
            <div style={companyStyles.placeholderLogo}>
              {company.name.charAt(0)}
            </div>
            {/* )} */}
          </div>

          <div>
            <h3 style={companyStyles.companyName}>{company.name}</h3>
            <p style={companyStyles.companyMeta}>
              {/* {company.email} · {company.phone} */}
            </p>
            {/* <p style={companyStyles.companyMeta}>{company.address}</p> */}
          </div>
        </div>

        <div style={companyStyles.actions}>
          <button onClick={onEdit} style={companyStyles.editBtn}>
            Edit
          </button>

          {suspendConfirm ? (
            <div style={companyStyles.confirmBox}>
              <span>¿Seguro?</span>

              <button onClick={onSuspend} style={companyStyles.confirmYes}>
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
            <button onClick={onSuspend} style={companyStyles.suspendBtn}>
              Suspend
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
