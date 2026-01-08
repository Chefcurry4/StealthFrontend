import { useState } from "react";
import { Search, ChevronDown, ExternalLink, BookOpen, HelpCircle, MessageSquare, FileText, GraduationCap, FlaskConical, Users, Briefcase, Calendar, Mail, Keyboard, BarChart3, Sparkles, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO, generateFAQSchema } from "@/components/SEO";

const faqs = [
  {
    category: "Getting Started",
    icon: BookOpen,
    questions: [
      {
        question: "What is Students Hub?",
        answer: "Students Hub is a comprehensive platform designed for university students to explore courses, discover research labs, find universities, and plan their academic journey. It includes AI-powered guidance with multiple AI models, an interactive diary for semester planning, email drafting tools, document management, and learning agreement creation."
      },
      {
        question: "How do I create an account?",
        answer: "Click the 'Sign In' button in the header, then select 'Sign Up'. Enter your email address and create a password. You'll receive a confirmation email to verify your account."
      },
      {
        question: "Is Students Hub free to use?",
        answer: "Yes! Students Hub is completely free for all students. You can browse universities, courses, and labs without an account. Create an account to save items, use the AI advisor, access the Diary, and draft emails."
      },
      {
        question: "What features are available?",
        answer: "Key features include: browsing 1400+ courses and 420+ labs, AI-powered study advisor with multiple models (Gemini, GPT-5, Perplexity), interactive Diary for semester planning, email drafting assistance, document uploads, course and lab reviews, professor contact information, and platform statistics."
      }
    ]
  },
  {
    category: "Universities & Courses",
    icon: GraduationCap,
    questions: [
      {
        question: "How do I find courses at a specific university?",
        answer: "Navigate to the Universities page, click on a university, then browse its available programs. Each program page lists all associated courses with detailed information including ECTS credits, professors, topics, exam types, and descriptions."
      },
      {
        question: "Can I save courses for later?",
        answer: "Yes! Click the bookmark icon on any course card to save it to your Workbench. You can access all saved courses, labs, and programs from your Workbench sidebar or Profile > Saved Items section."
      },
      {
        question: "How do I leave a course review?",
        answer: "Navigate to any course detail page and scroll down to the Reviews section. You can rate the course (1-5 stars), assess difficulty and workload levels, and leave a detailed comment to help other students. You'll earn 'EPIC Reviewer' status after 10 reviews!"
      },
      {
        question: "How do I search for specific courses?",
        answer: "Use the global search in the header to find courses by name, code, or professor. On the Courses page, you can filter by topics, ECTS credits, exam type, semester (winter/summer), and Bachelor/Master level."
      }
    ]
  },
  {
    category: "Research Labs",
    icon: FlaskConical,
    questions: [
      {
        question: "How are labs categorized?",
        answer: "Labs are automatically categorized by research domain based on their topics and faculty association. You can filter by research domains like AI & Machine Learning, Robotics, Biomedical, Energy & Environment, and many more."
      },
      {
        question: "Can I contact lab professors directly?",
        answer: "Yes! Click on any professor's name to view their popup profile, which includes their email address and research topics. Click the email to copy it to your clipboard, or use the AI Email Composer to draft a professional outreach email."
      },
      {
        question: "How do I find labs related to my interests?",
        answer: "Use the search bar on the Labs page, filter by research domain, or use the AI Advisor in Workbench to get personalized lab recommendations based on your academic interests and saved courses."
      },
      {
        question: "Can I review research labs?",
        answer: "Yes! Navigate to any lab detail page and scroll to the Reviews section. You can rate the lab and share your experience working with or researching the lab."
      }
    ]
  },
  {
    category: "AI Advisor (hubAI)",
    icon: Bot,
    questions: [
      {
        question: "What can the AI Advisor help me with?",
        answer: "hubAI can help you choose courses, find research labs matching your interests, plan your study abroad semester, generate semester plans, draft professional emails to professors, compare courses, and answer any questions about your academic journey."
      },
      {
        question: "Which AI models are available?",
        answer: "hubAI offers multiple AI models: Google Gemini (Flash for fast responses, Pro for advanced reasoning), OpenAI GPT-5 (standard and mini versions), and Perplexity Sonar (with web search, reasoning, and citation capabilities). Switch between models using the dropdown in the Workbench header."
      },
      {
        question: "Can I attach documents to my AI conversations?",
        answer: "Yes! You can upload text files, PDFs, images, and documents (up to 20MB). The AI can read your CV, transcripts, syllabi, or other documents to give personalized recommendations. Images are processed with OCR to extract text content."
      },
      {
        question: "How do I reference my saved courses or labs in a conversation?",
        answer: "You can reference saved items in two ways: 1) Type '@' in the chat input to see a popup of your saved courses and labs - select one to add it as context. 2) Drag and drop courses or labs from the sidebar directly into the chat area."
      },
      {
        question: "Can the AI generate a semester plan?",
        answer: "Yes! Ask hubAI to create a semester plan based on your interests, saved courses, or requirements. The AI will generate a structured plan that appears in the Semester Planner panel. You can save, edit, and manage multiple semester plans."
      },
      {
        question: "Are my conversations saved?",
        answer: "Yes, all your AI conversations are automatically saved to your account. Access conversation history from the Workbench sidebar. You can also export conversations as Markdown, plain text, or JSON files."
      },
      {
        question: "How do I search within a conversation?",
        answer: "Press Ctrl+F (Cmd+F on Mac) while in the Workbench to open the conversation search bar. Search results are highlighted and you can navigate between matches."
      }
    ]
  },
  {
    category: "Email Drafting",
    icon: Mail,
    questions: [
      {
        question: "How do I compose an email with AI assistance?",
        answer: "Click 'Compose Email' in the Workbench or sidebar. Fill in the purpose, recipient name, and any context. You can attach your documents (CV, transcripts) and select relevant courses or labs. The AI will generate a professional email draft."
      },
      {
        question: "Can the AI read my CV to personalize emails?",
        answer: "Yes! Upload your CV or other documents in the email composer, and the AI will extract your name, background, skills, and interests to create personalized outreach emails."
      },
      {
        question: "How do I refine parts of a generated email?",
        answer: "Select any text in an AI-generated email response and click 'Refine with AI' to improve that specific section. This is useful for polishing specific paragraphs or sentences."
      },
      {
        question: "Can I save email drafts?",
        answer: "Yes! After the AI generates an email, click the mail icon to save it to your Email Drafts. Access saved drafts from Profile > Email Drafts. You can also copy emails to clipboard or open them directly in your email client."
      }
    ]
  },
  {
    category: "Diary & Semester Planning",
    icon: Calendar,
    questions: [
      {
        question: "What is the Diary feature?",
        answer: "The Diary is an interactive notebook for planning your academic semester. You can create multiple pages, drag and drop courses and labs, add text notes, and use the semester planner module to organize your courses by winter/summer terms."
      },
      {
        question: "How do I add courses to a diary page?",
        answer: "Open the Diary sidebar to see your saved courses and labs. Drag any item onto the page canvas. You can also add text blocks, semester planner modules, and lab trackers using the modules section."
      },
      {
        question: "Can I organize courses by semester?",
        answer: "Yes! Add a 'Semester Planner' module to your page. It displays winter and summer semester zones. Drag courses into the appropriate zone. The planner automatically calculates total ECTS credits for each semester."
      },
      {
        question: "How do I export my diary pages?",
        answer: "Click the 'Export PNG' button in the toolbar to download the current page as a high-quality image. You can share this with advisors or keep it for your records."
      },
      {
        question: "Can I undo/redo changes in the Diary?",
        answer: "Yes! Use Ctrl+Z to undo and Ctrl+Shift+Z to redo. You can also use the undo/redo buttons in the toolbar when the sidebar is closed."
      }
    ]
  },
  {
    category: "Learning Agreements",
    icon: FileText,
    questions: [
      {
        question: "What is a learning agreement?",
        answer: "A learning agreement is a document that outlines the courses and labs you plan to take during a study abroad exchange. It helps ensure credits will transfer back to your home university."
      },
      {
        question: "How do I create a learning agreement?",
        answer: "Go to your Profile, navigate to Learning Agreements section. This feature is coming soon and will allow you to select your home and host universities, add courses and labs, and automatically calculate ECTS totals."
      },
      {
        question: "Can I export my learning agreement?",
        answer: "Yes! Once learning agreements are available, you'll be able to export them as PDF documents to share with your academic advisor or submit to your university's exchange office."
      }
    ]
  },
  {
    category: "Semester Planner (Workbench)",
    icon: Briefcase,
    questions: [
      {
        question: "How do I use the Semester Planner in Workbench?",
        answer: "Click the calendar icon in the Workbench header to open the Semester Planner panel. You can view AI-generated plans, save them, add courses from your saved items, and manage multiple semester plans."
      },
      {
        question: "Can the AI generate semester plans?",
        answer: "Yes! Ask hubAI something like 'Create a semester plan for a Master's in Computer Science focusing on machine learning'. The AI will generate a structured plan that automatically appears in the Semester Planner panel."
      },
      {
        question: "How do I save an AI-generated semester plan?",
        answer: "When the AI generates a semester plan, it appears in the Semester Planner panel as a temporary plan. Click 'Save Plan' to add it to your saved plans. You can then rename it and add or remove courses."
      }
    ]
  },
  {
    category: "Statistics & Analytics",
    icon: BarChart3,
    questions: [
      {
        question: "What statistics are available?",
        answer: "The Statistics page shows platform-wide data including: total courses and labs, course distribution by topics, ECTS distribution, exam type breakdowns, user growth trends, review counts, and popular research domains."
      },
      {
        question: "How do I access platform statistics?",
        answer: "Navigate to the Statistics page from the header menu. This page provides insights into the platform's content and user engagement with interactive charts and graphs."
      }
    ]
  },
  {
    category: "Account & Settings",
    icon: Users,
    questions: [
      {
        question: "How do I change my profile picture?",
        answer: "Go to your Profile page and click on your avatar/flashcard. Upload a new image (supported formats: JPG, PNG, GIF, max 5MB). Your profile picture appears across the platform including reviews and your user flashcard."
      },
      {
        question: "What is the user flashcard?",
        answer: "Your flashcard is a personalized card showing your profile photo, username, university, and student level. You can customize its color style in Profile > Preferences. Share your public profile with others using the user profile link."
      },
      {
        question: "How do I become an EPIC Reviewer?",
        answer: "Write 10 or more reviews (courses or labs combined) to earn the EPIC Reviewer badge. This badge appears on your profile and next to your reviews, helping other students identify experienced reviewers."
      },
      {
        question: "Can I change my email notification preferences?",
        answer: "Yes! Go to Profile > Preferences & Settings. You can toggle email notifications for reviews, learning agreements, and general updates."
      },
      {
        question: "How do I customize the appearance?",
        answer: "Go to Profile > Preferences to: switch between light/dark mode, choose from multiple background themes (grainy gradients), customize your flashcard color style, and set your language preference."
      },
      {
        question: "How do I delete my account?",
        answer: "Go to Profile > Account section. Click 'Delete Account' in the Danger Zone. This will permanently delete all your data including saved items, reviews, documents, and AI conversations."
      }
    ]
  },
  {
    category: "Keyboard Shortcuts",
    icon: Keyboard,
    questions: [
      {
        question: "What keyboard shortcuts are available?",
        answer: "Press '?' anywhere in the app to see all keyboard shortcuts. Key shortcuts include: Ctrl+N (new chat), Ctrl+F (search conversation), @ (mention courses/labs), Ctrl+Z/Ctrl+Shift+Z (undo/redo in Diary), and arrow keys for page navigation."
      },
      {
        question: "Workbench shortcuts",
        answer: "Ctrl+N: New conversation, Ctrl+Enter: Send message, @: Mention saved courses/labs, Ctrl+F: Search in conversation, Escape: Close sidebar or popup"
      },
      {
        question: "Diary shortcuts",
        answer: "Ctrl+Z: Undo last action, Ctrl+Shift+Z: Redo action, Ctrl+C: Copy selected item, Ctrl+V: Paste item, Delete: Delete selected item, G: Toggle grid overlay, ←/→: Navigate between pages"
      }
    ]
  }
];

