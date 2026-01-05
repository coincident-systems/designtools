# DesignTools 4.1

Industrial Engineering Toolkit for Methods, Standards & Work Design.

A modern web application (with optional desktop builds) providing calculators and analysis tools based on Niebel & Freivalds, *Methods, Standards, and Work Design* (11th Edition).

## Features

### Implemented Modules
- **Work Sampling** — Calculate sample sizes for work sampling studies
- **Learning Curves** — Two-point and regression analysis for production time prediction
- **Noise Dose Calculator** — OSHA 29 CFR 1910.95 compliant noise exposure assessment

### Planned Modules
- Time Study & Westinghouse Rating
- Standard Data (Drill Press, Lathe, Mill)
- Ergonomics (NIOSH Lifting, CTD, Heat Stress, Illumination)
- Quantitative Methods (Pareto, GANTT, Flow Process, Man-Machine)
- Psychology Tests (Fitts' Law, Stroop, Reaction Time, Memory Span)

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 7
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Testing**: Vitest, Storybook 10, Playwright
- **Desktop**: Tauri 2 (optional)
- **Deployment**: Vercel (web), native builds via Tauri

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 10+
- Rust toolchain (for desktop builds only)

### Installation

```bash
pnpm install
```

### Development

```bash
# Web development server
pnpm dev

# Run tests
pnpm test

# Storybook component explorer
pnpm storybook
```

### Building

```bash
# Web build (outputs to dist/)
pnpm build

# Desktop app (macOS/Windows/Linux)
pnpm tauri:build
```

## Project Structure

```
src/
├── components/       # Shared UI components
│   └── ui/          # shadcn/ui primitives
├── config/          # Navigation, constants
├── contexts/        # React contexts (theme)
├── layouts/         # App layout with sidebar
├── modules/         # Feature modules
│   ├── ergonomics/
│   ├── learning-curves/
│   └── work-sampling/
├── utils/
│   ├── accessibility/  # Contrast tests
│   └── calculations/   # Core calculation logic
└── routes.tsx       # Application routing

src-tauri/           # Tauri desktop wrapper (Rust)
```

## Accessibility

- WCAG 2.1 AA compliant contrast ratios
- Full keyboard navigation
- Screen reader support with ARIA labels
- Light/Dark/System theme modes
- Tested with @storybook/addon-a11y

## Testing

```bash
# Unit tests
pnpm test:run

# Watch mode
pnpm test

# Coverage report
pnpm test:coverage

# Storybook interaction tests
pnpm storybook
```

136 tests covering calculation logic and accessibility compliance.

## Deployment

### Vercel (Web)
The project includes `vercel.json` for zero-config deployment:
```bash
vercel
```

### Desktop Builds
```bash
# Development
pnpm tauri:dev

# Production build
pnpm tauri:build
```

Outputs platform-specific installers to `src-tauri/target/release/bundle/`.

## License

Educational use. Based on methodologies from Niebel & Freivalds.

---

**MSU BioReD Hub** · Montana State University
