import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";

const CookiePolicy = () => {
  const { modeConfig } = useBackgroundTheme();

  return (
    <div className="flex-1">
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Cookie Policy</h1>
          <p className="text-sm opacity-60 mb-8">Last updated: December 14, 2025</p>

          <div 
            className="prose prose-lg max-w-none space-y-8"
            style={{ color: modeConfig.textColor }}
          >
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
              <p className="opacity-80 leading-relaxed">
                Cookies are small text files that are stored on your device when you visit a website. 
                They help websites remember your preferences and improve your browsing experience. 
                We use cookies and similar technologies to provide and improve our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">Essential Cookies</h3>
                  <p className="opacity-80 leading-relaxed">
                    These cookies are necessary for the platform to function properly. They enable core functionality 
                    such as authentication, security, and session management. Without these cookies, 
                    the platform cannot work correctly.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">Preference Cookies</h3>
                  <p className="opacity-80 leading-relaxed">
                    These cookies remember your preferences, such as your selected theme (light/dark mode), 
                    language settings, and display options. They help personalize your experience.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">Analytics Cookies</h3>
                  <p className="opacity-80 leading-relaxed">
                    We use analytics cookies to understand how visitors interact with our platform. 
                    This helps us improve our services and identify areas that need enhancement. 
                    Data collected is aggregated and anonymized.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">Functional Cookies</h3>
                  <p className="opacity-80 leading-relaxed">
                    These cookies enable enhanced functionality and personalization, such as remembering 
                    your recent searches, saved items, and learning agreement drafts.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Third-Party Cookies</h2>
              <p className="opacity-80 leading-relaxed">
                Some cookies may be set by third-party services we use, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80 mt-4">
                <li><strong>Supabase:</strong> For authentication and database services</li>
                <li><strong>Mapbox:</strong> For displaying university locations on maps</li>
                <li><strong>Analytics providers:</strong> For understanding platform usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. How Long Cookies Last</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                Cookies can be categorized by their duration:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Persistent cookies:</strong> Remain on your device for a set period or until you delete them</li>
              </ul>
              <p className="opacity-80 leading-relaxed mt-4">
                Our authentication cookies typically last up to 30 days, while preference cookies may last up to 1 year.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Managing Cookies</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                You have several options for managing cookies:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies through their settings</li>
                <li><strong>Platform preferences:</strong> You can adjust some cookie preferences in your account settings</li>
                <li><strong>Opt-out links:</strong> Some third-party services provide opt-out mechanisms</li>
              </ul>
              <p className="opacity-80 leading-relaxed mt-4">
                Note that blocking certain cookies may affect the functionality of our platform. 
                Essential cookies cannot be disabled as they are required for basic operations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Local Storage</h2>
              <p className="opacity-80 leading-relaxed">
                In addition to cookies, we use browser local storage to store certain preferences 
                and data locally on your device. This includes your theme preferences, recent searches, 
                and cached data to improve performance. Local storage data can be cleared through 
                your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
              <p className="opacity-80 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons. We encourage you to periodically 
                review this page for the latest information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              <p className="opacity-80 leading-relaxed">
                If you have any questions about our use of cookies, please contact us at: 
                <span className="font-medium"> privacy@studentshub.com</span>
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CookiePolicy;
