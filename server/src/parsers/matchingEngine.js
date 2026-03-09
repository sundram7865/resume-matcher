/**
 * MATCHING ENGINE
 * Core logic that compares resume skills against JD skills.
 *
 * Scoring formula:
 *   Basic    = (matched / total) × 100
 *   Weighted = (matched_required / total_required) × 70
 *            + (matched_optional / total_optional) × 30
 *   Final    = Basic × 0.4 + Weighted × 0.6
 *   + Experience adjustment (±20 points max)
 *
 * Zero LLMs used.
 */

import { ALIAS_TO_CANONICAL } from '../extractors/skillsDictionary.js'

/**
 * Normalize a skill for comparison: lowercase + resolve alias.
 * @param {string} skill
 * @returns {string}
 */
function normalizeSkill(skill) {
  const lower = skill.toLowerCase().trim()
  return ALIAS_TO_CANONICAL[lower] || lower
}

/**
 * Check if a JD skill exists in the resume skills array.
 * Uses exact match + alias resolution + substring fallback.
 * @param {string} jdSkill
 * @param {string[]} resumeSkills
 * @returns {boolean}
 */
function isSkillPresent(jdSkill, resumeSkills) {
  const normJD     = normalizeSkill(jdSkill)
  const normResume = resumeSkills.map(s => normalizeSkill(s))

  // Exact match after normalization
  if (normResume.includes(normJD)) return true

  // Substring match (e.g. "Spring Boot" ⊆ "Spring Boot Framework")
  if (normResume.some(rs => rs.includes(normJD) || normJD.includes(rs))) return true

  return false
}

/**
 * Build the skillsAnalysis array for a single JD vs resume.
 * @param {string[]} jdSkills      - All JD skills
 * @param {string[]} resumeSkills  - Resume skills
 * @returns {{ skill: string, presentInResume: boolean }[]}
 */
function buildSkillsAnalysis(jdSkills, resumeSkills) {
  return jdSkills.map(skill => ({
    skill,
    presentInResume: isSkillPresent(skill, resumeSkills),
  }))
}

/**
 * Calculate weighted matching score.
 * @param {object[]} skillsAnalysis  - Array of { skill, presentInResume }
 * @param {string[]} requiredSkills  - Required skill list from JD
 * @param {string[]} optionalSkills  - Optional skill list from JD
 * @returns {number} - Score 0–100
 */
function calculateScore(skillsAnalysis, requiredSkills = [], optionalSkills = []) {
  if (!skillsAnalysis.length) return 0

  const total   = skillsAnalysis.length
  const matched = skillsAnalysis.filter(s => s.presentInResume).length

  // Basic score (assignment formula)
  const basic = (matched / total) * 100

  // Weighted score if we have required/optional split
  if (requiredSkills.length > 0) {
    const reqAnalysis = skillsAnalysis.filter(s =>
      requiredSkills.some(rs => normalizeSkill(rs) === normalizeSkill(s.skill))
    )
    const optAnalysis = skillsAnalysis.filter(s =>
      optionalSkills.some(os => normalizeSkill(os) === normalizeSkill(s.skill))
    )

    const reqScore = reqAnalysis.length > 0
      ? (reqAnalysis.filter(s => s.presentInResume).length / reqAnalysis.length) * 70
      : 35 // no required section detected → give half credit

    const optScore = optAnalysis.length > 0
      ? (optAnalysis.filter(s => s.presentInResume).length / optAnalysis.length) * 30
      : 15

    const weighted = reqScore + optScore
    return Math.round((basic * 0.4 + weighted * 0.6) * 10) / 10
  }

  return Math.round(basic * 10) / 10
}

/**
 * Adjust score based on experience gap.
 * Over-qualified: +0 to +5 bonus
 * Under-qualified: -0 to -20 penalty
 * @param {number} score
 * @param {number|null} resumeExp
 * @param {number|null} requiredExp
 * @returns {number}
 */
function applyExperienceAdjustment(score, resumeExp, requiredExp) {
  if (requiredExp === null || resumeExp === null || requiredExp === 0) return score

  if (resumeExp >= requiredExp) {
    const bonus = Math.min(5, ((resumeExp - requiredExp) / requiredExp) * 10)
    return Math.min(100, Math.round((score + bonus) * 10) / 10)
  } else {
    const ratio   = resumeExp / requiredExp
    const penalty = Math.min(20, (1 - ratio) * 25)
    return Math.max(0, Math.round((score - penalty) * 10) / 10)
  }
}

/**
 * Match a parsed resume against a list of JDs.
 * Returns the full output JSON matching the assignment spec.
 * @param {object}   resumeData - Parsed resume object
 * @param {object[]} jdList     - Array of processed JD objects
 * @returns {object}            - Final match output
 */
function matchResumeToJobs(resumeData, jdList) {
  const matchingJobs = jdList.map(jd => {
    const skillsAnalysis = buildSkillsAnalysis(
      jd.allSkills || jd.requiredSkills || [],
      resumeData.skills || []
    )

    let score = calculateScore(
      skillsAnalysis,
      jd.requiredSkills || [],
      jd.optionalSkills || []
    )

    score = applyExperienceAdjustment(score, resumeData.yearOfExperience, jd.requiredExperience)
    score = Math.max(0, Math.min(100, score))

    return {
      jobId:             jd.jobId,
      role:              jd.role,
      company:           jd.company || null,
      aboutRole:         jd.aboutRole,
      salary:            jd.salary || null,
      requiredExperience: jd.requiredExperience,
      skillsAnalysis,
      matchingScore:     score,
      matchedCount:      skillsAnalysis.filter(s => s.presentInResume).length,
      totalCount:        skillsAnalysis.length,
      requiredSkills:    jd.requiredSkills || [],
      optionalSkills:    jd.optionalSkills || [],
    }
  })

  // Sort best match first
  matchingJobs.sort((a, b) => b.matchingScore - a.matchingScore)

  return {
    name:            resumeData.name,
    salary:          resumeData.salaryExpectation || null,
    yearOfExperience: resumeData.yearOfExperience,
    resumeSkills:    resumeData.skills,
    matchingJobs,
  }
}

export { matchResumeToJobs, buildSkillsAnalysis, calculateScore, isSkillPresent }