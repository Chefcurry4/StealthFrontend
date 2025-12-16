import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  type?: "website" | "article" | "profile";
  image?: string;
  url?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  // Structured data
  structuredData?: object;
}

const DEFAULT_TITLE = "Students Hub";
const DEFAULT_DESCRIPTION = "Plan your studies smartly with AI-powered course recommendations, university exploration, research labs discovery, and learning agreement management.";
const DEFAULT_IMAGE = "https://lovable.dev/opengraph-image-p98pqg.png";
const SITE_NAME = "Students Hub";

export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  type = "website",
  image = DEFAULT_IMAGE,
  url,
  keywords = [],
  author = "Students Hub",
  publishedTime,
  modifiedTime,
  structuredData,
}: SEOProps) => {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Plan Your Studies Smartly`;
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  
  const defaultKeywords = [
    "university courses",
    "study abroad",
    "learning agreement",
    "exchange program",
    "research labs",
    "AI course recommendations",
    "student planning",
    "higher education",
  ];
  
  const allKeywords = [...new Set([...defaultKeywords, ...keywords])].join(", ");

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: typeof window !== "undefined" ? window.location.origin : "",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${typeof window !== "undefined" ? window.location.origin : ""}/courses?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article specific meta (for blog posts, reviews) */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Structured Data / JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || websiteSchema)}
      </script>
    </Helmet>
  );
};

// Helper function to generate course structured data
export const generateCourseSchema = (course: {
  name: string;
  description?: string;
  code?: string;
  ects?: number;
  professor?: string;
  university?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: course.name,
  description: course.description || `${course.name} course`,
  courseCode: course.code,
  numberOfCredits: course.ects,
  provider: course.university ? {
    "@type": "Organization",
    name: course.university,
  } : undefined,
  instructor: course.professor ? {
    "@type": "Person",
    name: course.professor,
  } : undefined,
});

// Helper function to generate university structured data
export const generateUniversitySchema = (university: {
  name: string;
  description?: string;
  country?: string;
  website?: string;
  logo?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "CollegeOrUniversity",
  name: university.name,
  description: university.description || `${university.name} - Higher Education Institution`,
  url: university.website,
  logo: university.logo,
  address: university.country ? {
    "@type": "PostalAddress",
    addressCountry: university.country,
  } : undefined,
});

// Helper function to generate lab/research organization structured data
export const generateLabSchema = (lab: {
  name: string;
  description?: string;
  topics?: string;
  link?: string;
  university?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "ResearchOrganization",
  name: lab.name,
  description: lab.description || `${lab.name} - Research Laboratory`,
  url: lab.link,
  parentOrganization: lab.university ? {
    "@type": "CollegeOrUniversity",
    name: lab.university,
  } : undefined,
  knowsAbout: lab.topics?.split(",").map(t => t.trim()),
});

// Helper function to generate program structured data
export const generateProgramSchema = (program: {
  name: string;
  description?: string;
  level?: string;
  duration?: string;
  university?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalProgram",
  name: program.name,
  description: program.description || `${program.name} program`,
  educationalProgramMode: "full-time",
  educationalCredentialAwarded: program.level === "Ma" ? "Master's Degree" : "Bachelor's Degree",
  timeToComplete: program.duration,
  provider: program.university ? {
    "@type": "CollegeOrUniversity",
    name: program.university,
  } : undefined,
});

// Helper function to generate FAQ structured data
export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(faq => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

// Helper function to generate breadcrumb structured data
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export default SEO;
