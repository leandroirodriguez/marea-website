import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return res.status(403).json({ error: 'Admin access required' })

  const { type, category } = req.body // type: 'article' or 'blog'

  // Fetch existing titles to avoid duplicates
  let existingTitles = []
  if (type === 'article') {
    const { data } = await supabase.from('content').select('title')
    existingTitles = (data || []).map(a => a.title)
  } else {
    const { data: articles } = await supabase.from('content').select('title')
    const { data: posts } = await supabase.from('blog_posts').select('title')
    existingTitles = [...(articles || []).map(a => a.title), ...(posts || []).map(p => p.title)]
  }

  const existingList = existingTitles.map(t => `- ${t}`).join('\n')

  const prompt = type === 'article'
    ? `Suggest 5 unique article topics for a perimenopause health education library.
${category ? `Category: ${category}` : 'Mix of categories: Sleep, Mood, Brain fog, Hot flashes, HRT, Lifestyle, Intimacy'}

These articles are clinical, evidence-based, written by OB/GYNs. They should cover specific, actionable topics that women in perimenopause would search for.

IMPORTANT: Do NOT suggest topics similar to these existing articles:
${existingList}

Return a JSON array of 5 objects:
[
  { "title": "Compelling specific title", "category": "Category", "description": "One sentence describing what the article covers and why it matters" }
]`
    : `Suggest 5 unique blog post topics for a perimenopause health website (Marea Health).

These are SEO-friendly, public-facing blog posts meant to drive traffic and build trust. They should be relatable, empowering, and encourage women to download the Marea app.

IMPORTANT: Do NOT suggest topics similar to these existing posts and articles:
${existingList}

Return a JSON array of 5 objects:
[
  { "title": "Compelling SEO-friendly title", "description": "One sentence describing the angle and target audience" }
]`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].text
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse suggestions' })

    const suggestions = JSON.parse(jsonMatch[0])
    return res.status(200).json({ suggestions })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
