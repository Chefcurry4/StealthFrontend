import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { SEO } from "@/components/SEO";

const CookiePolicy = () => {
  const { modeConfig } = useBackgroundTheme();

  return (
    <>
      <SEO 
        title="Cookie Policy"
        description="Learn about how UniPandan uses cookies and similar technologies. Understand what data is stored and how to manage your preferences."
        keywords={["cookie policy", "cookies", "local storage", "data storage", "privacy"]}
      />
      <div className="flex-1">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">Cookie Policy</h1>
            <p className="text-sm opacity-60 mb-8">Last updated: January 9, 2026</p>

            <div 
              className="prose prose-lg max-w-none space-y-8"
              style={{ color: modeConfig.textColor }}
            >
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
                <p className="opacity-80 leading-relaxed">
                  Cookies are small text files that are stored on your device when you visit a website. 
                  They help websites remember your preferences and improve your browsing experience. 
                  UniPandan uses cookies and similar technologies (including local storage) to provide 
                  and improve our academic planning services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium mb-2">Essential Cookies (Required)</h3>
                    <p className="opacity-80 leading-relaxed">
                      These cookies are necessary for UniPandan to function properly. They enable core functionality 
                      including user authentication, session management, and security features. Without these cookies, 
                      you cannot log in, save items, or use the AI Study Advisor. These cookies cannot be disabled.
                    </p>
                    <ul className="list-disc pl-6 space-y-1 opacity-80 mt-2">
                      <li><strong>Supabase Auth Tokens:</strong> Secure authentication tokens that verify your identity and maintain your logged-in session</li>
                      <li><strong>Session Cookies:</strong> Track your active session to provide seamless navigation</li>
                      <li><strong>Security Cookies:</strong> Protect against cross-site request forgery and other security threats</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium mb-2">Preference Cookies</h3>
                    <p className="opacity-80 leading-relaxed">
                      These cookies remember your preferences and settings to personalize your experience on UniPandan:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 opacity-80 mt-2">
                      <li><strong>Theme Preference:</strong> Remembers your selected theme (light mode, dark mode, or system preference)</li>
                      <li><strong>Background Theme:</strong> Stores your selected background style and visual customizations</li>
                      <li><strong>Display Options:</strong> Remembers list/grid view preferences and sorting options</li>
                      <li><strong>Guide Completion:</strong> Tracks whether you've completed the interactive website tour</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium mb-2">Functional Cookies</h3>
                    <p className="opacity-80 leading-relaxed">
                      These cookies enable enhanced functionality to improve your academic planning experience:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 opacity-80 mt-2">
                      <li><strong>Recently Viewed:</strong> Tracks recently viewed courses, labs, and universities for quick access</li>
                      <li><strong>Search History:</strong> Remembers your recent searches for convenience</li>
                      <li><strong>Diary Draft Data:</strong> Temporarily stores unsaved diary and notebook content</li>
                      <li><strong>Learning Agreement Drafts:</strong> Saves work-in-progress learning agreements locally</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium mb-2">Performance Cookies</h3>
                    <p className="opacity-80 leading-relaxed">
                      These cookies help us understand how visitors interact with UniPandan so we can improve our platform:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 opacity-80 mt-2">
                      <li><strong>Page Load Metrics:</strong> Measures page loading performance to optimize speed</li>
                      <li><strong>Error Tracking:</strong> Helps identify and fix technical issues</li>
                      <li><strong>Feature Usage:</strong> Aggregated data on which features are most used</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Third-Party Cookies & Services</h2>
                <p className="opacity-80 leading-relaxed mb-4">
                  Some cookies are set by third-party services we integrate with to provide platform functionality:
                </p>
                <ul className="list-disc pl-6 space-y-2 opacity-80">
                  <li><strong>Supabase:</strong> Provides authentication, database services, and edge functions. Sets essential cookies for user authentication and session management. Required for login and account features.</li>
                  <li><strong>Lovable:</strong> Our development and hosting platform that provides the AI gateway. May set cookies for session management and platform functionality.</li>
                  <li><strong>Gemini API (via Lovable Gateway):</strong> Powers our AI Study Advisor features. Processes conversation data server-side.</li>
                  <li><strong>Perplexity API (via Lovable Gateway):</strong> Provides AI-powered search capabilities. Processes queries server-side.</li>
                  <li><strong>OpenAI API:</strong> Used for additional AI features. Processes data server-side without setting client cookies.</li>
                  <li><strong>Firecrawl:</strong> Enables web scraping for gathering university data. Does not set cookies on your device.</li>
                  <li><strong>Notion:</strong> Used for content management. May set cookies if you interact with embedded Notion content.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. How Long Cookies Last</h2>
                <p className="opacity-80 leading-relaxed mb-4">
                  Cookies can be categorized by their duration:
                </p>
                <ul className="list-disc pl-6 space-y-2 opacity-80">
                  <li><strong>Session cookies:</strong> Deleted when you close your browser. Used for temporary session data.</li>
                  <li><strong>Persistent cookies:</strong> Remain on your device for a set period or until you delete them.</li>
                </ul>
                <p className="opacity-80 leading-relaxed mt-4">
                  Specific cookie durations for UniPandan:
                </p>
                <ul className="list-disc pl-6 space-y-2 opacity-80 mt-2">
                  <li><strong>Authentication tokens:</strong> Up to 7 days (refresh tokens up to 30 days)</li>
                  <li><strong>Theme preferences:</strong> Up to 1 year</li>
                  <li><strong>Recently viewed items:</strong> Up to 30 days</li>
                  <li><strong>Guide completion status:</strong> Indefinitely (until cleared)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Local Storage</h2>
                <p className="opacity-80 leading-relaxed mb-4">
                  In addition to cookies, UniPandan uses browser local storage to store data locally on your device:
                </p>
                <ul className="list-disc pl-6 space-y-2 opacity-80">
                  <li><strong>Theme Settings:</strong> Your light/dark mode preference and background theme selection</li>
                  <li><strong>Recently Viewed:</strong> List of recently accessed courses, labs, universities, and teachers</li>
                  <li><strong>Guide State:</strong> Whether you've seen the welcome prompt and completed the interactive tour</li>
                  <li><strong>Cached Data:</strong> Temporary caching of frequently accessed data to improve performance</li>
                  <li><strong>React Query Cache:</strong> Client-side caching of API responses for faster page loads</li>
                </ul>
                <p className="opacity-80 leading-relaxed mt-4">
                  Local storage data persists until manually cleared through your browser settings or by signing out.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Managing Cookies</h2>
                <p className="opacity-80 leading-relaxed mb-4">
                  You have several options for managing cookies:
                </p>
                <ul className="list-disc pl-6 space-y-2 opacity-80">
                  <li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies through settings. Look for "Privacy" or "Cookies" in your browser's settings menu.</li>
                  <li><strong>Clear on sign out:</strong> Signing out of UniPandan will clear your authentication cookies.</li>
                  <li><strong>Incognito/Private mode:</strong> Using private browsing will prevent cookies from being stored permanently.</li>
                  <li><strong>Clear local storage:</strong> You can clear local storage through your browser's developer tools or by clearing site data.</li>
                </ul>
                <p className="opacity-80 leading-relaxed mt-4">
                  <strong>Important:</strong> Blocking essential cookies will prevent you from logging in and using core 
                  features of UniPandan. Preference and functional cookies enhance your experience but are not 
                  strictly required.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
                <p className="opacity-80 leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in our practices, 
                  technology, or for legal and regulatory reasons. We encourage you to periodically 
                  review this page for the latest information about our cookie usage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
                <p className="opacity-80 leading-relaxed">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us at: 
                  <span className="font-medium"> privacy@unipandan.com</span>
                </p>
              </section>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CookiePolicy;
