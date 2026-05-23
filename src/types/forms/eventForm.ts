export interface EventFormClient {
  id: number;
  name: string;
  phone: string;
}

export interface EventFormState {
  clientId: string;

  client?: EventFormClient;

  name: string;

  eventDate: string;

  eventTime: string;

  location: string;

  notes: string;
}

export const initialEventForm: EventFormState = {
  clientId: "",

  client: undefined,

  name: "",

  eventDate: "",

  eventTime: "",

  location: "",

  notes: "",
};