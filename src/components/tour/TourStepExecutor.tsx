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
