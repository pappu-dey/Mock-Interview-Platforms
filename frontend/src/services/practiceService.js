import { authFetch } from '../api/api'

/**
 * Record a single question answered in Practice mode.
 * Automatically increments questions_solved in DB and updates the user's streak.
 */
async function recordQuestionAnswered({ questionId, category, topic, isCorrect, selectedOption, score }) {
  try {
    return await authFetch('/api/practice/submit-answer', {
      method: 'POST',
      body: JSON.stringify({
        questionId,
        category,
        topic,
        isCorrect,
        selectedOption,
        score,
      }),
    })
  } catch (err) {
    console.warn('Could not record question answer to backend:', err)
    return { success: false }
  }
}

/**
 * Record a completed practice set or aptitude assessment session.
 */
async function recordAssessmentSession({
  category,
  topic,
  company,
  roleName,
  totalQuestions,
  correctCount,
  score,
  timeSpentSeconds,
  type = 'Practice',
}) {
  try {
    return await authFetch('/api/practice/submit-session', {
      method: 'POST',
      body: JSON.stringify({
        category,
        topic,
        company,
        roleName,
        totalQuestions,
        correctCount,
        score,
        timeSpentSeconds,
        type,
      }),
    })
  } catch (err) {
    console.warn('Could not record assessment session to backend:', err)
    return { success: false }
  }
}

/**
 * Schedule a mock interview session for a specific company and role.
 */
async function scheduleInterview({ company, role, startTime }) {
  try {
    return await authFetch('/api/practice/schedule-interview', {
      method: 'POST',
      body: JSON.stringify({
        company,
        role,
        startTime,
      }),
    })
  } catch (err) {
    console.warn('Could not schedule interview on backend:', err)
    return { success: false }
  }
}

/**
 * Fetch the authenticated user's solved question IDs and topic/category counts.
 */
async function getUserProgress() {
  try {
    return await authFetch('/api/practice/user-progress')
  } catch (err) {
    console.warn('Could not fetch user progress:', err)
    return { solvedQuestionIds: [], topicCounts: {}, categoryCounts: {}, questionDetails: {}, totalSolved: 0 }
  }
}

export default {
  recordQuestionAnswered,
  recordAssessmentSession,
  scheduleInterview,
  getUserProgress,
}
