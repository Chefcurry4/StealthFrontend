import { useBackgroundTheme } from "@/contexts/BackgroundThemeContext";
import { SEO } from "@/components/SEO";

const TermsOfService = () => {
  const { modeConfig } = useBackgroundTheme();

  return (
    <>
      <SEO 
        title="Terms of Service"
        description="Read the Terms of Service for Student Hub. Understand your rights and responsibilities when using our academic planning platform."
        keywords={["terms of service", "user agreement", "legal terms", "study abroad", "academic planning"]}
      />
      <div className="flex-1">
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
          <p className="text-sm opacity-60 mb-8">Last updated: January 9, 2026</p>

          <div 
            className="prose prose-lg max-w-none space-y-8"
            style={{ color: modeConfig.textColor }}
          >
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="opacity-80 leading-relaxed">
                By accessing or using Student Hub, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our platform. Student Hub is 
                an international study planning platform designed to help students discover universities, 
                explore courses and research labs, and build learning agreements with AI-powered guidance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                Student Hub provides the following services:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80 mb-4">
                <li><strong>University & Course Discovery:</strong> Browse and search universities, courses, and academic programs</li>
                <li><strong>Research Lab Exploration:</strong> Discover research labs, principal investigators, and research topics</li>
                <li><strong>AI Study Advisor:</strong> Receive personalized academic guidance powered by Google Gemini AI</li>
                <li><strong>AI Course Recommendations:</strong> Get intelligent course suggestions based on your interests and saved items</li>
                <li><strong>AI Email Composer:</strong> Generate professional email drafts for contacting professors and labs</li>
                <li><strong>Learning Agreement Builder:</strong> Create and manage learning agreements for exchange semesters</li>
                <li><strong>Workbench:</strong> Organize saved courses, labs, programs, and access your AI conversation history</li>
                <li><strong>Digital Diary:</strong> Plan your semester with notebooks, notes, and lab communication tracking</li>
                <li><strong>Reviews & Ratings:</strong> Read and submit reviews for courses and research labs</li>
              </ul>
              <p className="opacity-80 leading-relaxed">
                <strong>Important:</strong> Student Hub is a planning and discovery tool. We do not guarantee admission, 
                enrollment, or acceptance at any university, course, or research lab. All academic decisions should be 
                verified with your home and host institutions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                To access certain features (Workbench, Diary, AI Advisor, saving items), you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li>Provide accurate and complete registration information including a valid email address</li>
                <li>Maintain the security of your account credentials and not share your login with others</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
                <li>Be responsible for all activities that occur under your account</li>
                <li>Use only one account per person unless explicitly authorized</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li>Use the platform for any unlawful purpose or in violation of university policies</li>
                <li>Submit false, misleading, or fraudulent information in reviews, learning agreements, or profile data</li>
                <li>Interfere with the proper functioning of the platform or attempt to bypass security measures</li>
                <li>Attempt to gain unauthorized access to our systems, databases, or other users' accounts</li>
                <li>Harass, abuse, threaten, or submit inappropriate content about professors, students, or institutions</li>
                <li>Scrape, crawl, or use automated tools to extract data from the platform</li>
                <li>Post content that infringes intellectual property rights or violates any third-party rights</li>
                <li>Use the AI features to generate harmful, deceptive, or inappropriate content</li>
                <li>Misrepresent AI-generated content as official university communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. User Content</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                You retain ownership of content you create and submit, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80 mb-4">
                <li>Course and lab reviews</li>
                <li>Learning agreements</li>
                <li>Diary entries and notebook pages</li>
                <li>Documents you upload</li>
                <li>Profile information and photos</li>
              </ul>
              <p className="opacity-80 leading-relaxed">
                By submitting content, you grant Student Hub a non-exclusive, worldwide, royalty-free license to use, 
                display, and distribute that content in connection with our services. Reviews you submit are visible 
                to other users. You are responsible for ensuring your content is accurate, does not violate any 
                third-party rights, and complies with these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. AI-Generated Content & Disclaimer</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                Student Hub uses Google Gemini AI to power several features. Important disclaimers:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li><strong>AI Study Advisor:</strong> Provides general academic guidance based on available data. Responses are for informational purposes only and should not replace advice from academic advisors, professors, or institutional staff.</li>
                <li><strong>AI Course Recommendations:</strong> Suggestions are based on your saved items and preferences. Always verify course availability, prerequisites, and eligibility with the institution.</li>
                <li><strong>AI Email Drafts:</strong> Generated emails are templates that should be reviewed and personalized before sending. The platform is not responsible for the outcome of communications based on AI drafts.</li>
                <li><strong>Accuracy:</strong> AI-generated content may contain errors, outdated information, or inaccuracies. Always verify important information with official university sources.</li>
                <li><strong>Not Official Advice:</strong> AI features do not constitute official academic advising, legal advice, or institutional recommendations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Academic Information Disclaimer</h2>
              <p className="opacity-80 leading-relaxed mb-4">
                Student Hub aggregates information about universities, courses, research labs, and faculty from various sources:
              </p>
              <ul className="list-disc pl-6 space-y-2 opacity-80">
                <li>Course information, credits, schedules, and prerequisites are subject to change without notice</li>
                <li>University policies, admission requirements, and exchange agreements may vary</li>
                <li>Research lab availability, topics, and faculty affiliations may change</li>
                <li>Teacher profiles, publications, and h-index data are informational and may not be current</li>
              </ul>
              <p className="opacity-80 leading-relaxed mt-4">
                Always verify academic information directly with the relevant institution before making enrollment decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Learning Agreements</h2>
              <p className="opacity-80 leading-relaxed">
                The Learning Agreement feature helps you organize course selections for exchange semesters. 
                Learning agreements created on Student Hub are planning tools and do not constitute official 
                agreements with any institution. You must follow your home and host institution's official 
                processes for submitting and approving learning agreements. Credit transfers are subject 
                to institutional approval.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Intellectual Property</h2>
              <p className="opacity-80 leading-relaxed">
                The Student Hub platform, including its design, user interface, features, code, and original content 
                (excluding user-generated content), is owned by Student Hub and protected by intellectual property laws. 
                You may not copy, modify, distribute, sell, or lease any part of our platform or proprietary content 
                without written permission. The Student Hub name, logo, and branding are our trademarks.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Disclaimer of Warranties</h2>
              <p className="opacity-80 leading-relaxed">
                The platform is provided "as is" and "as available" without warranties of any kind, either express or implied. 
                We do not guarantee that the service will be uninterrupted, error-free, secure, or that information about 
                courses, labs, and programs is always current or accurate. University and course information is subject 
                to change. AI-generated content may contain errors. Use of the platform is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Limitation of Liability</h2>
              <p className="opacity-80 leading-relaxed">
                To the fullest extent permitted by law, Student Hub and its team shall not be liable for any indirect, 
                incidental, consequential, special, or punitive damages arising from your use of the platform, including 
                but not limited to: decisions made based on AI recommendations or course information; failed course 
                enrollments or credit transfers; communications sent using AI-generated email drafts; loss of data, 
                learning agreements, or diary content; or any academic outcomes resulting from platform use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
              <p className="opacity-80 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violations of these terms, 
                abuse of platform features, submission of fraudulent content, or for any other reason at our discretion. 
                You may delete your account at any time through your profile settings. Upon termination, your saved items, 
                learning agreements, and diary content may be permanently deleted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Beta Service</h2>
              <p className="opacity-80 leading-relaxed">
                Student Hub is currently in beta. Features may change, be added, or removed without notice. 
                We appreciate your feedback as we continue to improve the platform. Beta status means some 
                features may be incomplete or experimental.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
              <p className="opacity-80 leading-relaxed">
                We may update these Terms of Service from time to time. We will notify you of significant changes 
                by posting a notice on the platform. Continued use after changes constitutes acceptance of the new terms. 
                It is your responsibility to review these terms periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Contact Us</h2>
              <p className="opacity-80 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at: 
                <span className="font-medium"> legal@studenthub.com</span>
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
