import {
  EventNotFoundError,
  ContractConflictError,
} from "../domain/contract.errors";

export async function createContract(
  data: any,
  deps: {
    contractRepo: any;
    eventRepo: any;
  },
) {
  const event = await deps.eventRepo.findById(data.eventId);

  if (!event) {
    throw new EventNotFoundError();
  }

  const exists = await deps.contractRepo.existsByEvent(data.eventId);

  if (exists) {
    throw new ContractConflictError();
  }

  return deps.contractRepo.create(data);
}
