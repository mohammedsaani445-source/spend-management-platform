# Design System: The Sovereign Security Framework ("The Digital Vault")

## 1. Overview
A creative North Star defined by architectural weight, impenetrable clarity, and editorial precision. Rejects standard SaaS templates in favor of **Intentional Asymmetry** and **Tonal Depth**.

## 2. Color Palette (Tonal Authority)
Rooted in deep slates, pure blacks, and crystalline blues.

| Token | Value | Role |
| :--- | :--- | :--- |
| **Base Surface** | `#f7f9ff` | The primary canvas background. |
| **Section Surface** | `#edf4ff` | Large structural areas (e.g., sidebars). |
| **Active Surface** | `#ffffff` | Interactive cards or high-focus zones. |
| **Feature Surface** | `#d3e4fa` | Highlighted security elements. |
| **Primary Action** | `#000000` | High-contrast buttons and critical text. |
| **Error** | `#ba1a1a` | Critical alerts. |

## 3. The "No-Line" Rule
- **Prohibited**: 1px solid borders for sectioning content.
- **Mandatory**: Boundaries defined solely through background color shifts (e.g., `#ffffff` on `#edf4ff`).

## 4. Typography (Editorial Voice)
- **Primary Font**: **Inter** (for UI/Logic) and **Noto Sans SC** (for high-contrast headers).
- **Weight**: Heavy weights for headers (`font-black`), medium for labels (`font-bold`).
- **Tracking**: Tight tracking for headers (`tracking-tight` or `-0.02em`).

## 5. Components
### Security Badge
A semi-transparent chip (`#d3e4fa` @ 60%) with a backdrop-blur. 

### Password Strength Meter
Four discrete blocks of color inside a `surface-container-high` well.
- **Weak**: Red
- **Robust**: Black
- **Strong/Active**: Black with Shimmer effect.

### Buttons
Solid `#000000` with `rounded-xl` corners. Subtle linear gradient for a "satin" finish.
