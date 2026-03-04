export interface ExchangeRates {
    [key: string]: number;
}

// Mock rates as fallback - focused on Ghana context
const MOCK_RATES: ExchangeRates = {
    'USD': 1.0,
    'GHS': 15.5, // 1 USD = 15.5 GHS (approx)
    'EUR': 0.92,
    'GBP': 0.79,
    'CAD': 1.35
};

let cachedRates: ExchangeRates | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 3600000; // 1 hour

/**
 * Fetches current exchange rates. 
 * Uses ExchangeRate-API (v6) for real-time data.
 */
export const getExchangeRates = async (): Promise<ExchangeRates> => {
    const now = Date.now();

    // 1. Return cached rates if still valid
    if (cachedRates && (now - lastFetch < CACHE_DURATION)) {
        return cachedRates;
    }

    const apiKey = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;

    // 2. Attempt Live Fetch (only if a real API key is configured)
    if (apiKey && apiKey !== 'YOUR_API_KEY_HERE' && apiKey !== '') {
        try {
            const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
            if (response.ok) {
                const data = await response.json();
                if (data.result === 'success') {
                    cachedRates = data.conversion_rates;
                    lastFetch = now;
                    return cachedRates!;
                }
            }
        } catch {
            // Live fetch failed — fall through to static rates below
        }
    }

    // 3. Use built-in static fallback rates (no external dependency needed)
    //    These are reasonable approximations for offline/dev use.
    cachedRates = MOCK_RATES;
    lastFetch = now;
    return cachedRates;
};

/**
 * Converts an amount from one currency to another using current rates.
 */
export const convertCurrency = (amount: number, from: string, to: string, rates: ExchangeRates): number => {
    if (from === to) return amount;

    // Convert to USD first (base)
    const usdAmount = from === 'USD' ? amount : amount / (rates[from] || 1);

    // Convert from USD to target
    const result = to === 'USD' ? usdAmount : usdAmount * (rates[to] || 1);

    return Number(result.toFixed(2));
};
