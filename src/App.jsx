import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminBlog from './pages/AdminBlog'
import AdminBlogEditor from './pages/AdminBlogEditor'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/blog" element={<AdminBlog />} />
      <Route path="/admin/blog/new" element={<AdminBlogEditor />} />
      <Route path="/admin/blog/edit/:id" element={<AdminBlogEditor />} />
    </Routes>
  )
}
