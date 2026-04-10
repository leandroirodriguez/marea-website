import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import LandingPage from './pages/LandingPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import ArticlesPage from './pages/ArticlesPage'
import ArticlePage from './pages/ArticlePage'
import LoginPage from './pages/LoginPage'
import AccountPage from './pages/AccountPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminBlog from './pages/AdminBlog'
import AdminBlogEditor from './pages/AdminBlogEditor'
import AdminArticles from './pages/AdminArticles'
import AdminArticleEditor from './pages/AdminArticleEditor'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/admin/blog/new" element={<AdminBlogEditor />} />
        <Route path="/admin/blog/edit/:id" element={<AdminBlogEditor />} />
        <Route path="/admin/articles" element={<AdminArticles />} />
        <Route path="/admin/articles/new" element={<AdminArticleEditor />} />
        <Route path="/admin/articles/edit/:id" element={<AdminArticleEditor />} />
      </Routes>
    </AuthProvider>
  )
}
