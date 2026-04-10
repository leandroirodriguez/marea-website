import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SYSTEM_PROMPT = `You are a content writer for Marea Health, a perimenopause health app founded by board-certified OB/GYNs.

Write engaging, SEO-friendly blog posts for the Marea website. These are public-facing posts meant to:
- Drive organic traffic from women searching about perimenopause
- Build trust and authority for the Marea brand
- Educate in a warm, accessible way (less clinical than the in-app articles)
- Encourage readers to download the Marea app

Your tone is:
- Conversational and empathetic — like talking to a smart friend who happens to be a doctor
- Relatable — acknowledge the frustration of dismissive healthcare experiences
- Empowering — "you're not crazy, here's what's happening and what to do"
- SEO-aware — use natural keyword placement, write clear headings

Format in HTML (not markdown):
- Use <h2> for section headings
- Use <p> for paragraphs
- Use <strong> for key terms
- Use <ul>/<li> for lists
- Use <blockquote> for patient quotes or key takeaways
- Posts should be 600-1000 words (4-6 minute read)
- Do NOT include the title or any wrapping <article> tags`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return res.status(403).json({ error: 'Admin access required' })

  const { topic, style } = req.body

  if (!topic) return res.status(400).json({ error: 'Topic is required' })

  const prompt = `Write a blog post about: ${topic}

${style ? `Style notes: ${style}` : ''}

Return a JSON object with these fields:
{
  "title": "Blog post title (compelling, SEO-friendly, not clickbait)",
  "slug": "url-friendly-slug",
  "body_html": "Full blog post body in HTML (no title, no article wrapper)",
  "excerpt": "1-2 sentence summary for social sharing and previews"
}`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse AI response' })

    const post = JSON.parse(jsonMatch[0])

    const { data, error } = await supabase.from('blog_posts').insert({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      body_html: post.body_html,
      published: false,
    }).select().single()

    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({
      success: true,
      post: data,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
