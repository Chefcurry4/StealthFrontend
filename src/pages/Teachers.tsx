import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Mail, Copy, Check } from "lucide-react";
import { TeacherCardImage } from "@/components/TeacherCardImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeachers } from "@/hooks/useTeachers";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Teachers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const { data: teachers, isLoading, error, refetch } = useTeachers(searchQuery);
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["teachers"] });
    await refetch();
  }, [queryClient, refetch]);

  const copyEmail = (email: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          {/* Hero Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Meet Our Faculty
              </h1>
              <p className="text-lg opacity-80 mb-8 max-w-2xl">
                Explore 900+ professors and researchers across partner universities
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Teachers List */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <Skeleton key={i} className="h-48 sm:h-56 lg:h-64" />
                  ))}
                </div>
              ) : error ? (
                <p className="text-center opacity-70">
                  Error loading teachers. Please try again.
                </p>
              ) : teachers?.length === 0 ? (
                <p className="text-center opacity-70">
                  No teachers found matching your search.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                  {teachers?.map((teacher) => (
                    <Card key={teacher.id_teacher} className="flex flex-col overflow-hidden backdrop-blur-md">
                      <TeacherCardImage 
                        teacherId={teacher.id_teacher}
                        teacherName={teacher.full_name || teacher.name || "Unknown"}
                        className="h-20 sm:h-24 lg:h-28"
                      />
                      <CardHeader className="flex-1 p-3 sm:p-4 lg:p-6">
                        <CardTitle className="text-sm sm:text-base lg:text-lg line-clamp-2">{teacher.full_name || teacher.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4 lg:p-6 pt-0">
                        {teacher.email && (
                          <button
                            onClick={(e) => copyEmail(teacher.email!, e)}
                            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm opacity-70 hover:opacity-100 truncate w-full text-left transition-opacity group"
                          >
                            {copiedEmail === teacher.email ? (
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-green-500" />
                            ) : (
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            )}
                            <span className="truncate flex-1">{teacher.email}</span>
                            <Copy className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-50 transition-opacity" />
                          </button>
                        )}
                        {teacher.topics && teacher.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {teacher.topics.slice(0, 3).map((topic, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium theme-badge"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                        <Link to={`/teachers/${teacher.id_teacher}`}>
                          <Button variant="secondary" size="sm" className="w-full theme-btn-secondary text-xs sm:text-sm">
                            View Profile
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default Teachers;