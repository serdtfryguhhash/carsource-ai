import Link from "next/link";
import { Wrench } from "lucide-react";

const footerLinks = {
  Vehicles: [
    { label: "JDM", href: "/garage?category=jdm" },
    { label: "Muscle", href: "/garage?category=muscle" },
    { label: "European", href: "/garage?category=european" },
    { label: "Trucks", href: "/garage?category=truck" },
    { label: "All Vehicles", href: "/garage" },
  ],
  Parts: [
    { label: "Engine", href: "/garage" },
    { label: "Exhaust", href: "/garage" },
    { label: "Turbo & Supercharger", href: "/garage" },
    { label: "Suspension", href: "/garage" },
    { label: "All Parts", href: "/garage" },
  ],
  Resources: [
    { label: "Build Planner", href: "/build-planner" },
    { label: "AI Advisor", href: "/advisor" },
    { label: "My Garage", href: "/garage" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080b11]">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-red-500" />
              <span className="text-lg font-bold">
                <span className="text-red-500">CarSource</span>
                <span className="text-white"> AI</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Find the perfect mods for your ride. Select your car, browse parts, and see real performance gains.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} CarSource AI. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Built for car enthusiasts, by car enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  );
}
