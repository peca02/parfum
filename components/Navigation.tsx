import Link from "next/link";
import { NavigationIntro } from "@/components/NavigationIntro";

const navLinks = [
  { label: "Essence", href: "#essence" },
  { label: "Linger", href: "#linger" },
  { label: "Presence", href: "#presence" },
];

const ctaLink = { label: "Buy", href: "#buy" };

const focusStyles =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glass-foreground";

export function Navigation() {
  return (
    // The header spans the full width, so it lets clicks through outside the nav itself.
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-[4vw] pt-4 md:pt-6">
      <NavigationIntro>
        <ul className="flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                data-nav-link
                className={`block rounded-full px-3 py-2 text-sm uppercase font-semibold text-glass-foreground/80 transition-colors hover:text-glass-foreground md:px-5 md:text-base ${focusStyles}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={ctaLink.href}
              data-nav-link
              data-nav-cta
              className={`block rounded-full bg-cta px-4 py-2 text-sm uppercase font-bold text-cta-foreground transition-colors md:px-6 md:text-base ${focusStyles}`}
            >
              {ctaLink.label}
            </Link>
          </li>
        </ul>
      </NavigationIntro>
    </header>
  );
}
