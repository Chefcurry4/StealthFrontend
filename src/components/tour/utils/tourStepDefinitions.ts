export interface TourStep {
  id: string;
  title: string;
  description: string;
  mascotMessage: string;
  route?: string;
  targetSelector?: string;
  actions?: TourAction[];
  duration?: number; // Auto-advance duration in ms (for cinematic steps)
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

export interface TourAction {
  type: 'navigate' | 'simulate-typing' | 'simulate-drag' | 'open-sidebar' | 'pulse-element' | 'show-mention-popup' | 'wait' | 'scroll-to';
  target?: string;
  value?: string;
  duration?: number;
  from?: string;
  to?: string;
}

export const tourSteps: TourStep[] = [
  // Phase 1: Welcome
  {
    id: 'welcome',
    title: 'Welcome to Student Hub!',
    description: 'Your AI-powered study abroad companion',
    mascotMessage: "Hey there! 👋 I'm hubAI, your study advisor. Let me show you something AMAZING...",
    position: 'center',
    duration: 5000, // Auto-advance after 5 seconds
  },

  // Phase 2: Workbench Deep-Dive
  {
    id: 'workbench-navigate',
    title: 'Your Command Center',
    description: 'Navigate to AI Workbench',
    mascotMessage: "This is where the magic happens! The AI Workbench is your command center.",
    route: '/workbench',
    actions: [
      { type: 'navigate', target: '/workbench' },
      { type: 'wait', duration: 1000 }
    ]
  },

  {
    id: 'workbench-chat-intro',
    title: 'Chat Interface',
    description: 'Your direct line to AI assistance',
    mascotMessage: "Type your questions here - I understand natural language!",
    targetSelector: '[data-tour="chat-input"]',
    actions: [
      { type: 'scroll-to', target: '[data-tour="chat-input"]' },
      { type: 'pulse-element', target: '[data-tour="chat-input"]', duration: 2000 }
    ]
  },

  {
    id: 'workbench-chat-demo',
    title: 'Live Chat Demo',
    description: 'Watch AI in action',
    mascotMessage: "Watch this! I'm going to ask myself a question...",
    targetSelector: '[data-tour="chat-input"]',
    actions: [
      { 
        type: 'simulate-typing', 
        target: '[data-tour="chat-input"]',
        value: 'Find me a 6 ECTS AI course at EPFL taught in English',
        duration: 2000
      },
      { type: 'wait', duration: 1000 }
    ]
  },

  {
    id: 'workbench-model-selector',
    title: 'AI Model Selection',
    description: 'Choose your AI power',
    mascotMessage: "7 AI models at your fingertips! From fast Gemini to deep-reasoning Perplexity.",
    targetSelector: '[data-tour="model-selector"]',
    actions: [
      { type: 'scroll-to', target: '[data-tour="model-selector"]' },
      { type: 'pulse-element', target: '[data-tour="model-selector"]', duration: 2000 }
    ]
  },

  {
    id: 'workbench-sidebar-intro',
    title: 'Your Saved Items',
    description: 'Access your collection',
    mascotMessage: "Your saved courses and labs live here. But here's the cool part...",
    targetSelector: '[data-tour="sidebar"]',
    actions: [
      { type: 'open-sidebar' },
      { type: 'wait', duration: 500 },
      { type: 'pulse-element', target: '[data-tour="sidebar"]', duration: 2000 }
    ]
  },

  {
    id: 'workbench-drag-demo',
    title: 'Drag & Drop Magic',
    description: 'Context-aware assistance',
    mascotMessage: "DRAG items directly into chat! The AI gets full context automatically.",
    targetSelector: '[data-tour="chat-input"]',
    actions: [
      { 
        type: 'simulate-drag',
        from: '[data-tour="saved-course-item"]',
        to: '[data-tour="chat-input"]',
        duration: 1500
      },
      { type: 'wait', duration: 1000 }
    ]
  },

  {
    id: 'workbench-mention-feature',
    title: '@ Mention System',
    description: 'Quick item references',
    mascotMessage: "Type @ to quickly reference your saved items!",
    targetSelector: '[data-tour="chat-input"]',
    actions: [
      { type: 'simulate-typing', target: '[data-tour="chat-input"]', value: '@', duration: 500 },
      { type: 'show-mention-popup', duration: 2000 }
    ]
  },

  {
    id: 'workbench-email-composer',
    title: 'Email Composer',
    description: 'Professional communication',
    mascotMessage: "Need to email a professor? I'll draft it for you professionally!",
    targetSelector: '[data-tour="compose-email-btn"]',
    actions: [
      { type: 'pulse-element', target: '[data-tour="compose-email-btn"]', duration: 2000 }
    ]
  },

  // Phase 3: Quick Courses Overview
  {
    id: 'courses-overview',
    title: 'Courses Library',
    description: 'Browse 1400+ courses',
    mascotMessage: "Filter by ECTS, language, topics, exam type... find exactly what you need!",
    route: '/courses',
    targetSelector: '[data-tour="courses-filters"]',
    actions: [
      { type: 'navigate', target: '/courses' },
      { type: 'wait', duration: 1000 },
      { type: 'scroll-to', target: '[data-tour="courses-filters"]' },
      { type: 'pulse-element', target: '[data-tour="courses-filters"]', duration: 2000 }
    ]
  },

  // Phase 4: Quick Labs Overview
  {
    id: 'labs-overview',
    title: 'Research Labs',
    description: 'Explore cutting-edge research',
    mascotMessage: "Filter by AI, Robotics, Biomedical... find your research passion!",
    route: '/labs',
    targetSelector: '[data-tour="labs-topic-filter"]',
    actions: [
      { type: 'navigate', target: '/labs' },
      { type: 'wait', duration: 1000 },
      { type: 'scroll-to', target: '[data-tour="labs-topic-filter"]' },
      { type: 'pulse-element', target: '[data-tour="labs-topic-filter"]', duration: 2000 }
    ]
  },

  // Phase 5: Quick Profile Overview
  {
    id: 'profile-overview',
    title: 'Your Profile',
    description: 'Customize your experience',
    mascotMessage: "Customize your flashcard, theme, and display preferences here.",
    route: '/profile',
    targetSelector: '[data-tour="profile-preferences"]',
    actions: [
      { type: 'navigate', target: '/profile' },
      { type: 'wait', duration: 1000 },
      { type: 'scroll-to', target: '[data-tour="profile-preferences"]' },
      { type: 'pulse-element', target: '[data-tour="profile-preferences"]', duration: 2000 }
    ]
  },

  // Phase 6: Completion
  {
    id: 'completion',
    title: 'You\'re All Set! 🎉',
    description: 'Ready to plan your perfect exchange semester?',
    mascotMessage: "You're all set! 🎉 Ready to plan your perfect exchange semester?",
    position: 'center',
  }
];

export const getTourStep = (index: number): TourStep | undefined => {
  return tourSteps[index];
};

export const getTotalSteps = (): number => {
  return tourSteps.length;
};
