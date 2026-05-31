
# NSDR op Recept — Build Plan

Eerste oplevering: volledig werkende Dashboard (/) met sidebar, top bar, bento grid, brand styling en Framer Motion entrance-animaties. Daarna routes /nieuw, /genereren, /recept/:id, /recepten en de AI-integratie via Lovable Cloud.

## 1. Design system & fonts

Bestand: `src/styles.css`
- Voeg Google Fonts import toe: Barlow (800) + DM Sans.
- Vervang tokens met merkkleuren (oklch equivalenten van de hex):
  - `--background` Nightfall `#1e1e1a`
  - `--foreground` Silent Beige `#F1F1EE`
  - `--primary` Dried Sage `#7a8a58`
  - `--accent` Tierra `#b09070`
  - Phase tokens: `--phase-rood #e24b4a`, `--phase-rood-geel #d48020`, `--phase-geel-groen #7ab040`, `--phase-groen #3a8040`
  - Glass tokens: `--glass-bg rgba(241,241,238,0.04)`, `--glass-border rgba(241,241,238,0.08)`
- `body { font-family: 'DM Sans' }`, headings `font-family: 'Barlow'; font-weight: 800`.
- Ambient radial gradient via `body::before` (Dried Sage 3% in top-left).
- Utility class `.glass` met `backdrop-filter: blur(20px)`.

Default theme = dark (geen toggle nodig in v1, app is altijd dark).

## 2. Dependencies

- `bun add framer-motion`
- shadcn componenten al aanwezig — gebruiken: button, card, input, badge, separator, tooltip, sheet (voor mobiele sidebar later).

## 3. Routes (TanStack Start)

Bestanden onder `src/routes/`:
- `__root.tsx` — bestaande shell behouden, `<Outlet/>` blijft. Geen layout daar; layout in een pathless layout-route.
- `_app.tsx` — pathless layout met `<Sidebar/>` + `<TopBar/>` + `<Outlet/>` in `<main>` met page-transition wrapper (fade + y:20→0).
- `_app.index.tsx` → `/` Dashboard (bento grid).
- `_app.nieuw.tsx` → `/nieuw` multi-step intake (stap 1 placeholder in v1).
- `_app.genereren.tsx` → `/genereren` generation screen.
- `_app.recept.$id.tsx` → `/recept/:id`.
- `_app.recepten.tsx` → `/recepten` archief.

In deze eerste oplevering implementeren we de routes als bestanden met basis-skeletten; de Dashboard pagina is volledig uitgewerkt.

## 4. Componenten

Onder `src/components/`:
- `layout/Sidebar.tsx` — collapsible (64↔220px), items: Dashboard, Nieuw recept, Recepten, Instellingen (lucide icons), footer met avatar "Preschana Misri, MD". Active state via `useRouterState`. Default collapsed; toggle in topbar.
- `layout/TopBar.tsx` — logo mark (SVG dot/initial), titel "NSDR op Recept", bell icon.
- `layout/PageTransition.tsx` — Framer Motion wrapper.
- `bento/BentoGrid.tsx` + `BentoCard.tsx` — CSS grid 4 cols, slots `lg|md|sm`.
- `brand/PhaseBadge.tsx` — props `phase`, kleur uit phase tokens.
- `brand/GlassCard.tsx` — basisglas-oppervlak.
- Recipe + intake componenten als stubs aanmaken voor later (`RecipeCard`, `PrescriptionTier`, `GenerationPulse`, `IntakeStep`) — alleen exports, ingevuld in volgende iteratie.

## 5. Dashboard bento layout

Cards:
- Large (col-span-2, row-span-2): "Schrijf een recept" CTA met ambient gradient (Dried Sage → Tierra), grote Barlow heading + sage knop linkt naar `/nieuw`.
- Medium x3: "Recente recepten" — 3 voorbeeld-items met RX-nummer, PhaseBadge, datum, korte context. Klik → `/recept/:id`.
- Small x2: stats "Recepten deze maand" (getal), "Actieve protocollen" (getal).
- Medium: "Snelle acties" met links naar archief en instellingen.

Empty state copy beschikbaar maar v1 toont voorbeeld-data (placeholder, geen grijze boxes).

Entrance: stagger children 0.08s, fade + y:20→0. Hover op cards: border brightens + lichte scale.

## 6. Andere routes (skeletten in v1)

- `/nieuw`, `/genereren`, `/recept/:id`, `/recepten`: minimale pagina met titel + placeholder copy in de juiste styling, zodat navigatie werkt. Volledige uitwerking in iteratie 2.

## 7. Backend (iteratie 2, na akkoord)

- Lovable Cloud aanzetten.
- Tabel `recipes` (id, professional_id, created_at, patient_context jsonb, phase text, dominant_domain text, recipe_json jsonb) + RLS.
- Edge function `generate-recipe` met de aangeleverde SYSTEM_INSTRUCTION en user-prompt template, model `gpt-4o`, `response_format: json_object`.
- Secret `OPENAI_API_KEY` aanvragen.
- `/nieuw` 3-staps form, `/genereren` pulse + step reveal, `/recept/:id` document met 5 secties + 3 prescription tiers + PDF/copy actions.

## Technische details

- Geen hard-coded kleuren in componenten — alles via tokens (`bg-background`, `text-foreground`, `bg-primary`, custom phase classes via styles.css).
- Framer Motion variants centraal in `src/lib/motion.ts` (fadeUp, stagger, spring).
- Sidebar collapse state in `useState` op layout-niveau (geen persistence in v1).
- Geen auth in v1 — komt bij backend-iteratie.

## Scope iteratie 1 (deze build)

1. Tokens + fonts + ambient bg in `styles.css`.
2. `framer-motion` installeren.
3. `_app` layout met Sidebar + TopBar + page transitions.
4. Dashboard `/` volledig met bento grid en motion.
5. Skelet-pagina's voor /nieuw, /genereren, /recept/:id, /recepten zodat navigatie werkt.

Iteratie 2 (apart bevestigen): Cloud + OpenAI edge function + intake form + generation + recipe document + archief.

Vraag voor jou: akkoord om iteratie 1 nu te bouwen, en in iteratie 2 Cloud aan te zetten + OpenAI key aan te vragen?
