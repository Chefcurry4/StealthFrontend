import { useState } from "react";
import { Search, ChevronDown, ExternalLink, BookOpen, HelpCircle, MessageSquare, FileText, GraduationCap, FlaskConical, Users, Briefcase, Mail, Keyboard, BarChart3, Sparkles, Bot, FolderOpen } from "lucide-react";
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
        question: "What is UniPandan?",
        answer: "UniPandan is a comprehensive platform designed for university students to explore courses, discover research labs, find universities, and plan their academic journey. It features an advanced AI-powered Workbench with multiple AI models, email drafting tools, document management, semester planning, and saved items organization."
      },
      {
        question: "How do I create an account?",
        answer: "Click the 'Sign In' button in the header, then select 'Sign Up'. Enter your email address and create a password. You'll receive a confirmation email to verify your account."
      },
      {
        question: "Is UniPandan free to use?",
        answer: "Yes! UniPandan is completely free for all students. You can browse universities, courses, and labs without an account. Create an account to save items, use the AI Workbench, and draft emails."
      },
      {
        question: "What features are available?",
        answer: "Key features include: browsing 1400+ courses and 420+ labs, AI-powered Workbench with multiple models (Gemini, GPT-5, Perplexity), email drafting with AI assistance, document uploads, semester planning, saved courses/labs management, course and lab reviews, professor contact information, and platform statistics."
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
        answer: "Yes! Click on any professor's name to view their popup profile, which includes their email address and research topics. Click the email to copy it to your clipboard, or use the AI Email Composer in the Workbench to draft a professional outreach email."
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
    category: "AI Workbench (hubAI)",
    icon: Bot,
    questions: [
      {
        question: "What is the Workbench?",
        answer: "The Workbench is your central hub for AI-powered academic assistance. It combines an intelligent AI advisor (hubAI), saved courses and labs, email drafts, document storage, and semester planning - all in one integrated interface."
      },
      {
        question: "What can hubAI help me with?",
        answer: "hubAI can: recommend courses based on your interests, find research labs matching your academic goals, compare courses side-by-side, generate personalized semester plans, draft professional emails to professors, answer questions about course content, explain academic concepts, and provide guidance on your study abroad journey."
      },
      {
        question: "Which AI models are available?",
        answer: "hubAI offers 7 AI models across 3 providers: Google Gemini (Flash for fast responses, Pro for advanced reasoning), OpenAI GPT-5 (standard for powerful responses, Mini for quick answers), and Perplexity Sonar (basic web search, Pro for multi-step reasoning with citations, Reasoning for deep analysis with real-time search). Switch models using the dropdown in the Workbench header."
      },
      {
        question: "How does the AI know about courses and labs?",
        answer: "hubAI has direct access to the entire UniPandan database. It can search through 1400+ courses and 420+ labs, look up professor information, find courses by topic, ECTS, or exam type, and provide recommendations based on actual platform data - not generic information."
      },
      {
        question: "Can I attach documents to my AI conversations?",
        answer: "Yes! You can upload text files (.txt, .md, .json, .csv), PDFs, Word documents (.docx), and images (.png, .jpg, .gif, .webp) up to 20MB each. The AI can read your CV, transcripts, syllabi, or course materials. Images are processed with OCR to extract text content."
      },
      {
        question: "How do I reference my saved courses or labs in a conversation?",
        answer: "Two ways: 1) Type '@' in the chat input to see a popup of your saved courses and labs - select one to add it as context with full details (ECTS, professor, description). 2) Drag and drop items from the sidebar directly into the chat area. The AI receives complete metadata about referenced items."
      },
      {
        question: "What is the Workbench sidebar?",
        answer: "The sidebar organizes all your saved content: AI chat history, saved courses (with drag-and-drop), saved labs, email drafts, and uploaded documents. Click items to reference them in chat, or drag them to add as context. Use the search bar to filter across all sections."
      },
      {
        question: "Are my conversations saved?",
        answer: "Yes! All conversations are automatically saved with full message history, attachments, and referenced items. Access past conversations from the sidebar. Rename conversations by double-clicking the title, or delete them using the trash icon."
      },
      {
        question: "Can I export my conversations?",
        answer: "Yes! Click the download button in the input area to export conversations in three formats: Markdown (.md) for documentation, Plain Text (.txt) for simple sharing, or JSON (.json) for structured data backup."
      },
      {
        question: "How do I search within a conversation?",
        answer: "Press Ctrl+F (Cmd+F on Mac) while in the Workbench to open the conversation search bar. Type to search, and results are highlighted with navigation to jump between matches."
      },
      {
        question: "Can I stop an AI response?",
        answer: "Yes! While hubAI is generating a response, click the stop button (square icon) next to the input field to interrupt the generation. This is useful if you need to rephrase your question or start a new conversation."
      },
      {
        question: "What do the thinking and searching indicators mean?",
        answer: "When you ask a question, you'll see: 'Thinking...' while the AI processes your request, then 'Searching courses/labs/teachers...' when it queries the database for relevant data. This real-time feedback shows exactly what the AI is doing."
      }
    ]
  },
  {
    category: "Email Drafting",
    icon: Mail,
    questions: [
      {
        question: "How do I compose an email with AI assistance?",
        answer: "Click 'Compose Email' button in the Workbench header or sidebar. Fill in the purpose (e.g., 'Request to join research lab'), recipient name (with professor autocomplete), and any context. Optionally attach documents and select relevant courses/labs. The AI generates a professional, personalized email."
      },
      {
        question: "Does the email composer know about professors?",
        answer: "Yes! Start typing a professor's name and the composer shows matching professors from the database with their research topics. Selecting a professor automatically includes their research interests in the email context for better personalization."
      },
      {
        question: "Can the AI read my CV to personalize emails?",
        answer: "Yes! In the 'Advanced Options' section of the email composer, select your uploaded documents (CV, transcripts, cover letters). The AI will extract your name, background, skills, and interests to create highly personalized outreach emails that highlight relevant experience."
      },
      {
        question: "What can I do with generated emails?",
        answer: "Generated emails have multiple actions: Copy to clipboard, Open in your email client (Gmail, Outlook, etc.) via mailto link, Save to Email Drafts for later editing, or Regenerate for a different version. All options appear as icons below the email."
      },
      {
        question: "Where are my email drafts stored?",
        answer: "Saved email drafts appear in the Workbench sidebar under 'Email Drafts' and in Profile > Email Drafts. You can view, edit, delete, or reference them in new conversations. Drafts show subject and recipient for easy identification."
      }
    ]
  },
  {
    category: "Semester Planner",
    icon: Briefcase,
    questions: [
      {
        question: "How do I access the Semester Planner?",
        answer: "Click the calendar icon in the Workbench header to open/close the Semester Planner panel. It appears as a side panel that shows your saved semester plans and any AI-generated plans."
      },
      {
        question: "Can the AI generate semester plans?",
        answer: "Yes! Ask hubAI something like 'Create a semester plan for a Master's in Computer Science focusing on machine learning' or 'Help me plan courses for winter semester with 30 ECTS'. The AI generates a structured plan with winter/summer course distribution that appears in the Semester Planner panel."
      },
      {
        question: "How do I save an AI-generated semester plan?",
        answer: "When hubAI generates a semester plan, it appears as a temporary plan in the Semester Planner panel. Click 'Save Plan' and give it a name. The plan is then stored permanently with up to 10 saved plans allowed."
      },
      {
        question: "What information does the semester plan show?",
        answer: "Each plan displays: course names and codes, ECTS credits per course, total ECTS for each semester (winter/summer), exam types breakdown (written, oral, project), and professor names. The planner automatically calculates totals."
      },
      {
        question: "Can I edit saved semester plans?",
        answer: "Yes! You can rename plans, remove individual courses, or delete entire plans. Click the edit icon to rename, or use the trash icons to remove courses or plans. Changes are saved automatically."
      },
      {
        question: "Can I export semester plans?",
        answer: "Yes! Each plan has an export option to save as an image (PNG) for sharing with advisors, or as JSON for data backup. The exported image includes all course details and ECTS totals."
      }
    ]
  },
  {
    category: "Saved Items & Documents",
    icon: FolderOpen,
    questions: [
      {
        question: "How do I save courses and labs?",
        answer: "Click the bookmark/heart icon on any course or lab card to save it. Saved items appear in your Workbench sidebar and Profile > Saved Items. You can add notes to saved items for personal reference."
      },
      {
        question: "How do I manage my saved items?",
        answer: "Access saved items from the Workbench sidebar or Profile page. The sidebar shows quick access to your most recent saves (up to 8), while Profile > Saved Items shows all items with filtering and sorting options. Click items to view details or drag them to reference in AI chat."
      },
      {
        question: "How do I upload documents?",
        answer: "Go to Profile > Documents to upload files. Supported formats include PDFs, text files, Word documents, and images. Documents are stored securely and can be referenced in AI conversations or email drafting."
      },
      {
        question: "How do I use documents with the AI?",
        answer: "In the Workbench, click the paperclip icon to attach a file directly to your message, or click on documents in the sidebar to reference them. The AI will read and analyze the document content to provide personalized responses."
      },
      {
        question: "What's the file size limit?",
        answer: "Individual files can be up to 20MB. For best results with AI processing, PDFs should be text-based (not scanned images). Images are processed with OCR, which works best with clear, high-contrast text."
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
        answer: "Press '?' anywhere in the app to see all keyboard shortcuts. Key shortcuts include: Ctrl+N (new chat), Ctrl+F (search conversation), @ (mention courses/labs), and Escape (close sidebar or popup)."
      },
      {
        question: "Workbench shortcuts",
        answer: "Ctrl+N: Start new conversation, Ctrl+Enter: Send message, @: Open mention popup for saved courses/labs, Ctrl+F: Search within current conversation, Escape: Close sidebar, search bar, or popups. Double-click conversation title to rename."
      }
    ]
  }
];

const quickLinks = [
  { title: "Browse Universities", href: "/universities", icon: GraduationCap },
  { title: "Explore Courses", href: "/courses", icon: BookOpen },
  { title: "Discover Labs", href: "/labs", icon: FlaskConical },
  { title: "AI Workbench", href: "/workbench", icon: Bot },
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
        description="Find answers to common questions about UniPandan. Learn how to use the AI Workbench with multiple AI models, draft emails, manage saved courses and labs, and more."
        keywords={["help", "FAQ", "support", "how to", "student help", "AI workbench", "hubAI", "email drafting", "course reviews", "semester planning"]}
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
            Find answers to common questions and learn how to make the most of UniPandan
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
