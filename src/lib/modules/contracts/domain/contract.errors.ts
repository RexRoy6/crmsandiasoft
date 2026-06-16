export class EventNotFoundError extends Error {
  constructor(message = "Event not found") {
    super(message);
    this.name = "EventNotFoundError";
  }
}

export class ContractConflictError extends Error {
  constructor(message = "Contract already exists for this event") {
    super(message);
    this.name = "ContractConflictError";
  }
}
