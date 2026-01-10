import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TourAction } from './utils/tourStepDefinitions';

interface TourStepExecutorProps {
  actions?: TourAction[];
  onComplete?: () => void;
}

export const useTourStepExecutor = ({ actions, onComplete }: TourStepExecutorProps) => {
  const navigate = useNavigate();

  const executeAction = useCallback(async (action: TourAction): Promise<void> => {
    return new Promise((resolve) => {
      switch (action.type) {
        case 'navigate':
          if (action.target) {
            navigate(action.target);
            // Wait for navigation to complete
            setTimeout(resolve, 500);
          } else {
            resolve();
          }
          break;

        case 'wait':
          setTimeout(resolve, action.duration || 1000);
          break;

        case 'scroll-to':
          if (action.target) {
            const element = document.querySelector(action.target);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setTimeout(resolve, 500);
            } else {
              resolve();
            }
          } else {
            resolve();
          }
          break;

        case 'pulse-element':
          if (action.target) {
            const element = document.querySelector(action.target);
            if (element) {
              element.classList.add('tour-pulse');
              setTimeout(() => {
                element.classList.remove('tour-pulse');
                resolve();
              }, action.duration || 2000);
            } else {
              resolve();
            }
          } else {
            resolve();
          }
          break;

        case 'simulate-typing':
          if (action.target && action.value) {
            const element = document.querySelector(action.target) as HTMLInputElement | HTMLTextAreaElement;
            if (element) {
              let currentIndex = 0;
              const text = action.value;
              const duration = action.duration || 2000;
              const interval = duration / text.length;

              const typeInterval = setInterval(() => {
                if (currentIndex < text.length) {
                  element.value = text.substring(0, currentIndex + 1);
                  element.dispatchEvent(new Event('input', { bubbles: true }));
                  currentIndex++;
                } else {
                  clearInterval(typeInterval);
                  setTimeout(() => {
                    // Clear the input after demo
                    element.value = '';
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    resolve();
                  }, 1000);
                }
              }, interval);
            } else {
              resolve();
            }
          } else {
            resolve();
          }
          break;

        case 'simulate-drag':
          if (action.from && action.to) {
            const fromElement = document.querySelector(action.from);
            const toElement = document.querySelector(action.to);
            
            if (fromElement && toElement) {
              const fromRect = fromElement.getBoundingClientRect();
              const toRect = toElement.getBoundingClientRect();

              // Create ghost element
              const ghost = fromElement.cloneNode(true) as HTMLElement;
              ghost.classList.add('tour-drag-ghost');
              ghost.style.position = 'fixed';
              ghost.style.left = `${fromRect.left}px`;
              ghost.style.top = `${fromRect.top}px`;
              ghost.style.width = `${fromRect.width}px`;
              ghost.style.height = `${fromRect.height}px`;
              ghost.style.zIndex = '10002';
              document.body.appendChild(ghost);

              // Animate to target
              setTimeout(() => {
                ghost.style.transition = `all ${(action.duration || 1500) / 1000}s ease-in-out`;
                ghost.style.left = `${toRect.left}px`;
                ghost.style.top = `${toRect.top}px`;
                ghost.style.opacity = '0.5';

                setTimeout(() => {
                  document.body.removeChild(ghost);
                  // Add pulse to target
                  toElement.classList.add('tour-pulse');
                  setTimeout(() => {
                    toElement.classList.remove('tour-pulse');
                    resolve();
                  }, 1000);
                }, action.duration || 1500);
              }, 100);
            } else {
              resolve();
            }
          } else {
            resolve();
          }
          break;

        case 'open-sidebar':
          const sidebarToggle = document.querySelector('[data-tour="sidebar-toggle"]') as HTMLElement;
          if (sidebarToggle) {
            sidebarToggle.click();
            setTimeout(resolve, 500);
          } else {
            resolve();
          }
          break;

        case 'show-mention-popup':
          // This will be handled by the mention component itself when @ is typed
          setTimeout(resolve, action.duration || 2000);
          break;

        default:
          resolve();
      }
    });
  }, [navigate]);

  const executeActions = useCallback(async () => {
    if (!actions || actions.length === 0) {
      onComplete?.();
      return;
    }

    for (const action of actions) {
      await executeAction(action);
    }

    onComplete?.();
  }, [actions, executeAction, onComplete]);

  useEffect(() => {
    executeActions();
  }, [executeActions]);

  return null;
};

export const TourStepExecutor: React.FC<TourStepExecutorProps> = (props) => {
  useTourStepExecutor(props);
  return null;
};
