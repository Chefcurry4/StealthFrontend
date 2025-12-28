export interface DiaryNotebook {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DiaryPage {
  id: string;
  notebook_id: string;
  page_number: number;
  page_type: 'semester_planner' | 'lab_tracker' | 'notes' | 'custom' | 'blank';
  title: string | null;
  semester: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiaryPageItem {
  id: string;
  page_id: string;
  item_type: 'course' | 'lab' | 'note' | 'email_draft' | 'todo' | 'semester_planner' | 'lab_tracker' | 'notes_module' | 'text' | 'weekly_schedule' | 'deadline_tracker' | 'checklist';
  reference_id: string | null;
  content: string | null;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  color: string;
  zone: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiaryLabCommunication {
  id: string;
  user_id: string;
  lab_id: string | null;
  email_draft_id: string | null;
  status: 'draft' | 'sent' | 'replied' | 'follow_up';
  sent_date: string | null;
  reply_received: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseWithDetails {
  id_course: string;
  name_course: string;
  code: string | null;
  ects: number | null;
  type_exam: string | null;
  term: string | null;
  ba_ma: string | null;
  topics: string | null;
  professor_name: string | null;
  software_equipment: string | null;
}

export interface LabWithDetails {
  id_lab: string;
  name: string;
  slug: string | null;
  topics: string | null;
  professors: string | null;
}

export interface SemesterAnalytics {
  totalEcts: number;
  examTypes: {
    written: number;
    oral: number;
    duringSemester: number;
    other: number;
  };
  levels: {
    bachelor: number;
    master: number;
  };
  terms: {
    winter: number;
    summer: number;
  };
  topics: string[];
  software: string[];
}
