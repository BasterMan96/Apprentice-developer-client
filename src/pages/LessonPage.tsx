import { useParams } from 'react-router-dom'

export default function LessonPage() {
  const { courseId, lessonId } = useParams()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Урок #{lessonId}</h1>
      <p className="text-gray-500 text-sm">LessonPage (Course #{courseId}) — placeholder</p>
    </div>
  )
}
