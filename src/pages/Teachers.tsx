import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Mail } from "lucide-react";
import { TeacherCardImage } from "@/components/TeacherCardImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeachers } from "@/hooks/useTeachers";

const Teachers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: teachers, isLoading, error } = useTeachers(searchQuery);

  return (
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
                  className="pl-10 bg-white/10 backdrop-blur border-white/20"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <Skeleton key={i} className="h-64" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {teachers?.map((teacher) => (
                  <Card key={teacher.id_teacher} className="flex flex-col overflow-hidden backdrop-blur-md bg-white/10 border-white/20">
                    <TeacherCardImage 
                      teacherId={teacher.id_teacher}
                      teacherName={teacher.full_name || teacher.name || "Unknown"}
                      className="h-28"
                    />
                    <CardHeader className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{teacher.full_name || teacher.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {teacher.email && (
                        <div className="flex items-center gap-2 text-sm opacity-70 truncate">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <a href={`mailto:${teacher.email}`} className="hover:opacity-100 truncate">
                            {teacher.email}
                          </a>
                        </div>
                      )}
                      {teacher.topics && teacher.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {teacher.topics.slice(0, 3).map((topic, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link to={`/teachers/${teacher.id_teacher}`}>
                        <Button variant="secondary" size="sm" className="w-full bg-white/20 hover:bg-white/30">
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
  );
};

export default Teachers;