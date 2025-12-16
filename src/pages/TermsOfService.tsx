import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { SEO } from "@/components/SEO";

const TermsOfService = () => {
  const { modeConfig } = useBackgroundTheme();

  return (
    <>
      <SEO 
        title="Terms of Service"
        description="Read the Terms of Service for Students Hub. Understand your rights and responsibilities when using our academic planning platform."
        keywords={["terms of service", "user agreement", "legal terms"]}
      />
      <div className="flex-1">
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
          <p className="text-sm opacity-60 mb-8">Last updated: December 14, 2025</p>

          <div 
            className="prose prose-lg max-w-none space-y-8"
            style={{ color: modeConfig.textColor }}
          >
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="opacity-80 leading-relaxed">
                By accessing or using Students Hub, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="opacity-80 leading-relaxed">
                Students Hub is a platform designed to help university students plan their international study semesters, 
                explore courses, labs, and programs, create learning agreements, and receive AI-powered academic guidance. 
                We provide tools for academic planning but do not guarantee admission or enrollment at any institution.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li>Use the platform for any unlawful purpose</li>
                <li>Submit false or misleading information</li>
                <li>Interfere with the proper functioning of the platform</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Post content that infringes intellectual property rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. User Content</h2>
              <p className="opacity-80 leading-relaxed">
                You retain ownership of content you submit (reviews, learning agreements, etc.). By submitting content, 
                you grant us a non-exclusive, worldwide license to use, display, and distribute that content 
                in connection with our services. You are responsible for ensuring your content does not violate 
                any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. AI-Generated Content</h2>
              <p className="opacity-80 leading-relaxed">
                Our AI Study Advisor provides recommendations based on available data. AI-generated content is for 
                informational purposes only and should not be considered as official academic advice. 
                Always verify information with your home and host institutions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
              <p className="opacity-80 leading-relaxed">
                The Students Hub platform, including its design, features, and content (excluding user-generated content), 
                is owned by us and protected by intellectual property laws. You may not copy, modify, or distribute 
                our proprietary content without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
              <p className="opacity-80 leading-relaxed">
                The platform is provided "as is" without warranties of any kind. We do not guarantee that the service 
                will be uninterrupted, error-free, or that information about courses and programs is always current. 
                University and course information is subject to change.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="opacity-80 leading-relaxed">
                To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, 
                consequential, or punitive damages arising from your use of the platform, including decisions 
                made based on course recommendations or AI guidance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
              <p className="opacity-80 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violations of these terms 
                or for any other reason at our discretion. You may delete your account at any time through your 
                profile settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
              <p className="opacity-80 leading-relaxed">
                We may update these Terms of Service from time to time. We will notify you of significant changes 
                by posting a notice on the platform. Continued use after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="opacity-80 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at: 
                <span className="font-medium"> legal@studentshub.com</span>
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default TermsOfService;
