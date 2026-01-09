import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { SEO } from "@/components/SEO";

const PrivacyPolicy = () => {
  const { modeConfig } = useBackgroundTheme();

  return (
    <>
      <SEO 
        title="Privacy Policy"
        description="Learn how Student Hub collects, uses, and protects your personal information. Read our privacy policy for details on data security and your rights."
        keywords={["privacy policy", "data protection", "student data", "personal information", "study abroad", "AI advisor"]}
      />
      <div className="flex-1">
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-sm opacity-60 mb-8">Last updated: January 9, 2026</p>

          <div 
            className="prose prose-lg max-w-none space-y-8"
            style={{ color: modeConfig.textColor }}
          >
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="opacity-80 leading-relaxed">
                Welcome to Student Hub, an international study planning platform that helps students discover universities, 
                explore courses and research labs, and build learning agreements with AI-powered guidance. We are committed 
                to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              
              <h3 className="text-xl font-medium mb-2">Account & Profile Information</h3>
              <ul className="list-disc pl-6 space-y-2 opacity-80 mb-4">
                <li>Email address and authentication credentials (managed securely via Supabase Authentication)</li>
                <li>Profile information including display name, country, birthday, and profile photo</li>
                <li>User preferences such as theme settings (light/dark mode) and display options</li>
              </ul>

              <h3 className="text-xl font-medium mb-2">Academic Planning Data</h3>
              <ul className="list-disc pl-6 space-y-2 opacity-80 mb-4">
                <li>Saved courses, research labs, and academic programs</li>
                <li>Pinned items and bookmarks for quick access</li>
                <li>Learning agreements including course selections, credit mappings, and approval status</li>
                <li>Diary entries, notebook pages, and semester planning data</li>
              </ul>

              <h3 className="text-xl font-medium mb-2">AI Interaction Data</h3>
              <ul className="list-disc pl-6 space-y-2 opacity-80 mb-4">
                <li>Conversations with our AI Study Advisor including questions and responses</li>
                <li>AI-generated course recommendations based on your preferences</li>
                <li>AI-drafted emails for contacting professors and research labs</li>
              </ul>

              <h3 className="text-xl font-medium mb-2">User-Generated Content</h3>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li>Course reviews and ratings you submit</li>
                <li>Lab reviews and feedback</li>
                <li>Documents you upload or create within the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li>Provide and maintain our academic planning services including course discovery, lab exploration, and learning agreement creation</li>
                <li>Power our AI Study Advisor to provide personalized academic guidance and course recommendations using Google Gemini</li>
                <li>Generate AI-assisted email drafts for contacting professors and research labs</li>
                <li>Display university locations on interactive maps using Mapbox</li>
                <li>Personalize your experience including theme preferences and recently viewed items</li>
                <li>Process and store your learning agreements and semester planning data</li>
                <li>Enable you to save, organize, and manage courses, labs, and programs in your Workbench</li>
                <li>Aggregate and display platform statistics (user counts, review counts, saved items)</li>
                <li>Ensure the security and integrity of our platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                We integrate with the following third-party services to provide our platform functionality:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li><strong>Supabase:</strong> Provides authentication, database storage, and edge functions for our backend services. Your account data and platform content are stored securely in Supabase infrastructure.</li>
                <li><strong>Google Gemini (via Lovable AI Gateway):</strong> Powers our AI Study Advisor, course recommendations, and email draft generation. Conversation data is processed to provide AI responses but is not used to train AI models.</li>
                <li><strong>Mapbox:</strong> Displays interactive maps showing university locations. Map usage data may be collected by Mapbox according to their privacy policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Information Sharing</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li><strong>Public Profile:</strong> If you choose to make your profile public, other users may view your display name, profile photo, and public activity</li>
                <li><strong>Reviews:</strong> Course and lab reviews you submit are visible to other users of the platform</li>
                <li><strong>Service Providers:</strong> We share data with third-party services (Supabase, Google Gemini, Mapbox) as necessary to provide platform functionality</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li>Authentication is handled securely through Supabase with encrypted password storage</li>
                <li>All data transmission uses HTTPS encryption</li>
                <li>Database access is protected with row-level security policies</li>
                <li>Session tokens are securely managed and expire appropriately</li>
              </ul>
              <p className="opacity-80 leading-relaxed mt-4">
                However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="opacity-80 leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide services. 
                Your saved items, learning agreements, diary entries, and AI conversation history are retained until you 
                delete them or close your account. You can delete individual items through the platform interface or 
                request complete account deletion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Your Rights</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li>Access and receive a copy of your personal data including saved items, learning agreements, and AI conversations</li>
                <li>Rectify inaccurate or incomplete profile information</li>
                <li>Delete your personal data and account through profile settings</li>
                <li>Export your learning agreements and diary content</li>
                <li>Object to or restrict processing of your data</li>
                <li>Withdraw consent for optional data processing at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="opacity-80 leading-relaxed">
                Student Hub is designed for university and higher education students. We do not knowingly collect 
                personal information from children under 16. If you believe we have collected information from a 
                child under 16, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="opacity-80 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for 
                legal and regulatory reasons. We will notify you of significant changes by posting a notice on 
                the platform. Your continued use of Student Hub after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="opacity-80 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at: 
                <span className="font-medium"> privacy@studenthub.com</span>
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default PrivacyPolicy;
