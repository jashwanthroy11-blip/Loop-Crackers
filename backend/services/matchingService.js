const calculateMatchScore = (applicantSkills, jobSkills) => {
    if (!jobSkills || jobSkills.length === 0) return { score: 100, missing: [] };
    if (!applicantSkills || applicantSkills.length === 0) return { score: 0, missing: jobSkills };

    const lowerAppSkills = applicantSkills.map(s => s.toLowerCase().trim());
    const missing = [];
    let matchCount = 0;

    jobSkills.forEach(skill => {
        if (lowerAppSkills.includes(skill.toLowerCase().trim())) {
            matchCount++;
        } else {
            missing.push(skill);
        }
    });

    const score = Math.round((matchCount / jobSkills.length) * 100);
    return { score, missing };
};

module.exports = { calculateMatchScore };