const quickLinks = [
  { title: "Browse Universities", href: "/universities", icon: GraduationCap },
  { title: "Explore Courses", href: "/courses", icon: BookOpen },
  { title: "Discover Labs", href: "/labs", icon: FlaskConical },
  { title: "AI Workbench", href: "/workbench", icon: Bot },
  { title: "My Diary", href: "/diary", icon: Calendar },
  { title: "Statistics", href: "/statistics", icon: BarChart3 },
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  // Generate FAQ schema for structured data
  const allQuestions = faqs.flatMap(cat => cat.questions);
  const faqSchema = generateFAQSchema(allQuestions);

  return (
    <>
      <SEO 
        title="Help Center"
        description="Find answers to common questions about Students Hub. Learn how to use the AI advisor, plan your semester with the Diary, browse courses and labs, draft emails, and more."
        keywords={["help", "FAQ", "support", "how to", "student help", "AI advisor", "semester planning", "email drafting", "course reviews"]}
        structuredData={faqSchema}
      />
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to common questions and learn how to make the most of Students Hub
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <link.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium text-sm">{link.title}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>

          {filteredFaqs.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              <Button variant="ghost" className="mt-4" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredFaqs.map((category) => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <category.icon className="h-5 w-5 text-primary" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, idx) => (
                        <AccordionItem key={idx} value={`item-${idx}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Ask our AI Advisor for personalized assistance.
          </p>
          <Link to="/workbench">
            <Button size="lg" className="gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat with AI Advisor
            </Button>
          </Link>
        </div>
      </section>
    </div>
    </>
  );
};

export default HelpCenter;
