---
name: frontend-design
description: >
  Create distinctive, production-grade frontend interfaces with high design quality.
  Use this skill whenever the user asks to build web components, pages, or applications —
  whether they say "make a landing page", "build a UI", "create a dashboard", "design a
  form", "build a React component", or anything implying a visual interface. Also trigger
  for vague requests like "make it look good" or "redo the frontend". Generates creative,
  polished code that avoids generic AI aesthetics. ALWAYS use this skill when the user
  wants any kind of web interface built, even if they don't mention design explicitly.
---

# Frontend Design

This skill guides creation of distinctive, production-grade frontend interfaces that avoid
generic "AI slop" aesthetics. Implement real working code with exceptional attention to
aesthetic details and creative choices.

## What the user gives you

The user provides frontend requirements: a component, page, application, or interface to
build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before writing a single line of code, understand the context and commit to a **bold
aesthetic direction**. This phase shapes everything that follows.

Ask yourself:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme and own it. Some directions to consider (but never copy
  literally — find your own flavor):
  - Brutally minimal / Swiss grid
  - Maximalist chaos / layered richness
  - Retro-futuristic / CRT glow
  - Organic / natural / botanical
  - Luxury / editorial / high-fashion
  - Playful / toy-like / tactile
  - Brutalist / raw / anti-design
  - Art deco / geometric / ornamental
  - Soft / pastel / cozy
  - Industrial / utilitarian / monospace
- **Constraints**: What technical requirements exist (framework, a11y, performance)?
- **The one unforgettable thing**: Every great interface has a signature detail. What's
  yours? A jaw-dropping animation? An unexpected color choice? A typographic treatment?
  A spatial trick? Commit to it.

The goal is **intentionality**, not intensity. Bold maximalism and refined minimalism both
work beautifully — the key is executing a clear vision with precision, not hedging.

## Implementation

Write working code (HTML/CSS/JS, React, Vue, etc.) that is:

- **Production-grade and functional** — handles real states, interactions, edge cases
- **Visually striking** — makes someone stop scrolling
- **Cohesive** — every detail serves the aesthetic vision
- **Meticulously refined** — spacing, sizing, timing all deliberate

## Aesthetic Guidelines

### Typography

Choose fonts that are beautiful, unexpected, and characterful. The font choice *is* a
design statement.

- **Avoid**: Inter, Roboto, Arial, system-ui, "safe" choices
- **Seek**: Distinctive display fonts paired with refined body fonts. Serifs with
  personality. Condensed grotesques. Mono for the right context. Something that wouldn't
  look generic on a thousand other sites.
- Load from Google Fonts or use `@font-face` when needed.

### Color & Theme

Commit fully. A timid palette with equal-weight pastels reads as indecisive.

- Use CSS custom properties (`--color-*`) for a coherent system
- Dominant colors + sharp accents outperform "balanced" distributions
- Dark themes, light themes, high-contrast, monochrome — vary across generations
- **Never**: purple gradient on white background, generic "SaaS blue", teal + coral

### Motion

Purposeful animation elevates an interface from functional to memorable.

- For HTML/CSS, prefer CSS-only animations (keyframes, transitions, custom properties)
- For React, use the Motion library (`motion/react`) when available
- **High-impact moments**: a well-orchestrated page load with staggered reveals creates
  more delight than scattered micro-interactions everywhere
- Use `animation-delay` for staggered entrance sequences
- Scroll-triggered reveals, hover states that genuinely surprise
- Match animation intensity to the aesthetic — brutalist designs get sharp snaps, luxury
  designs get silky eases

### Spatial Composition

Layouts that feel designed, not defaulted.

- Break the grid deliberately — overlap, asymmetry, diagonal flow
- Generous negative space OR controlled density; avoid the mushy middle
- Full-bleed elements, oversized type, unexpected proportions
- Think about the page as a composition, not a stack of components

### Backgrounds & Visual Details

Create atmosphere, not just a backdrop.

- Gradient meshes, noise textures, geometric patterns
- Layered transparencies and blur effects
- Dramatic shadows (box-shadow as a design element, not just depth)
- Decorative borders, ornamental details that fit the aesthetic
- Grain overlays for warmth and texture
- Custom cursor when appropriate
- The background is part of the design — make it earn its space

## Anti-patterns to actively avoid

These are signals that a design has fallen into "AI default" mode:

- Inter or Space Grotesk as the primary font
- Purple/violet gradient on a white or near-white background
- Cards with rounded corners, drop shadows, and a thin top accent color
- Hero section: large centered heading + subheading + two CTA buttons
- Generic icon-based feature grids
- "Glassmorphism" for its own sake (frosted panels with no compositional reason)
- Predictable dark mode (dark navy / near-black with blue accents)

If you catch yourself reaching for any of these, stop and make a different choice.

## Output quality

Match implementation complexity to the vision:

- Maximalist designs need elaborate code: extensive animations, layered effects, rich
  interactions
- Minimalist/refined designs need restraint: precise spacing, careful type sizing, subtle
  transitions — elegance through discipline, not decoration

Claude is capable of extraordinary creative work. Don't hold back. Show what can truly be
created when thinking outside the box and committing fully to a distinctive vision.
