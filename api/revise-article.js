import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SYSTEM_PROMPT = `You revise perimenopause health articles for Marea Health, a consumer app built with board-certified OB/GYNs. You keep the author's voice — warm, authoritative, clinically precise, zero hedging — and preserve the markdown structure.

Rules:
- Return ONLY the revised markdown body. No preamble, no "here is the revised article", no explanation, no code fences.
- Preserve all image markdown tags (![](url)) exactly unless the editor explicitly asks to remove or reposition them.
- Preserve heading hierarchy unless the editor explicitly asks to restructure.
- Do not invent medical claims or new studies. If the editor's request would require a specific clinical claim you're uncertain about, keep the language conservative and evidence-based.
- Do not add or remove the article title — edit only the body content.
- Keep roughly the same length unless the editor explicitly asks to expand or shorten.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return res.status(403).json({ error: 'Admin access required' })

  const { body, instruction, title, category } = req.body || {}
  if (!body || !instruction) return res.status(400).json({ error: 'body and instruction are required' })

  const prompt = `Article metadata:
- Title: ${title || '(untitled)'}
- Category: ${category || 'General'}

Editor's revision instruction:
${instruction}

Current article body (markdown):
---BEGIN BODY---
${body}
---END BODY---

Return the revised markdown body only.`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = response.content[0]?.text?.trim() || ''
    if (!text) return res.status(502).json({ error: 'Empty response' })

    // Strip accidental code fences if Claude wrapped the body
    const cleaned = text.replace(/^```(?:markdown|md)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

    return res.status(200).json({ body: cleaned })
  } catch (err) {
    console.error('Revise article error:', err)
    return res.status(500).json({ error: err.message || 'Failed to revise' })
  }
}
