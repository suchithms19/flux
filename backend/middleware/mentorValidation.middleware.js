const validateMentorOnboarding = (req, res, next) => {
  const { 
    fullName, email, phone, gender, organization,
    role, experience, headline, bio, languages,
    mentoringAreas
  } = req.body;

  // Required fields validation
  const requiredFields = {
    fullName, email, phone, gender, organization,
    role, experience, headline, bio, languages,
    mentoringAreas
  };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return res.status(400).json({
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      });
    }
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: 'Invalid email format'
    });
  }

  // Phone validation
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      message: 'Phone number must be 10 digits'
    });
  }

  next();
};

module.exports = {
  validateMentorOnboarding
}; 