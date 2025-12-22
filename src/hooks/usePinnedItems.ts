import { useState, useCallback, useEffect } from "react";

interface PinnedItem {
  id: string;
  type: "course" | "lab" | "conversation" | "document";
  name: string;
  referenceId: string;
  pinnedAt: Date;
}

const STORAGE_KEY = "workbench_pinned_items";

export const usePinnedItems = () => {
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPinnedItems(parsed.map((item: any) => ({
          ...item,
          pinnedAt: new Date(item.pinnedAt),
        })));
      }
    } catch (e) {
      console.error("Failed to load pinned items:", e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedItems));
    } catch (e) {
      console.error("Failed to save pinned items:", e);
    }
  }, [pinnedItems]);

  const isPinned = useCallback((referenceId: string) => {
    return pinnedItems.some(item => item.referenceId === referenceId);
  }, [pinnedItems]);

  const pinItem = useCallback((item: Omit<PinnedItem, "id" | "pinnedAt">) => {
    if (isPinned(item.referenceId)) return;
    
    setPinnedItems(prev => [
      ...prev,
      {
        ...item,
        id: `pin_${Date.now()}`,
        pinnedAt: new Date(),
      }
    ]);
  }, [isPinned]);

  const unpinItem = useCallback((referenceId: string) => {
    setPinnedItems(prev => prev.filter(item => item.referenceId !== referenceId));
  }, []);

  const togglePin = useCallback((item: Omit<PinnedItem, "id" | "pinnedAt">) => {
    if (isPinned(item.referenceId)) {
      unpinItem(item.referenceId);
      return false;
    } else {
      pinItem(item);
      return true;
    }
  }, [isPinned, pinItem, unpinItem]);

  const getPinnedByType = useCallback((type: PinnedItem["type"]) => {
    return pinnedItems.filter(item => item.type === type);
  }, [pinnedItems]);

  const clearAllPins = useCallback(() => {
    setPinnedItems([]);
  }, []);

  return {
    pinnedItems,
    isPinned,
    pinItem,
    unpinItem,
    togglePin,
    getPinnedByType,
    clearAllPins,
    pinnedCount: pinnedItems.length,
  };
};

export type { PinnedItem };
export default usePinnedItems;