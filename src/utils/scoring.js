/**
 * Score how many years of experience an applicant has relative to the minimum.
 * - At exactly minRequired → 70
 * - At 2x minRequired or above → 100
 * - Below minRequired → scales linearly up to 70
 */
export const calculateExperienceScore = (years, minRequired) => {
  if (!minRequired) return 100;
  if (years >= minRequired * 2) return 100;
  if (years >= minRequired) {
    return Math.round(70 + ((years - minRequired) / minRequired) * 30);
  }
  return Math.round((years / minRequired) * 70);
};

/**
 * Score skill match against required and preferred skills.
 * Required skills account for 80% of the score; preferred for 20%.
 */
export const calculateSkillsScore = (
  skills = [],
  required = [],
  preferred = [],
) => {
  if (!required.length) return preferred.length ? 0 : 100;
  const normalized = skills.map((s) => s.toLowerCase());
  const requiredHits = required.filter((s) =>
    normalized.includes(s.toLowerCase()),
  ).length;
  const preferredHits = preferred.filter((s) =>
    normalized.includes(s.toLowerCase()),
  ).length;
  const requiredPct = (requiredHits / required.length) * 80;
  const preferredPct = preferred.length
    ? (preferredHits / preferred.length) * 20
    : 20; // full preferred credit if none are defined
  return Math.round(requiredPct + preferredPct);
};

/**
 * Binary industry match: 100 if same, 0 if different, 50 if unknown.
 */
export const calculateIndustryMatch = (applicantIndustry, jobIndustry) => {
  if (!applicantIndustry || !jobIndustry) return 50;
  return applicantIndustry.toLowerCase().trim() ===
    jobIndustry.toLowerCase().trim()
    ? 100
    : 0;
};

/**
 * Weighted sum of category scores using a job's weightConfig.
 * Normalises weights so the result is correct even if they don't sum to 1.
 */
export const calculateFinalScore = (categoryScores, weightConfig) => {
  const {
    experience = 0.25,
    skills = 0.35,
    industryMatch = 0.2,
    companySignals = 0.1,
  } = weightConfig;
  const totalWeight = experience + skills + industryMatch + companySignals;
  const score =
    (categoryScores.experience * experience +
      categoryScores.skills * skills +
      categoryScores.industryMatch * industryMatch +
      categoryScores.companySignals * companySignals) /
    totalWeight;
  return Math.round(score * 10) / 10;
};
