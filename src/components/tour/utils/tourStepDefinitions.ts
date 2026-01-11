export interface TourStep {
  id: string;
  title: string;
  description: string;
  mascotMessage: string;
  route?: string;
  targetSelector?: string;
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
    mascotMessage: "Hey there! 👋 I'm your study advisor panda. Let me show you around UniPandan!",
    position: 'center',
  },

  // Step 2: AI Workbench
  {
    id: 'workbench-overview',
    title: 'AI Workbench',
    description: 'Chat with AI to get personalized study advice, plan your courses, and draft emails to professors.',
    mascotMessage: "This is where the magic happens! Ask me anything about courses, labs, or your exchange semester.",
    route: '/workbench',
    targetSelector: '[data-tour="chat-input"]',
  },

  // Step 3: Courses Library
  {
    id: 'courses-overview',
    title: 'Courses Library',
    description: 'Browse 1400+ courses with filters for ECTS, language, topics, and exam type.',
    mascotMessage: "Explore all available courses! Filter by topics, credits, or difficulty to find what suits you best.",
    route: '/courses',
    targetSelector: '[data-tour="courses-filters"]',
  },

  // Step 4: Research Labs
  {
    id: 'labs-overview',
    title: 'Research Labs',
    description: 'Discover cutting-edge research opportunities across all faculties.',
    mascotMessage: "Looking for a research lab? Browse by topic like AI, Robotics, or Biomedical to find your passion!",
    route: '/labs',
    targetSelector: '[data-tour="labs-topic-filter"]',
  },

  // Step 5: Completion
  {
    id: 'completion',
    title: 'You\'re All Set! 🎉',
    description: 'Ready to plan your perfect exchange semester?',
    mascotMessage: "You're ready to go! Start exploring courses, labs, and ask me anything. Good luck with your exchange! 🐼",
    position: 'center',
  }
];

export const getTourStep = (index: number): TourStep | undefined => {
  return tourSteps[index];
};

export const getTotalSteps = (): number => {
  return tourSteps.length;
};
