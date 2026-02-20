const hateSpeechWarningEmail = (username, warningCount, snippet) => {
    const maxWarnings = 3;
    const remaining = maxWarnings - warningCount;
    
    const isFinalWarning = remaining <= 0;
    
    return {
        subject: isFinalWarning 
            ? "Account Suspended — Community Guidelines Violation" 
            : `Warning ${warningCount}/${maxWarnings} — Community Guidelines Violation`,
        text: isFinalWarning
            ? `Hello ${username},

Your account has been suspended due to repeated violations of our community guidelines.

You have received ${warningCount} warnings for posting content flagged as hate speech. As a result, your posting privileges have been revoked.

Last flagged content: "${snippet}"

If you believe this is a mistake, please contact our support team.

— Team SoulSync`
            : `Hello ${username},

We've detected content in one of your posts that violates our community guidelines against hate speech.

Flagged content: "${snippet}"

This is warning ${warningCount} of ${maxWarnings}. After ${maxWarnings} warnings, your account will be suspended and you will not be able to create posts.

${remaining === 1 ? "⚠️ This is your LAST warning before suspension." : `You have ${remaining} warning(s) remaining.`}

Please review our community guidelines and ensure your future posts are respectful and supportive.

With care,
Team SoulSync`
    };
};

export default hateSpeechWarningEmail;
