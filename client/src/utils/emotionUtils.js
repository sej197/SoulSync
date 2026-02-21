
// Face-api emotion labels → positive / negative / neutral
const EMOTION_BUCKETS = {
    happy: 'positive',
    surprised: 'positive',
    neutral: 'neutral',
    sad: 'negative',
    angry: 'negative',
    fearful: 'negative',
    disgusted: 'negative',
};

/**
 * Classify a face-api emotion label into positive / negative / neutral.
 */
export function classifyFaceEmotion(emotion) {
    if (!emotion) return 'neutral';
    return EMOTION_BUCKETS[emotion.toLowerCase()] || 'neutral';
}

/**
 * Classify a text sentiment score (0–1, higher = more distressed) into
 * positive / negative / neutral.
 *
 * Thresholds:
 *   score <= 0.4   → positive (low distress)
 *   score <= 0.45  → neutral
 *   score > 0.45   → negative (high distress)
 */
export function classifySentimentScore(score) {
    if (score == null) return 'neutral';
    if (score <= 0.4) return 'positive';
    if (score <= 0.45) return 'neutral';
    return 'negative';
}


export function getMoodMismatchMessage(faceEmotion, sentimentScore) {
    if (!faceEmotion || sentimentScore == null) return null;

    const faceBucket = classifyFaceEmotion(faceEmotion);
    const textBucket = classifySentimentScore(sentimentScore);

    // Only alert on clear positive ↔ negative mismatch
    if (faceBucket === 'positive' && textBucket === 'negative') {
        return `Your facial expression seems ${faceEmotion} but your words suggest you may be feeling down. It's okay to acknowledge all your feelings — you don't have to hide behind a smile. 💙`;
    }

    if (faceBucket === 'negative' && textBucket === 'positive') {
        return `Your words sound positive but your expression looks ${faceEmotion}. Remember, it's completely okay to feel complex emotions — take a moment to check in with yourself. 💙`;
    }

    return null;
}
