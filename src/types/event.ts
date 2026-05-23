import type { ContractStatus } from "@/db/schema";

export interface EventClient {
    id: number;
    name: string;
}

export interface EventContract {
    id: number;
    status: ContractStatus;
}

export interface Event {
    id: number;

    name: string;

    eventDate: string;

    location: string | null;

    notes: string | null;

    client: EventClient;

    contract: EventContract | null;
}

export interface EventPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface EventsResponse {
    data: Event[];
    pagination: EventPagination;
}