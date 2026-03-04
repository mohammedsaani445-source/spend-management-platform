import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/apiKey";
import { getPurchaseOrders } from "@/lib/purchaseOrders";

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("x-api-key");
    if (!authHeader) return NextResponse.json({ error: "Missing API Key" }, { status: 401 });

    const key = await validateApiKey(authHeader);
    if (!key || (!key.scopes.includes('PO_READ') && !key.scopes.includes('FULL_ADMIN'))) {
        return NextResponse.json({ error: "Invalid or unauthorized API key" }, { status: 403 });
    }

    const pos = await getPurchaseOrders({ tenantId: key.tenantId, role: 'ADMIN' } as any);
    return NextResponse.json(pos);
}
