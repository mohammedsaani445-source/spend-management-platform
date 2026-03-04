import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/apiKey";
import { getRequisitions, createRequisition } from "@/lib/requisitions";

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("x-api-key");
    if (!authHeader) return NextResponse.json({ error: "Missing API Key" }, { status: 401 });

    const key = await validateApiKey(authHeader);
    if (!key || (!key.scopes.includes('REQUISITIONS_READ') && !key.scopes.includes('FULL_ADMIN'))) {
        return NextResponse.json({ error: "Invalid or unauthorized API key" }, { status: 403 });
    }

    const requisitions = await getRequisitions({ tenantId: key.tenantId, role: 'ADMIN' } as any);
    return NextResponse.json(requisitions);
}

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("x-api-key");
    if (!authHeader) return NextResponse.json({ error: "Missing API Key" }, { status: 401 });

    const key = await validateApiKey(authHeader);
    if (!key || (!key.scopes.includes('REQUISITIONS_WRITE') && !key.scopes.includes('FULL_ADMIN'))) {
        return NextResponse.json({ error: "Invalid or unauthorized API key" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const id = await createRequisition({
            ...body,
            tenantId: key.tenantId,
            requesterId: `API_${key.id || 'unknown'}`,
            requesterName: `API - ${key.name}`
        });
        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create requisition" }, { status: 400 });
    }
}
