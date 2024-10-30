
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth } from 'firebase/auth';
import { database as db } from '../../../lib/firebase/config'
import { ref, onValue, query, orderByChild, get } from 'firebase/database'
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "./ui/dialog"
import { Label } from "./ui/label"
import { Star, ChevronLeft, ChevronRight, Trash2, Edit } from "lucide-react"
import Navbar from '../../component/Navbar/Navbar'
import type { Course } from '../../types/course';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '../../../lib/hooks/useAuth';
import type { CourseData } from '../../../types/firebase';
import { transformCourseData } from '../../../lib/utils/course'

export const CourseListing: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const [courses, setCourses] = useState<CourseData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [newCourse, setNewCourse] = useState<Omit<CourseData, 'id'>>({
    title: "",
    description: "",
    instructor: "",
    duration: "",
    level: "Beginner",
    rating: 0,
    enrolledStudents: 0,
    price: 0,
    chapters: [],
    isPublic: false,
    isPremium: false,
    thumbnail: "",
    imageUrl: "",
    videoCount: 0,
    category: "",
    accessType: 'free',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  const [courseToDelete, setCourseToDelete] = useState<CourseData | null>(null)
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const [filteredCourses, setFilteredCourses] = useState<CourseData[]>([]);

  useEffect(() => {
    const [loading, setLoading] = useState(true);
    
    const coursesRef = ref(db, 'courses');
    const coursesQuery = query(coursesRef, orderByChild('createdAt'));
    
    const unsubscribe = onValue(coursesQuery, (snapshot) => {
      if (snapshot.exists()) {
        const coursesData = Object.entries(snapshot.val()).map(([id, data]) => 
          transformCourseData({ id, ...data as Omit<CourseData, 'id'> }) as CourseData
        );
        setCourses(coursesData);
        setFilteredCourses(coursesData);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching courses:', error);
      setError('Failed to fetch courses');
      // ... existing code ...
const [loading, setLoading] = useState(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="overflow-hidden bg__purple min-h-screen">
        <Navbar />
        <div className="container py-5">
          <div className="text-center text-white">
            جاري التحميل...
          </div>
        </div>
      
      </div>
    );
  }

  const coursesPerPage = 15
  const filteredResults = React.useMemo(() => 
    courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [courses, searchTerm]
  );
  const totalPages = Math.ceil(filteredResults.length / coursesPerPage)
  const indexOfLastCourse = currentPage * coursesPerPage
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage
  const currentCourses = filteredResults.slice(indexOfFirstCourse, indexOfLastCourse)

  const handleAddCourse = async () => {
    if (!isAdmin) return
    // Implement adding a new course to your backend or Firestore
    // This is just a placeholder
    const newCourseWithId = { ...newCourse, id: Date.now().toString() }
    setCourses([...courses, newCourseWithId])
    setNewCourse({
      title: "",
      description: "",
      instructor: "",
      duration: "",
      level: "Beginner",
      rating: 0,
      enrolledStudents: 0,
      price: 0,
      chapters: [],
      isPublic: false,
      isPremium: false,
      thumbnail: "",
      imageUrl: "",
      videoCount: 0,
      category: "",
      accessType: 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    // Navigate to the new course page
    navigate(`/course/${newCourseWithId.id}`)
  }

  const handleDeleteCourse = async () => {
    if (!isAdmin || !courseToDelete) return
    // Implement deleting a course from your backend or Firestore
    // This is just a placeholder
    setCourses(courses.filter(course => course.id !== courseToDelete.id))
    setCourseToDelete(null)
  }

  const handleEditCourse = (course: CourseData) => {
    if (!isAdmin) return
    navigate(`/course-editor/${course.id}`)
  }

  const handleError = (error: FirebaseError | Error) => {
    console.error('Error:', error);
    return error instanceof FirebaseError ? error.message : 'An error occurred';
  };

  const handleCourseClick = async (course: CourseData) => {
    if (course.accessType !== 'free') {
      try {
        const response = await fetch('/.netlify/functions/check-subscription-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.uid,
            courseId: course.id,
            accessType: course.accessType
          })
        });
        
        const data = await response.json();
        
        if (!data.canAccessCourse) {
          navigate(course.accessType === 'subscription' ? '/pricing' : `/payment/${course.id}`);
          return;
        }
      } catch (error) {
        console.error('Error checking access:', error);
      }
    }
    
    navigate(`/course/${course.id}`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-purple-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-white text-center mb-8">to improve your skills</h1>
          <div className="max-w-xl mx-auto mb-8">
            <Input
              type="text"
              placeholder="Search courses"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add New Course</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                </DialogHeader>
                {/* Add course form fields here */}
                <Button onClick={handleAddCourse}>Add Course</Button>
              </DialogContent>
            </Dialog>
          )}
          <div className="bg-gray-100 p-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentCourses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <img 
                      src={course.thumbnail || course.imageUrl} 
                      alt={course.title} 
                      className="w-full h-48 object-cover mb-4" 
                    />
                    <CardTitle>{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">{course.description}</p>
                    {/* Rating stars */}
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{course.category}</span>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-green-600">${course.price}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {course.chapters?.reduce((total, chapter) => total + chapter.lessons.length, 0) || 0} Videos
                      </span>
                    </div>
                  </CardFooter>
                  {isAdmin && (
                    <>
                      <Button variant="outline" className="mt-2" onClick={() => handleEditCourse(course)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Course
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="mt-2" onClick={() => setCourseToDelete(course)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Course
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete the course "{courseToDelete?.title}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setCourseToDelete(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteCourse}>Delete</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </Card>
              ))}
            </div>
          </div>
          {/* Pagination */}
        </div>
      </div>
    </>
  )
}
export default CourseListing;
