# Project Overview

This project is a Next.js App Router application.

Tech stack:
- Latest stable Next.js (App Router)
- TypeScript (strict mode)
- Latest stable Tailwind CSS

Deployment target: Vercel

## Project Structure

/app                → Next.js App Router pages
/components         → Shared React components
/lib                → Shared utilities
/hooks              → Custom React hooks
/types              → Shared TypeScript types
/public             → Static assets

Create folders only when needed. Do not create empty directories.

## Typography

- Font Family: Satoshi
- Typography Scale: Large
- Use next/font over CSS/CDN fonts.
- Keep body text line height between 1.4-1.6
- Keep large text line height between 1.1-1.3
- Keep line length between 50-75 characters.

## Layout & Spacing

- Don't use a max-width container. Sections are full-width with horizontal padding of `padding: 0 6vw`.
- Use a 4px spacing system (4px multiples only).
- Use consistent large spacing between elements.
- Use Tailwind spacing scale.

## Animation

- Use GSAP for all animations. Use native CSS only for simple transitions, hover effects, and other basic interactions.

## Icons

- Use React Icons for all icons in the project.

## Code Standards

- Never ignore TypeScript errors. Fix root causes instead of bypassing them with any or type assertions.
- Do not disable ESLint rules. If necessary, explain why.
- Use named exports only. Never use default export.
  - Exception: Next.js requires default exports for special files such as `page.tsx` and `layout.tsx`.
- Avoid using the `any` type unless absolutely necessary.
- Use camelCase for variables and functions, PascalCase for components, types, and classes.
- Avoid obvious comments. Explain why only when necessary.

## Components

- Use server components by default.
- Use client components only when necessary. Avoid unnecessary client-side logic and data fetching.
- Keep server components for composition. Move interactive logic to client components.
- Respect Next.js server/client boundaries. Do not use client-only utilities in server components.
- If a server component requires client-only utilities, isolate them in a client component and pass data via props.

- Use functional components.
- Keep components small and focused.
- Prefer one main component per file.

- Make components reusable by default. Extract repeated UI into reusable components.
- Prefer composition over duplication by building complex components from smaller, reusable components.
- Check existing components before creating new ones. Reuse when possible.
- Use props to control component behavior and appearance.
- Use variants only when a component needs multiple predefined, reusable style or behavior options.
- Avoid creating multiple component versions.
- Avoid prop drilling. Use Context or state management when needed.

## Styling Guidelines

- Use design tokens as the single source of truth for all styling values.
- Implement design tokens using CSS variables.
- Use semantic Tailwind utilities mapped to CSS variables for theme values like colors, shadows, radius, etc.
- Use standard Tailwind utilities for layout, spacing, etc.
- Avoid arbitrary Tailwind values unless necessary.
- Avoid hex codes in components unless necessary.
- Avoid custom CSS files unless necessary.

## Performance

- Always use static rendering unless explicitly requested otherwise.
- Use lazy loading for images, non-critical content, and below-the-fold sections.
- Use next/image for images.
- Use next/link for internal navigation.

## Responsive Design

- Ensure the UI is responsive on mobile, tablet, and desktop.
- Use Tailwind responsive utilities (sm, md, lg, xl) when necessary.

## Accessibility

- Ensure full keyboard-only navigation across the entire application.
- Ensure full screen reader compatibility.
- Provide clear and visible focus states for all interactive elements.
- Use semantic HTML elements by default instead of generic div structures.
- Use ARIA attributes only when native semantics are insufficient.

## SEO & Metadata

- Use Next.js generateMetadata() for metadata.
- Use one H1 per page.
- Use heading levels in logical order according to content hierarchy.
- Do not skip heading levels.
