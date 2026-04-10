import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SYSTEM_PROMPT = `You are a medical content writer for Marea Health, a perimenopause health app founded by Dr. Rodriguez, MD, FACOG and Dr. Richmond, MD, FACOG — board-certified OB/GYNs.

Write evidence-based, clinical articles about perimenopause for an educated female audience (ages 38-55). Your tone is:
- Warm but authoritative — like a trusted doctor explaining things clearly
- Direct and honest — no hedging or generic wellness fluff
- Clinically precise — cite mechanisms, hormones, neurotransmitters
- Actionable — include specific treatments, doses, and when to escalate

Format in markdown:
- Use ## for section headings
- Use **bold** for key terms and medications
- Use bullet lists (- ) for actionable items
- Include specific numbers, dosages, and percentages where relevant
- Articles should be 5-8 minutes reading time (800-1500 words)
- Do NOT include a title (it will be set separately)

Categories: Sleep, Mood, Brain fog, Hot flashes, HRT, Lifestyle, Intimacy`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

  // Verify the user is admin
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return res.status(403).json({ error: 'Admin access required' })

  const { topic, category, style } = req.body

  if (!topic) return res.status(400).json({ error: 'Topic is required' })

  const prompt = `Write a perimenopause article about: ${topic}

Category: ${category || 'General'}
${style ? `Style notes: ${style}` : ''}

Return a JSON object with these fields:
{
  "title": "Article title (compelling, specific, not clickbait)",
  "slug": "url-friendly-slug",
  "body": "Full article body in markdown",
  "excerpt": "1-2 sentence summary for previews",
  "read_time": estimated_minutes_as_number,
  "tags": ["tag1", "tag2", "tag3"]
}`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].text
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse AI response' })

    const article = JSON.parse(jsonMatch[0])

    // Save as draft in Supabase
    const { data, error } = await supabase.from('content').insert({
      title: article.title,
      slug: article.slug,
      category: category || 'Lifestyle',
      tags: article.tags || [],
      read_time: article.read_time || 5,
      is_premium: false,
      author: 'Dr. Rodriguez, MD, FACOG',
      body: article.body,
      published: false, // Draft — needs admin approval
    }).select().single()

    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({
      success: true,
      article: data,
      excerpt: article.excerpt,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
