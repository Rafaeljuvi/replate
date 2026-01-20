//Email Validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password Validation
const isValidPassword = (password) => {
    return password && password.length >= 8;
};

//Phone Number Validation(ID)
const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    return !phone|| phoneRegex.test(phone)
};

const isPasswordMatch = (password, confirmPassword) => {
    return password === confirmPassword;
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidPhoneNumber,
    isPasswordMatch
};
