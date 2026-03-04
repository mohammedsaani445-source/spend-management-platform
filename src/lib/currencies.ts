export interface Currency {
    code: string;
    name: string;
    symbol: string;
    flag: string;
    country: string;
}

export const CURRENCIES: Currency[] = [
    // North America
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', country: 'United States' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', country: 'Canada' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽', country: 'Mexico' },

    // Europe
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', country: 'European Union' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', country: 'United Kingdom' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭', country: 'Switzerland' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', country: 'Sweden' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', country: 'Norway' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', country: 'Denmark' },
    { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱', country: 'Poland' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺', country: 'Russia' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', country: 'Turkey' },

    // Asia & Pacific
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', country: 'Australia' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', country: 'New Zealand' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', country: 'Japan' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', country: 'China' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', country: 'India' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', country: 'Hong Kong' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', country: 'Singapore' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', country: 'South Korea' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', country: 'Indonesia' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', country: 'Malaysia' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', country: 'Philippines' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', country: 'Thailand' },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳', country: 'Vietnam' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰', country: 'Pakistan' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩', country: 'Bangladesh' },

    // Middle East
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', country: 'UAE' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', country: 'Saudi Arabia' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', flag: '🇶🇦', country: 'Qatar' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', flag: '🇰🇼', country: 'Kuwait' },
    { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', flag: '🇮🇱', country: 'Israel' },

    // South America
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', country: 'Brazil' },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷', country: 'Argentina' },
    { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱', country: 'Chile' },
    { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴', country: 'Colombia' },
    { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', flag: '🇵🇪', country: 'Peru' },

    // Africa
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', flag: '🇬🇭', country: 'Ghana' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', country: 'Nigeria' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', country: 'South Africa' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬', country: 'Egypt' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪', country: 'Kenya' },
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', flag: '🇲🇦', country: 'Morocco' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿', country: 'Tanzania' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬', country: 'Uganda' },
    { code: 'DZD', name: 'Algerian Dinar', symbol: 'DA', flag: '🇩🇿', country: 'Algeria' },
    { code: 'TND', name: 'Tunisian Dinar', symbol: 'DT', flag: '🇹🇳', country: 'Tunisia' },
    { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', flag: '🇪🇹', country: 'Ethiopia' },
    { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', flag: '🇧🇯', country: 'West Africa (CFA)' }, // Benin flag as generic or use WA flag if available
    { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', flag: '🇨🇲', country: 'Central Africa (CFA)' }, // Cameroon flag
    { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF', flag: '🇷🇼', country: 'Rwanda' },
    { code: 'BWP', name: 'Botswana Pula', symbol: 'P', flag: '🇧🇼', country: 'Botswana' },
    { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', flag: '🇿🇲', country: 'Zambia' },
    { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', flag: '🇦🇴', country: 'Angola' },
    { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', flag: '🇲🇺', country: 'Mauritius' },
];

export const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
    const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
    try {
        const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
        return formatted;
    } catch (e) {
        return `${currency.symbol}${amount.toFixed(2)}`;
    }
};
