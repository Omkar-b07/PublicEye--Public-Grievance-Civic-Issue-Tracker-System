const PROXIMITY_THRESHOLD_METERS = 500;
const TEXT_SIMILARITY_THRESHOLD = 0.45;

export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const textSimilarity = (a, b) => {
  const strA = a.toLowerCase().trim();
  const strB = b.toLowerCase().trim();

  if (strA === strB) return 1.0;
  if (strA.length === 0 || strB.length === 0) return 0.0;

  const dp = Array(strA.length + 1)
    .fill(0)
    .map(() => Array(strB.length + 1).fill(0));

  for (let i = 1; i <= strA.length; i++) {
    for (let j = 1; j <= strB.length; j++) {
      if (strA[i - 1] === strB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const lcs = dp[strA.length][strB.length];
  return (2 * lcs) / (strA.length + strB.length);
};

export const findSimilarIssues = (targetIssue, allIssues, excludeId) => {
  const duplicates = [];
  const targetText = `${targetIssue.title} ${targetIssue.description}`;

  for (const issue of allIssues) {
    if (issue.id === excludeId || issue.id === targetIssue.id) {
      continue;
    }

    const distance = haversineDistance(
      targetIssue.latitude,
      targetIssue.longitude,
      issue.latitude,
      issue.longitude
    );

    if (distance > PROXIMITY_THRESHOLD_METERS) {
      continue;
    }

    const candidateText = `${issue.title} ${issue.description}`;
    const similarity = textSimilarity(targetText, candidateText);

    if (similarity >= TEXT_SIMILARITY_THRESHOLD) {
      duplicates.push(issue);
    }
  }

  return duplicates;
};
