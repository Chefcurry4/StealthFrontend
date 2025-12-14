import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";

export const Footer = () => {
  const { modeConfig } = useBackgroundTheme();

  const footerLinks = {
    product: [
      { name: "Home", href: "/" },
      { name: "Universities", href: "/universities" },
      { name: "Courses", href: "/courses" },
      { name: "Labs", href: "/labs" },
      { name: "Workbench", href: "/workbench" },
    ],
    resources: [
      { name: "Help Center", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "API", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
    ],
  };

  return (
    <footer 
      className="border-t backdrop-blur-md mt-auto"
      style={{ 
        borderColor: modeConfig.ui.cardBorder,
        backgroundColor: modeConfig.ui.cardBackground,
        color: modeConfig.textColor
      }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              <span className="text-xl font-bold">Students Hub</span>
            </Link>
            <p className="text-sm opacity-70">
              Plan your international study semester with AI-powered guidance
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div 
          className="mt-8 pt-8 border-t text-center text-sm opacity-70"
          style={{ borderColor: modeConfig.ui.cardBorder }}
        >
          © 2025 Students Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
