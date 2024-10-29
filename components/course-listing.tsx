'use client'

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "./ui/dialog"
import { Label } from "./ui/label"
import { Star, ChevronLeft, ChevronRight, Trash2, Edit } from "lucide-react"
import Navbar from '../../component/Navbar/Navbar'

interface Course {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  price: number;
  rating: number;
  videoCount: number;
}

export const CourseListing: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [newCourse, setNewCourse] = useState<Omit<Course, 'id'>>({
    name: "",
    description: "",
    imageUrl: "",
    category: "",
    price: 0,
    rating: 0,
    videoCount: 0
  })
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkUserRole = async () => {
      const user = auth.currentUser
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.data()
        setIsAdmin(userData?.role === 'admin')
      }
    }
    checkUserRole()
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    // Implement fetching courses from your backend or Firestore
    const coursesData = [
      {
        id: "1",
        name: "After Effects للمبتدئين",
        description: "تعلم أساسيات After Effects وابدأ في إنشاء مؤثرات بصرية مذهلة.",
        imageUrl: "/placeholder-course.jpg",
        category: "تصميم",
        price: 99,
        rating: 4.5,
        videoCount: 12
      },
      {
        id: "2",
        name: "تصميم واجهات المستخدم UI/UX",
        description: "تعلم أساسيات تصميم واجهات المستخدم وتجربة المستخدم.",
        imageUrl: "/placeholder-ui-ux.jpg",
        category: "تصميم",
        price: 149,
        rating: 4.8,
        videoCount: 15
      }
    ]
    setCourses(coursesData)
  }

  const coursesPerPage = 15
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage)
  const indexOfLastCourse = currentPage * coursesPerPage
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse)

  const handleAddCourse = async () => {
    if (!isAdmin) return
    // Implement adding a new course to your backend or Firestore
    // This is just a placeholder
    const newCourseWithId = { ...newCourse, id: Date.now().toString() }
    setCourses([...courses, newCourseWithId])
    setNewCourse({
      name: "",
      description: "",
      imageUrl: "",
      category: "",
      price: 0,
      rating: 0,
      videoCount: 0
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

  const handleEditCourse = (course: Course) => {
    if (!isAdmin) return
    navigate(`/course-editor/${course.id}`)
  }

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
                    <img src={course.imageUrl} alt={course.name} className="w-full h-48 object-cover mb-4" />
                    <CardTitle>{course.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">{course.description}</p>
                    {/* Rating stars */}
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{course.category}</span>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-green-600">${course.price}</span>
                      <span className="text-sm text-gray-500 ml-2">/{course.videoCount} Videos</span>
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
                              Are you sure you want to delete the course "{courseToDelete?.name}"? This action cannot be undone.
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
