export async function resumeContractDraft(
    eventId: number
) {

    // buscar draft existente
    const res = await fetch(
        `/api/company/contracts?eventId=${eventId}&status=draft`,
        {
            credentials: "include",
        }
    );

    if (!res.ok) {
        throw new Error(
            "Failed to search contracts"
        );
    }

    const data = await res.json();

    // ya existe
    if (data.data?.length > 0) {

        return {
            contract: data.data[0],
            created: false,
        };
    }

    // crear draft nuevo
    const createRes = await fetch(
        "/api/company/contracts",
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId,
                status: "draft",
                totalAmount: 0,
            }),
        }
    );

    if (!createRes.ok) {
        throw new Error(
            "Failed to create draft"
        );
    }

    const contract = await createRes.json();

    return {
        contract,
        created: true,
    };
}