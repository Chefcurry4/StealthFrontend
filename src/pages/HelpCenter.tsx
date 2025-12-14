import { useState } from "react";
import { Search, ChevronDown, ExternalLink, BookOpen, HelpCircle, MessageSquare, FileText, GraduationCap, FlaskConical, Users, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const faqs = [
  {
    category: "Getting Started",
    icon: BookOpen,
    questions: [
      {
        question: "What is Students Hub?",
        answer: "Students Hub is a comprehensive platform designed for university students to explore courses, discover research labs, find universities, and plan their academic journey. It includes AI-powered guidance and tools for creating learning agreements."
      },
      {
        question: "How do I create an account?",
        answer: "Click the 'Sign In' button in the header, then select 'Sign Up'. Enter your email address and create a password. You'll receive a confirmation email to verify your account."
      },
      {
        question: "Is Students Hub free to use?",
        answer: "Yes! Students Hub is completely free for all students. You can browse universities, courses, and labs without an account. Create an account to save items and use the AI advisor."
      }
    ]
  },
  {
    category: "Universities & Courses",
    icon: GraduationCap,
    questions: [
      {
        question: "How do I find courses at a specific university?",
        answer: "Navigate to the Universities page, click on a university, then browse its available programs. Each program page lists all associated courses with detailed information including ECTS credits, professors, and descriptions."
      },
      {
        question: "Can I save courses for later?",
        answer: "Yes! Click the bookmark icon on any course card to save it to your Workbench. You can access all saved courses, labs, and programs from your Workbench or Profile page."
      },
      {
        question: "How do I leave a course review?",
        answer: "Navigate to any course detail page and scroll down to the Reviews section. You can rate the course, assess difficulty and workload, and leave a comment to help other students."
      }
    ]
  },
  {
    category: "Research Labs",
    icon: FlaskConical,
    questions: [
      {
        question: "How are labs categorized?",
        answer: "Labs are automatically categorized by research domain based on their topics and faculty association. You can filter by research domains like AI & Machine Learning, Robotics, Biomedical, and more."
      },
      {
        question: "Can I contact lab professors directly?",
        answer: "Yes! Click on any professor's name to view their popup profile, which includes their email address. Click the email to copy it to your clipboard."
      },
      {
        question: "How do I find labs related to my interests?",
        answer: "Use the search bar on the Labs page, filter by research domain, or use the AI Advisor in Workbench to get personalized lab recommendations based on your academic interests."
      }
    ]
  },
  {
    category: "AI Advisor (Workbench)",
    icon: MessageSquare,
    questions: [
      {
        question: "What can the AI Advisor help me with?",
        answer: "The AI Advisor can help you choose courses, find research labs, plan your study abroad semester, create learning agreements, draft emails to professors, and answer questions about your academic journey."
      },
      {
        question: "Does the AI know about the universities and courses in the platform?",
        answer: "Yes! The AI Advisor has access to all universities, programs, courses, labs, and professors in our database. It can provide specific recommendations based on actual data."
      },
      {
        question: "Can I attach documents to my AI conversations?",
        answer: "Yes! You can upload text files, PDFs, and documents to provide context. The AI can read your CV, transcripts, or other documents to give personalized recommendations."
      },
      {
        question: "Are my conversations saved?",
        answer: "Yes, all your AI conversations are automatically saved to your account. You can access conversation history from the Workbench sidebar and continue previous discussions."
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
        answer: "Go to your Profile, navigate to Workbench > Agreements, and click 'Create New Agreement'. Select your home and host universities, add courses and labs, and the system will automatically calculate ECTS totals."
      },
      {
        question: "Can I export my learning agreement?",
        answer: "Yes! Once you've created an agreement, you can export it as a PDF document to share with your academic advisor or submit to your university's exchange office."
      }
    ]
  },
  {
    category: "Account & Settings",
    icon: Users,
    questions: [
      {
        question: "How do I change my profile picture?",
        answer: "Go to your Profile page and hover over your current avatar. Click to upload a new image. Supported formats are JPG, PNG, and GIF (max 5MB)."
      },
      {
        question: "Can I change my email notification preferences?",
        answer: "Yes! Go to Profile > Preferences & Settings. You can toggle email notifications for reviews, learning agreements, and general updates."
      },
      {
        question: "How do I switch between light and dark mode?",
        answer: "Use the sun/moon toggle in the header or go to Profile > Preferences & Settings to select your preferred theme. We offer multiple theme options with both day and night modes."
      }
    ]
  }
];

const quickLinks = [
  { title: "Browse Universities", href: "/universities", icon: GraduationCap },
  { title: "Explore Courses", href: "/courses", icon: BookOpen },
  { title: "Discover Labs", href: "/labs", icon: FlaskConical },
  { title: "Open Workbench", href: "/workbench", icon: Briefcase },
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

  return (
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
  );
};

export default HelpCenter;
