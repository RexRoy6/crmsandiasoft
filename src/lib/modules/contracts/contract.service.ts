import { createContract } from "./application/createContract";
import { getContracts } from "./application/getCompanycontracts";

import { contractRepository } from "./infrastructure/contract.repository";
import { eventRepository } from "../events/infrastructure/event.repository";

export const contractService = {
  create(data: any) {
    return createContract(data, {
      contractRepo: contractRepository,
      eventRepo: eventRepository,
    });
  },

  getAll(filters: any) {
    return getContracts(filters, {
      contractRepo: contractRepository,
    });
  },
};
