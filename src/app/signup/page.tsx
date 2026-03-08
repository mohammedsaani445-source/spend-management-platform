"use client";

import { useState, useRef, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db, DB_PREFIX } from "@/lib/firebase";
import { ref, set, push, get } from "firebase/database";

const CURRENCIES = [
    { code: "AED", symbol: "د.إ", name: "United Arab Emirates Dirham" },
    { code: "AFN", symbol: "؋", name: "Afghan Afghani" },
    { code: "ALL", symbol: "L", name: "Albanian Lek" },
    { code: "AMD", symbol: "֏", name: "Armenian Dram" },
    { code: "ANG", symbol: "ƒ", name: "Netherlands Antillean Guilder" },
    { code: "AOA", symbol: "Kz", name: "Angolan Kwanza" },
    { code: "ARS", symbol: "$", name: "Argentine Peso" },
    { code: "AUD", symbol: "$", name: "Australian Dollar" },
    { code: "AWG", symbol: "ƒ", name: "Aruban Florin" },
    { code: "AZN", symbol: "₼", name: "Azerbaijani Manat" },
    { code: "BAM", symbol: "KM", name: "Bosnia-Herzegovina Convertible Mark" },
    { code: "BBD", symbol: "$", name: "Barbadian Dollar" },
    { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
    { code: "BGN", symbol: "лв", name: "Bulgarian Lev" },
    { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar" },
    { code: "BIF", symbol: "FBu", name: "Burundian Franc" },
    { code: "BMD", symbol: "$", name: "Bermudan Dollar" },
    { code: "BND", symbol: "$", name: "Brunei Dollar" },
    { code: "BOB", symbol: "Bs.", name: "Bolivian Boliviano" },
    { code: "BRL", symbol: "R$", name: "Brazilian Real" },
    { code: "BSD", symbol: "$", name: "Bahamian Dollar" },
    { code: "BTN", symbol: "Nu.", name: "Bhutanese Ngultrum" },
    { code: "BWP", symbol: "P", name: "Botswanan Pula" },
    { code: "BYN", symbol: "Br", name: "Belarusian Ruble" },
    { code: "BZD", symbol: "BZ$", name: "Belize Dollar" },
    { code: "CAD", symbol: "$", name: "Canadian Dollar" },
    { code: "CDF", symbol: "FC", name: "Congolese Franc" },
    { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
    { code: "CLP", symbol: "$", name: "Chilean Peso" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "COP", symbol: "$", name: "Colombian Peso" },
    { code: "CRC", symbol: "₡", name: "Costa Rican Colón" },
    { code: "CUP", symbol: "₱", name: "Cuban Peso" },
    { code: "CVE", symbol: "$", name: "Cape Verdean Escudo" },
    { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
    { code: "DJF", symbol: "Fdj", name: "Djiboutian Franc" },
    { code: "DKK", symbol: "kr", name: "Danish Krone" },
    { code: "DOP", symbol: "RD$", name: "Dominican Peso" },
    { code: "DZD", symbol: "د.ج", name: "Algerian Dinar" },
    { code: "EGP", symbol: "£", name: "Egyptian Pound" },
    { code: "ERN", symbol: "Nfk", name: "Eritrean Nakfa" },
    { code: "ETB", symbol: "Br", name: "Ethiopian Birr" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "FJD", symbol: "FJ$", name: "Fijian Dollar" },
    { code: "FKP", symbol: "£", name: "Falkland Islands Pound" },
    { code: "GBP", symbol: "£", name: "British Pound Sterling" },
    { code: "GEL", symbol: "₾", name: "Georgian Lari" },
    { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
    { code: "GIP", symbol: "£", name: "Gibraltar Pound" },
    { code: "GMD", symbol: "D", name: "Gambian Dalasi" },
    { code: "GNF", symbol: "FG", name: "Guinean Franc" },
    { code: "GTQ", symbol: "Q", name: "Guatemalan Quetzal" },
    { code: "GYD", symbol: "$", name: "Guyanaese Dollar" },
    { code: "HKD", symbol: "$", name: "Hong Kong Dollar" },
    { code: "HNL", symbol: "L", name: "Honduran Lempira" },
    { code: "HRK", symbol: "kn", name: "Croatian Kuna" },
    { code: "HTG", symbol: "G", name: "Haitian Gourde" },
    { code: "HUF", symbol: "Ft", name: "Hungarian Forint" },
    { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
    { code: "ILS", symbol: "₪", name: "Israeli New Shekel" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "IQD", symbol: "ع.د", name: "Iraqi Dinar" },
    { code: "IRR", symbol: "﷼", name: "Iranian Rial" },
    { code: "ISK", symbol: "kr", name: "Icelandic Króna" },
    { code: "JMD", symbol: "J$", name: "Jamaican Dollar" },
    { code: "JOD", symbol: "د.ا", name: "Jordanian Dinar" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
    { code: "KGS", symbol: "лв", name: "Kyrgystani Som" },
    { code: "KHR", symbol: "៛", name: "Cambodian Riel" },
    { code: "KMF", symbol: "CF", name: "Comorian Franc" },
    { code: "KPW", symbol: "₩", name: "North Korean Won" },
    { code: "KRW", symbol: "₩", name: "South Korean Won" },
    { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
    { code: "KYD", symbol: "$", name: "Cayman Islands Dollar" },
    { code: "KZT", symbol: "₸", name: "Kazakhstani Tenge" },
    { code: "LAK", symbol: "₭", name: "Laotian Kip" },
    { code: "LBP", symbol: "£", name: "Lebanese Pound" },
    { code: "LKR", symbol: "₨", name: "Sri Lankan Rupee" },
    { code: "LRD", symbol: "$", name: "Liberian Dollar" },
    { code: "LSL", symbol: "L", name: "Lesotho Loti" },
    { code: "LYD", symbol: "ل.د", name: "Libyan Dinar" },
    { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham" },
    { code: "MDL", symbol: "L", name: "Moldovan Leu" },
    { code: "MGA", symbol: "Ar", name: "Malagasy Ariary" },
    { code: "MKD", symbol: "ден", name: "Macedonian Denar" },
    { code: "MMK", symbol: "K", name: "Myanmar Kyat" },
    { code: "MNT", symbol: "₮", name: "Mongolian Tugrik" },
    { code: "MOP", symbol: "MOP$", name: "Macanese Pataca" },
    { code: "MRU", symbol: "UM", name: "Mauritanian Ouguiya" },
    { code: "MUR", symbol: "₨", name: "Mauritian Rupee" },
    { code: "MVR", symbol: "Rf", name: "Maldivian Rufiyaa" },
    { code: "MWK", symbol: "MK", name: "Malawian Kwacha" },
    { code: "MXN", symbol: "$", name: "Mexican Peso" },
    { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
    { code: "MZN", symbol: "MT", name: "Mozambican Metical" },
    { code: "NAD", symbol: "$", name: "Namibian Dollar" },
    { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
    { code: "NIO", symbol: "C$", name: "Nicaraguan Córdoba" },
    { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
    { code: "NPR", symbol: "₨", name: "Nepalese Rupee" },
    { code: "NZD", symbol: "$", name: "New Zealand Dollar" },
    { code: "OMR", symbol: "ر.ع.", name: "Omani Rial" },
    { code: "PAB", symbol: "B/.", name: "Panamanian Balboa" },
    { code: "PEN", symbol: "S/.", name: "Peruvian Nuevo Sol" },
    { code: "PGK", symbol: "K", name: "Papua New Guinean Kina" },
    { code: "PHP", symbol: "₱", name: "Philippine Peso" },
    { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
    { code: "PLN", symbol: "zł", name: "Polish Zloty" },
    { code: "PYG", symbol: "₲", name: "Paraguayan Guarani" },
    { code: "QAR", symbol: "ر.ق", name: "Qatari Rial" },
    { code: "RON", symbol: "lei", name: "Romanian Leu" },
    { code: "RSD", symbol: "дин.", name: "Serbian Dinar" },
    { code: "RUB", symbol: "₽", name: "Russian Ruble" },
    { code: "RWF", symbol: "FRw", name: "Rwandan Franc" },
    { code: "SAR", symbol: "ر.س", name: "Saudi Riyal" },
    { code: "SBD", symbol: "$", name: "Solomon Islands Dollar" },
    { code: "SCR", symbol: "₨", name: "Seychellois Rupee" },
    { code: "SDG", symbol: "ج.س.", name: "Sudanese Pound" },
    { code: "SEK", symbol: "kr", name: "Swedish Krona" },
    { code: "SGD", symbol: "$", name: "Singapore Dollar" },
    { code: "SHP", symbol: "£", name: "Saint Helena Pound" },
    { code: "SLL", symbol: "Le", name: "Sierra Leonean Leone" },
    { code: "SOS", symbol: "S", name: "Somali Shilling" },
    { code: "SRD", symbol: "$", name: "Surinamese Dollar" },
    { code: "SSP", symbol: "£", name: "South Sudanese Pound" },
    { code: "STD", symbol: "Db", name: "São Tomé and Príncipe Dobra" },
    { code: "SYP", symbol: "£", name: "Syrian Pound" },
    { code: "SZL", symbol: "L", name: "Swazi Lilangeni" },
    { code: "THB", symbol: "฿", name: "Thai Baht" },
    { code: "TJS", symbol: "SM", name: "Tajikistani Somoni" },
    { code: "TMT", symbol: "T", name: "Turkmenistani Manat" },
    { code: "TND", symbol: "د.ت", name: "Tunisian Dinar" },
    { code: "TOP", symbol: "T$", name: "Tongan Paʻanga" },
    { code: "TRY", symbol: "₺", name: "Turkish Lira" },
    { code: "TTD", symbol: "TT$", name: "Trinidad and Tobago Dollar" },
    { code: "TWD", symbol: "NT$", name: "New Taiwan Dollar" },
    { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
    { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia" },
    { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
    { code: "USD", symbol: "$", name: "United States Dollar" },
    { code: "UYU", symbol: "$U", name: "Uruguayan Peso" },
    { code: "UZS", symbol: "лв", name: "Uzbekistan Som" },
    { code: "VEF", symbol: "Bs", name: "Venezuelan Bolívar Fuerte" },
    { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
    { code: "VUV", symbol: "VT", name: "Vanuatu Vatu" },
    { code: "WST", symbol: "WS$", name: "Samoan Tala" },
    { code: "XAF", symbol: "FCFA", name: "CFA Franc BEAC" },
    { code: "XCD", symbol: "$", name: "East Caribbean Dollar" },
    { code: "XOF", symbol: "CFA", name: "CFA Franc BCEAO" },
    { code: "XPF", symbol: "₣", name: "CFP Franc" },
    { code: "YER", symbol: "﷼", name: "Yemeni Rial" },
    { code: "ZAR", symbol: "R", name: "South African Rand" },
    { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha" },
    { code: "ZWL", symbol: "$", name: "Zimbabwean Dollar" }
];
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();

    // User Details
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    // Organization Details
    const [companyName, setCompanyName] = useState("");
    const [currency, setCurrency] = useState("USD");

    const [isEmailStep, setIsEmailStep] = useState(true);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [currencySearchQuery, setCurrencySearchQuery] = useState("");
    const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCurrencyDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCurrencies = CURRENCIES.filter(c =>
        c.code.toLowerCase().includes(currencySearchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(currencySearchQuery.toLowerCase())
    );
    const selectedCurrencyObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (isEmailStep) {
            if (!email) { setError("Please enter an email"); return; }
            setIsEmailStep(false);
            return;
        }

        if (!companyName || !fullName || !password) {
            setError("Please fill in all required fields.");
            return;
        }

        setIsLoading(true);
        try {
            let userAuthResult;
            let isResumePartialSignup = false;

            try {
                userAuthResult = await createUserWithEmailAndPassword(auth, email, password);
            } catch (authErr: any) {
                if (authErr.code === "auth/email-already-in-use") {
                    try {
                        // Attempt to log in with the provided credentials
                        userAuthResult = await signInWithEmailAndPassword(auth, email, password);

                        // Check if they already have a workspace assigned
                        const mappingRef = ref(db, `${DB_PREFIX}/userTenants/${userAuthResult.user.uid}`);
                        const mappingSnap = await get(mappingRef);

                        if (mappingSnap.exists()) {
                            throw new Error("This email is already registered to a workspace. Please log in.");
                        } else {
                            isResumePartialSignup = true;
                        }
                    } catch (loginErr: any) {
                        if (loginErr.message === "This email is already registered to a workspace. Please log in.") {
                            throw loginErr;
                        }
                        throw new Error("An account with this email already exists. If this is you, please log in.");
                    }
                } else {
                    throw authErr;
                }
            }

            // Set display name in Auth if creating anew
            if (!isResumePartialSignup) {
                await updateProfile(userAuthResult.user, {
                    displayName: fullName
                });
            }

            // 1. Generate new Tenant ID
            const tenantsRef = ref(db, `${DB_PREFIX}/tenants`);
            const newTenantRef = push(tenantsRef);
            const tenantId = newTenantRef.key;

            if (!tenantId) throw new Error("Could not generate workspace ID");

            // 2. Create the Organization (Tenant)
            await set(newTenantRef, {
                name: companyName,
                currency: currency,
                createdAt: Date.now()
            });

            // 3. Create User inside the specified Tenant as SUPERUSER
            await set(ref(db, `${DB_PREFIX}/tenants/${tenantId}/users/${userAuthResult.user.uid}`), {
                email: userAuthResult.user.email,
                displayName: fullName,
                role: 'SUPERUSER',
                createdAt: Date.now(),
                isActive: true
            });

            // 4. Map the User to the Tenant
            await set(ref(db, `${DB_PREFIX}/userTenants/${userAuthResult.user.uid}`), {
                tenantId: tenantId
            });

            // Redirect to dashboard
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to create organization");
            setIsLoading(false);
        }
    };

    // Google Signup handles Auth first, then creates Tenant
    const handleGoogleSignup = async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);

            // To properly do organization signup with Google, we would normally collect the
            // company name first, OR redirect them to an onboarding screen. 
            // For simplicity in this flow, we will use their display name as the company name initially
            // and they can change it in settings.
            const initialCompanyName = `${result.user.displayName || 'My'} Workspace`;

            try {
                // 1. Generate new Tenant ID
                const tenantsRef = ref(db, `${DB_PREFIX}/tenants`);
                const newTenantRef = push(tenantsRef);
                const tenantId = newTenantRef.key;

                if (!tenantId) throw new Error("Could not generate workspace ID");

                // 2. Create the Organization (Tenant)
                await set(newTenantRef, {
                    name: initialCompanyName,
                    currency: 'USD',
                    createdAt: Date.now()
                });

                // 3. Create User inside the specified Tenant as SUPERUSER
                await set(ref(db, `${DB_PREFIX}/tenants/${tenantId}/users/${result.user.uid}`), {
                    email: result.user.email,
                    displayName: result.user.displayName || 'User',
                    role: 'SUPERUSER',
                    createdAt: Date.now(),
                    isActive: true
                });

                // 4. Map the User to the Tenant
                await set(ref(db, `${DB_PREFIX}/userTenants/${result.user.uid}`), {
                    tenantId: tenantId
                });

            } catch (dbErr) {
                console.warn("DB organization write skipped or failed:", dbErr);
                // AuthContext will handle missing mappings by denying access
            }

            router.push("/dashboard");
        } catch (err: any) {
            console.error("Google Signup Error:", err);
            if (err.code === "auth/popup-blocked") {
                setError("Sign-in popup was blocked by your browser.");
            } else if (err.code !== "auth/popup-closed-by-user") {
                setError("Failed to signup with Google: " + (err.message || err.code || ""));
            }
        }
    };

    return (
        <div style={{
            display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center',
            background: '#F4F6F8', padding: '1rem', fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                maxWidth: '480px', width: '100%', padding: '2.5rem',
                background: 'white', borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.05)'
            }}>
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '36px', height: '36px', background: '#5C6AC4', borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 900, fontSize: '0.9rem'
                    }}>Pf</div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#212B36' }}>
                        Apex Procure
                    </span>
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#212B36', letterSpacing: '-0.02em' }}>
                    Create your workspace
                </h1>
                <p style={{ color: '#637381', fontSize: '0.9375rem', marginBottom: '2rem' }}>
                    Set up a new organization and become the Superuser.
                </p>

                {error && (
                    <div style={{
                        background: '#FFE7D9', color: '#B72136', padding: '0.75rem 1rem',
                        borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: 600
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup}>
                    {isEmailStep ? (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8125rem', color: '#212B36', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Work Email
                            </label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required autoFocus
                                style={{
                                    width: '100%', height: '44px', padding: '0 1rem', borderRadius: '8px',
                                    border: '1px solid #DFE3E8', background: 'white', outline: 'none',
                                    fontSize: '0.9375rem', color: '#212B36', fontFamily: 'inherit',
                                    transition: 'border-color 0.15s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#5C6AC4'}
                                onBlur={e => e.target.style.borderColor = '#DFE3E8'}
                            />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>

                            <div style={{ padding: '0.75rem 1rem', background: '#F4F6F8', borderRadius: '8px', border: '1px solid #DFE3E8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.875rem', color: '#212B36', fontWeight: 500 }}>{email}</span>
                                <button type="button" onClick={() => setIsEmailStep(true)} style={{ background: 'none', border: 'none', color: '#5C6AC4', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Change</button>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px dashed #DFE3E8', margin: '0' }} />

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', color: '#212B36', marginBottom: '0.5rem', fontWeight: 600 }}>Company Name</label>
                                <input
                                    type="text" placeholder="Acme Corp" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required autoFocus
                                    style={{ width: '100%', height: '44px', padding: '0 1rem', borderRadius: '8px', border: '1px solid #DFE3E8', outline: 'none', fontSize: '0.9375rem', fontFamily: 'inherit' }}
                                    onFocus={e => e.target.style.borderColor = '#5C6AC4'} onBlur={e => e.target.style.borderColor = '#DFE3E8'}
                                />
                            </div>

                            <div ref={dropdownRef} style={{ position: 'relative' }}>
                                <label style={{ display: 'block', fontSize: '0.8125rem', color: '#212B36', marginBottom: '0.5rem', fontWeight: 600 }}>Base Currency</label>
                                <div
                                    onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                                    style={{
                                        width: '100%', height: '44px', padding: '0 1rem', borderRadius: '8px',
                                        border: `1px solid ${isCurrencyDropdownOpen ? '#5C6AC4' : '#DFE3E8'}`,
                                        outline: 'none', fontSize: '0.9375rem', fontFamily: 'inherit', backgroundColor: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                                        boxShadow: isCurrencyDropdownOpen ? '0 0 0 3px rgba(92, 106, 196, 0.1)' : 'none',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            background: '#F4F6F8', padding: '2px 6px', borderRadius: '4px',
                                            fontSize: '0.75rem', fontWeight: 700, color: '#637381'
                                        }}>
                                            {selectedCurrencyObj.code}
                                        </div>
                                        <span>{selectedCurrencyObj.name} ({selectedCurrencyObj.symbol})</span>
                                    </div>
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ transform: isCurrencyDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#919EAB' }}>
                                        <path d="M1.41 0.589966L6 5.16997L10.59 0.589966L12 1.99997L6 7.99997L0 1.99997L1.41 0.589966Z" fill="currentColor" />
                                    </svg>
                                </div>

                                {isCurrencyDropdownOpen && (
                                    <div style={{
                                        position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                                        background: 'white', border: '1px solid #DFE3E8', borderRadius: '8px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 10, overflow: 'hidden',
                                        display: 'flex', flexDirection: 'column', maxHeight: '300px'
                                    }}>
                                        <div style={{ padding: '8px', borderBottom: '1px solid #DFE3E8', background: '#F9FAFB' }}>
                                            <div style={{ position: 'relative' }}>
                                                <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#919EAB', width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="11" cy="11" r="8"></circle>
                                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                                </svg>
                                                <input
                                                    type="text"
                                                    placeholder="Search currency..."
                                                    value={currencySearchQuery}
                                                    onChange={e => setCurrencySearchQuery(e.target.value)}
                                                    autoFocus
                                                    style={{
                                                        width: '100%', height: '36px', padding: '0 12px 0 32px',
                                                        border: '1px solid #DFE3E8', borderRadius: '6px', outline: 'none',
                                                        fontSize: '0.875rem', fontFamily: 'inherit'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ overflowY: 'auto', flex: 1 }}>
                                            {filteredCurrencies.length === 0 ? (
                                                <div style={{ padding: '16px', textAlign: 'center', color: '#919EAB', fontSize: '0.875rem' }}>
                                                    No currencies found
                                                </div>
                                            ) : (
                                                filteredCurrencies.map(c => (
                                                    <div
                                                        key={c.code}
                                                        onClick={() => {
                                                            setCurrency(c.code);
                                                            setIsCurrencyDropdownOpen(false);
                                                            setCurrencySearchQuery("");
                                                        }}
                                                        style={{
                                                            padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                                                            cursor: 'pointer', transition: 'background 0.15s',
                                                            background: currency === c.code ? '#F4F6F8' : 'white'
                                                        }}
                                                        onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                                                        onMouseLeave={e => (e.currentTarget.style.background = currency === c.code ? '#F4F6F8' : 'white')}
                                                    >
                                                        <div style={{
                                                            background: currency === c.code ? '#5C6AC4' : '#E8EAF6',
                                                            color: currency === c.code ? 'white' : '#5C6AC4',
                                                            padding: '4px 8px', borderRadius: '4px',
                                                            fontSize: '0.75rem', fontWeight: 700
                                                        }}>
                                                            {c.code}
                                                        </div>
                                                        <span style={{ fontSize: '0.9rem', color: '#212B36', fontWeight: currency === c.code ? 600 : 400 }}>
                                                            {c.name}
                                                        </span>
                                                        <span style={{ marginLeft: 'auto', color: '#919EAB', fontSize: '0.875rem' }}>
                                                            {c.symbol}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', color: '#212B36', marginBottom: '0.5rem', fontWeight: 600 }}>Your Full Name</label>
                                <input
                                    type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                                    style={{ width: '100%', height: '44px', padding: '0 1rem', borderRadius: '8px', border: '1px solid #DFE3E8', outline: 'none', fontSize: '0.9375rem', fontFamily: 'inherit' }}
                                    onFocus={e => e.target.style.borderColor = '#5C6AC4'} onBlur={e => e.target.style.borderColor = '#DFE3E8'}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', color: '#212B36', marginBottom: '0.5rem', fontWeight: 600 }}>Password</label>
                                <input
                                    type="password" placeholder="Create a secure password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                                    style={{ width: '100%', height: '44px', padding: '0 1rem', borderRadius: '8px', border: '1px solid #DFE3E8', outline: 'none', fontSize: '0.9375rem', fontFamily: 'inherit' }}
                                    onFocus={e => e.target.style.borderColor = '#5C6AC4'} onBlur={e => e.target.style.borderColor = '#DFE3E8'}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit" disabled={isLoading}
                        style={{
                            width: '100%', height: '44px', borderRadius: '8px', border: 'none',
                            background: '#5C6AC4', color: 'white', fontWeight: 700, fontSize: '0.9375rem',
                            cursor: isLoading ? 'wait' : 'pointer', fontFamily: 'inherit',
                            opacity: isLoading ? 0.7 : 1, transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => !isLoading && ((e.target as HTMLElement).style.background = '#303f9f')}
                        onMouseLeave={e => ((e.target as HTMLElement).style.background = '#5C6AC4')}
                    >
                        {isLoading ? "Setting up workspace..." : (isEmailStep ? "Continue" : "Create Workspace")}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '1px', background: '#DFE3E8' }}></div>
                    <span style={{ fontSize: '0.8125rem', color: '#919EAB', fontWeight: 500 }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: '#DFE3E8' }}></div>
                </div>

                <button
                    onClick={handleGoogleSignup}
                    style={{
                        width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #DFE3E8', background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                        fontWeight: 600, fontSize: '0.9rem', color: '#212B36', cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F4F6F8')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                    <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign up with Google
                </button>

                <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.875rem', color: '#637381' }}>
                        User already invited? <Link href="/login" style={{ color: '#5C6AC4', textDecoration: 'none', fontWeight: 700 }}>Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
