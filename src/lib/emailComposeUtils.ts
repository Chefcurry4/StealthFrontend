/**
 * Utility functions for handling email compose data transformations
 */

// Generic type for saved items with nested data
type SavedItem<T> = {
  id?: string;
  course_id?: string;
  lab_id?: string;
  Courses?: T;
  Labs?: T;
};

type Document = {
  id: string;
  name?: string;
  file_type?: string;
};

/**
 * Get selected courses data from saved courses
 */
export function getSelectedCoursesData<T = unknown>(
  savedCourses: SavedItem<T>[] | undefined,
  selectedCourseIds: string[]
): T[] {
  return savedCourses
    ?.filter(c => selectedCourseIds.includes(c.course_id || ''))
    .map(c => c.Courses)
    .filter((c): c is T => c !== undefined) || [];
}

/**
 * Get selected labs data from saved labs
 */
export function getSelectedLabsData<T = unknown>(
  savedLabs: SavedItem<T>[] | undefined,
  selectedLabIds: string[]
): T[] {
  return savedLabs
    ?.filter(l => selectedLabIds.includes(l.lab_id || ''))
    .map(l => l.Labs)
    .filter((l): l is T => l !== undefined) || [];
}

/**
 * Get selected documents data from user documents
 */
export function getSelectedDocsData(
  userDocuments: Document[] | undefined,
  selectedDocIds: string[]
): Document[] {
  return userDocuments?.filter(d => selectedDocIds.includes(d.id)) || [];
}
