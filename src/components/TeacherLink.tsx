import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeacherPopup } from "@/components/TeacherPopup";
import { cn } from "@/lib/utils";

interface TeacherLinkProps {
  teacherName: string;
  teacherId?: string;
  className?: string;
}

export const TeacherLink = ({ teacherName, teacherId, className }: TeacherLinkProps) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [resolvedTeacherId, setResolvedTeacherId] = useState<string | null>(teacherId || null);

  // If we don't have a teacherId, try to find it by name
  const { isLoading: searchingTeacher } = useQuery({
    queryKey: ["teacher-by-name", teacherName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Teachers(T)")
        .select("id_teacher")
        .or(`full_name.ilike.%${teacherName}%,name.ilike.%${teacherName}%`)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setResolvedTeacherId(data.id_teacher);
      }
      return data;
    },
    enabled: !teacherId && !!teacherName,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (resolvedTeacherId || !searchingTeacher) {
      setPopupOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          "text-left hover:underline cursor-pointer transition-colors hover:text-primary",
          className
        )}
        disabled={searchingTeacher}
      >
        {teacherName}
      </button>
      <TeacherPopup
        teacherId={resolvedTeacherId}
        open={popupOpen}
        onOpenChange={setPopupOpen}
      />
    </>
  );
};
