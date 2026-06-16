export type ContractStatus = "draft" | "active" | "completed" | "cancelled";

export type Contract = {
  id: number;
  eventId: number;
  total: number;
  status: ContractStatus;
  createdAt: Date;
};
