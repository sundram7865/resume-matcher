// Words that are definitely NOT names
const NOT_NAME = new Set([
  'resume', 'cv', 'curriculum', 'vitae', 'summary', 'objective', 'profile',
  'experience', 'education', 'skills', 'contact', 'references', 'projects',
  'certifications', 'achievements', 'awards', 'publications', 'interests',
  'email', 'phone', 'address', 'linkedin', 'github', 'portfolio', 'website',
  'mobile', 'tel', 'bachelor', 'master', 'phd', 'university', 'college',
  'software', 'engineer', 'developer', 'manager', 'analyst', 'designer',
  'senior', 'junior', 'lead', 'principal', 'intern', 'present', 'current',
  'january', 'february', 'march', 'april', 'june', 'july', 'august',
  'september', 'october', 'november', 'december',
])

/**
 * Check if a string looks like a human name.
 * Rules:
 *  - 2 to 4 words
 *  - Each word starts with capital letter
 *  - No digits or special chars
 *  - No known non-name word
 *  - Each word between 2–25 chars
 * @param {string} str
 * @returns {boolean}
 */
function looksLikeName(str) {
  const words = str.trim().split(/\s+/)
  if (words.length < 2 || words.length > 4) return false

  for (const word of words) {
    if (word.length < 2 || word.length > 25) return false
    // Allow names like O'Brien, Al-Hassan, van der Berg
    if (!/^[A-Z][a-z''\-]+$/.test(word) && !/^[A-Z]{2,5}$/.test(word)) return false
    if (NOT_NAME.has(word.toLowerCase())) return false
    if (/\d/.test(word)) return false
  }

  return true
}

/**
 * Extract candidate name from resume text.
 * @param {string} text - Raw resume text
 * @returns {string} - Candidate name or "Unknown Candidate"
 */
function extractName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // Strategy 1: Check first 15 lines for a name-like line
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i]

    // Skip obvious non-name lines
    if (line.length > 60) continue
    if (/[@\d+\-()]/.test(line) && line.length > 20) continue
    if (/^(resume|cv|curriculum|contact|summary|profile|skills)/i.test(line)) continue

    // Direct name line
    if (looksLikeName(line)) return line.trim()

    // "Name: John Doe" format
    const labelMatch = line.match(/^(?:name|candidate|applicant)\s*[:\-–]\s*(.+)$/i)
    if (labelMatch && looksLikeName(labelMatch[1].trim())) {
      return labelMatch[1].trim()
    }
  }

  // Strategy 2: Scan first 500 chars for any 2-word capitalized string
  const shortText = text.substring(0, 500)
  for (const line of shortText.split('\n').map(l => l.trim()).filter(l => l.length > 0 && l.length < 50)) {
    if (looksLikeName(line)) return line.trim()
  }

  return 'Unknown Candidate'
}

export { extractName }