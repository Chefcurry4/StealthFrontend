import { useState, useEffect, useCallback } from 'react';

export interface RecentlyViewedItem {
  id: string;
  type: 'course' | 'lab' | 'program';
  name: string;
  href: string;
  viewedAt: number;
  // Optional metadata
  ects?: number;
  code?: string;
  topics?: string;
}

const STORAGE_KEY = 'recently_viewed_items';
const MAX_ITEMS = 10;

export const useRecentlyViewed = () => {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  // Load items from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyViewedItem[];
        setItems(parsed);
      }
    } catch (error) {
      console.error('Error loading recently viewed items:', error);
    }
  }, []);

  // Add an item to recently viewed
  const addItem = useCallback((item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    setItems((prevItems) => {
      // Remove existing item with same id and type
      const filtered = prevItems.filter(
        (i) => !(i.id === item.id && i.type === item.type)
      );
      
      // Add new item at the beginning
      const newItem: RecentlyViewedItem = {
        ...item,
        viewedAt: Date.now(),
      };
      
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving recently viewed items:', error);
      }
      
      return updated;
    });
  }, []);

  // Clear all recently viewed items
  const clearItems = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing recently viewed items:', error);
    }
  }, []);

  return {
    items,
    addItem,
    clearItems,
  };
};
