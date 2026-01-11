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
  type: 'navigate' | 'wait' | 'scroll-to';
  target?: string;
  value?: string;
  duration?: number;
}

export const tourSteps: TourStep[] = [
  // Step 1: Welcome
  {
    id: 'welcome',
    title: 'Welcome to UniPandan!',
    description: 'Your AI-powered study abroad companion',
    mascotMessage: "Hey there! 👋 I'm your study advisor panda. Let me show you around!",
    position: 'center',
  },

  // Step 2: AI Workbench (consolidated overview)
  {
    id: 'workbench-overview',
    title: 'AI Workbench',
    description: 'Your command center for AI-powered assistance',
    mascotMessage: "This is where the magic happens! Chat with AI, save items, and get personalized help.",
    route: '/workbench',
    targetSelector: '[data-tour="chat-input"]',
    actions: [
      { type: 'navigate', target: '/workbench' },
      { type: 'wait', duration: 1500 },
      { type: 'scroll-to', target: '[data-tour="chat-input"]' }
    ]
  },

  // Step 3: Courses Library
  {
    id: 'courses-overview',
    title: 'Courses Library',
    description: 'Browse 1400+ courses',
    mascotMessage: "Filter by ECTS, language, topics, exam type... find exactly what you need!",
    route: '/courses',
    targetSelector: '[data-tour="courses-filters"]',
    actions: [
      { type: 'navigate', target: '/courses' },
      { type: 'wait', duration: 1500 },
      { type: 'scroll-to', target: '[data-tour="courses-filters"]' }
    ]
  },

  // Step 4: Research Labs
  {
    id: 'labs-overview',
    title: 'Research Labs',
    description: 'Explore cutting-edge research',
    mascotMessage: "Filter by AI, Robotics, Biomedical... find your research passion!",
    route: '/labs',
    targetSelector: '[data-tour="labs-topic-filter"]',
    actions: [
      { type: 'navigate', target: '/labs' },
      { type: 'wait', duration: 1500 },
      { type: 'scroll-to', target: '[data-tour="labs-topic-filter"]' }
    ]
  },

  // Step 5: Completion
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
