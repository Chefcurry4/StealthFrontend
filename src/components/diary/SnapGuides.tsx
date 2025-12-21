import { cn } from "@/lib/utils";

interface SnapGuidesProps {
  guides: {
    vertical: number[];
    horizontal: number[];
  };
  visible: boolean;
}

export const SnapGuides = ({ guides, visible }: SnapGuidesProps) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Vertical guides */}
      {guides.vertical.map((x, i) => (
        <div
          key={`v-${i}`}
          className="absolute top-0 bottom-0 w-px bg-primary/60 animate-pulse"
          style={{ left: x }}
        />
      ))}
      
      {/* Horizontal guides */}
      {guides.horizontal.map((y, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 right-0 h-px bg-primary/60 animate-pulse"
          style={{ top: y }}
        />
      ))}
    </div>
  );
};

export interface SnapGuideState {
  vertical: number[];
  horizontal: number[];
}

// Calculate snap guides based on item position relative to other items
export const calculateSnapGuides = (
  currentItem: { x: number; y: number; width: number; height: number },
  otherItems: { x: number; y: number; width: number; height: number }[],
  threshold: number = 8
): SnapGuideState => {
  const guides: SnapGuideState = { vertical: [], horizontal: [] };
  
  const currentRight = currentItem.x + currentItem.width;
  const currentBottom = currentItem.y + currentItem.height;
  const currentCenterX = currentItem.x + currentItem.width / 2;
  const currentCenterY = currentItem.y + currentItem.height / 2;

  for (const item of otherItems) {
    const itemRight = item.x + item.width;
    const itemBottom = item.y + item.height;
    const itemCenterX = item.x + item.width / 2;
    const itemCenterY = item.y + item.height / 2;

    // Vertical alignment checks (left, center, right edges)
    if (Math.abs(currentItem.x - item.x) <= threshold) {
      guides.vertical.push(item.x);
    }
    if (Math.abs(currentRight - itemRight) <= threshold) {
      guides.vertical.push(itemRight);
    }
    if (Math.abs(currentItem.x - itemRight) <= threshold) {
      guides.vertical.push(itemRight);
    }
    if (Math.abs(currentRight - item.x) <= threshold) {
      guides.vertical.push(item.x);
    }
    if (Math.abs(currentCenterX - itemCenterX) <= threshold) {
      guides.vertical.push(itemCenterX);
    }

    // Horizontal alignment checks (top, center, bottom edges)
    if (Math.abs(currentItem.y - item.y) <= threshold) {
      guides.horizontal.push(item.y);
    }
    if (Math.abs(currentBottom - itemBottom) <= threshold) {
      guides.horizontal.push(itemBottom);
    }
    if (Math.abs(currentItem.y - itemBottom) <= threshold) {
      guides.horizontal.push(itemBottom);
    }
    if (Math.abs(currentBottom - item.y) <= threshold) {
      guides.horizontal.push(item.y);
    }
    if (Math.abs(currentCenterY - itemCenterY) <= threshold) {
      guides.horizontal.push(itemCenterY);
    }
  }

  // Remove duplicates
  guides.vertical = [...new Set(guides.vertical)];
  guides.horizontal = [...new Set(guides.horizontal)];

  return guides;
};
