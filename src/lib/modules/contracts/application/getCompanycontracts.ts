export async function getContracts(
  filters: any,
  deps: {
    contractRepo: any;
  },
) {
  return deps.contractRepo.getAll(filters);
}
