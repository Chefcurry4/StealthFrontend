import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";

const PrivacyPolicy = () => {
  const { modeConfig } = useBackgroundTheme();

  return (
    <div className="flex-1">
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-sm opacity-60 mb-8">Last updated: December 14, 2025</p>

          <div 
            className="prose prose-lg max-w-none space-y-8"
            style={{ color: modeConfig.textColor }}
          >
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="opacity-80 leading-relaxed">
                Welcome to Students Hub. We are committed to protecting your personal information and your right to privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li>Account information (email address, username, password)</li>
                <li>Profile information (country, birthday, profile photo)</li>
                <li>Learning preferences and saved courses, labs, and programs</li>
                <li>Learning agreements and academic planning data</li>
                <li>Communications with our AI Study Advisor</li>
                <li>Course reviews and ratings you submit</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li>Provide, maintain, and improve our services</li>
                <li>Personalize your experience and provide tailored recommendations</li>
                <li>Process your learning agreements and academic planning</li>
                <li>Communicate with you about updates and new features</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Ensure the security and integrity of our platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
              <p className="opacity-80 leading-relaxed">
                We do not sell your personal information. We may share your information with third-party service providers 
                who assist us in operating our platform, such as hosting services and analytics providers. 
                These providers are bound by contractual obligations to keep your information confidential.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="opacity-80 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
                over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate or incomplete information</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
              <p className="opacity-80 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at: 
                <span className="font-medium"> privacy@studentshub.com</span>
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
