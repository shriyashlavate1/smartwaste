# Smart Waste Segregation System

## Implementation approach

Build a single-page React + TypeScript frontend served by Vite. The experience is deliberately frontend-only: navigation uses the browser history API, demo authentication uses local component state, and waste identification uses a small local catalog with explicit simulated-result labels. No server, database, image-recognition API, or real account flow is needed for this scope.

The application is organized into reusable shell, navigation, icon, card, illustration, form, result, and content components. The public landing page routes to a demo login, which routes into a responsive dashboard shell with four views: Dashboard, Identify Waste, My Impact, and Learn. The dashboard owns the interaction model for search, sample-item selection, file input preview, quick bin guidance, impact summaries, and recent activity. The route manifest is served from `public/manus-routes.json`.

## Design direction

### Design movement

**Editorial circular utility**: a warm-paper, ink-heavy interface with a bright lime signal color, oversized type, and precise utility components inspired by independent editorial studios and circular-economy field guides.

### Core principles

1. **Make the next action obvious.** Each screen has one dominant action and a clear secondary path.
2. **Treat everyday sorting as meaningful infrastructure.** Use editorial pacing, confident labels, and calm microcopy rather than guilt or clutter.
3. **Pair warmth with precision.** Soft paper surfaces and rounded containers are balanced by sharp rules, data labels, and high-contrast type.
4. **Keep simulation honest.** Every demo-only interaction is labeled in the UI, especially login and recognition results.

### Color philosophy

Deep ink and warm paper create a grounded, print-like base. A highlighter-lime signal color marks active states and forward motion, while mint, peach, and lilac are reserved for bin categories and data accents. The palette should feel optimistic and practical—not “eco green” by default.

### Layout paradigm

Use an asymmetric editorial canvas: oversized headings and rule lines set the rhythm, while utility cards dock alongside the content rather than forming a generic centered grid. On mobile, the same composition collapses into a clear vertical reading order with a fixed bottom navigation for the dashboard.

### Signature elements

- A circular cut-mark brand symbol used as a wordmark and as a recurring UI accent.
- Fine measurement rules and numbered labels (`01`, `02`, `03`) that make the product feel like a field manual.
- Monochrome “sorting desk” illustrations built from CSS/SVG shapes, with lime motion cues for the current action.

### Interaction philosophy

Interactions should feel quiet and deliberate: buttons lift by two pixels, active nav items gain a lime marker, cards reveal their affordance on hover, and search results update without abrupt layout shifts. File upload, login, and quick-access flows provide immediate feedback and remain usable by keyboard.

### Animation

Use a 500–700ms entrance sequence on the landing hero, gentle vertical drift on the sorting illustration, and short 160–220ms transitions for controls. Respect `prefers-reduced-motion` by removing drift, reveal transforms, and smooth scrolling.

### Typography system

Use Space Grotesk for display headings and DM Sans for body/UI text. Headings are tight and slightly negative-tracked; metadata uses compact uppercase labels with generous letter spacing. Body copy stays at a readable 15–18px with a 1.5 line height.

### Brand essence

**A calm sorting companion for people who want to make the right everyday choice.** Personality: considered, optimistic, useful.

### Brand voice

Short, specific, and encouraging. Never scold. Example lines: “Small action. Cleaner loop.” and “Not sure where it goes? Start here.”

### Wordmark & logo

The wordmark is paired with a two-part circular cut mark: two offset arcs that suggest both a cycle and a decision point. The mark is rendered in CSS so it remains crisp at any size.

### Signature brand color

Signal Lime `#D7F36B` — an ownable highlighter tone that stands out against ink and paper without becoming a stereotypical environmental green.

## Project structure

- `src/main.tsx`: Vite entrypoint and global app mount.
- `src/App.tsx`: route state, reusable UI primitives, landing, demo login, dashboard views, data, and interactions.
- `src/styles.css`: responsive layout system, palette, typography, motion, illustration styling, and reduced-motion behavior.
- `public/manus-routes.json`: static route manifest for `/`, `/login`, `/dashboard`, `/identify`, `/impact`, and `/learn`.
- `app.config.ts`: project logo metadata for managed checkpointing.
- `TODO.md`: outcome-oriented implementation status.

## Build workflow

Use a minimal Vite React TypeScript setup with no backend capability. Install dependencies from the pinned package manifest, run the development server on the managed port `3000`, validate the route manifest and TypeScript/CSS diagnostics, then commit the intended files to `main` for a managed checkpoint. Publication remains separate from checkpointing and is not enabled automatically.
