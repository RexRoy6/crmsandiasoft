import { contractRepository } from "./infrastructure/contract.repository";

type GetAllFilters = {
  search?: string;
  page?: number;
  limit?: number;
  eventId?: number;
  status?: string;
  companyId: number;
};

export const contractService = {
  async getAll(filters: GetAllFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    if (page < 1) throw new Error("Invalid page");
    if (limit < 1 || limit > 100) throw new Error("Invalid limit");

    return contractRepository.getAll({
      ...filters,
      page,
      limit,
    });
  },

  async getById(id: number, companyId: number) {
    if (!id) throw new Error("Id is required");

    const contract = await contractRepository.getById(id, companyId);

    if (!contract) {
      throw new Error("Contract not found");
    }

    return contract;
  },

  async create(data: any) {
    // 🔥 validaciones mínimas
    if (!data.name) throw new Error("Name is required");
    if (!data.companyId) throw new Error("CompanyId is required");

    return contractRepository.create(data);
  },

  async update(id: number, companyId: number, data: any) {
    if (!id) throw new Error("Id is required");

    const existing = await contractRepository.getById(id, companyId);

    if (!existing) {
      throw new Error("Contract not found");
    }

    return contractRepository.update(id, companyId, data);
  },

  async remove(id: number, companyId: number) {
    if (!id) throw new Error("Id is required");

    const existing = await contractRepository.getById(id, companyId);

    if (!existing) {
      throw new Error("Contract not found");
    }

    return contractRepository.remove(id, companyId);
  },
};
