import { useParams } from 'react-router-dom'

export default function CoursePage() {
  const { courseId } = useParams()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Курс #{courseId}</h1>
      <p className="text-gray-500 text-sm">CoursePage — placeholder</p>
    </div>
  )
}
