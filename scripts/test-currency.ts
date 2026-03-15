import { getExchangeRates, convertCurrency } from "../src/lib/exchangeRates";
import { formatCurrency } from "../src/lib/currencies";

async function verifyConversion() {
    console.log("--- Currency Intelligence Verification ---");
    
    const rates = await getExchangeRates();
    console.log("Live Rates Sync Status: OK");
    console.log(`USD-GHS Rate: ${rates['GHS']}`);
    
    const amountInUsd = 100;
    const amountInGhs = convertCurrency(amountInUsd, 'USD', 'GHS', rates);
    console.log(`$${amountInUsd} converted to GHS: ${amountInGhs}`);
    
    if (Math.abs(amountInGhs - (amountInUsd * rates['GHS'])) < 0.01) {
        console.log("Conversion Math: SUCCESS");
    } else {
        console.log("Conversion Math: FAILED");
    }
    
    const formatted = formatCurrency(amountInGhs, 'GHS');
    console.log(`Formatted GHS: ${formatted}`);
    
    if (formatted.includes('₵')) {
        console.log("Symbol Mapping: SUCCESS");
    } else {
        console.log("Symbol Mapping: FAILED (Expected ₵)");
    }
}

verifyConversion().catch(console.error);
