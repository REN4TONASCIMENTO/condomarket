/**
 * Traduz códigos de erro do Firebase Auth para mensagens amigáveis em português.
 * @param {string} errorCode 
 * @returns {string}
 */
export const translateAuthError = (errorCode) => {
    const errorMessages = {
        'auth/wrong-password': 'E-mail ou senha inválido. Tente novamente.',
        'auth/user-not-found': 'E-mail ou senha inválido. Tente novamente.',
        'auth/invalid-credential': 'E-mail ou senha inválido. Tente novamente.',
        'auth/invalid-email': 'O formato do e-mail é inválido.',
        'auth/email-already-in-use': 'Este e-mail já está em uso.',
        'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    };

    return errorMessages[errorCode] || 'Ocorreu um erro. Tente novamente mais tarde.';
};

/**
 * Verifica se a senha atende aos critérios de segurança:
 * - Pelo menos 8 caracteres
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 * @param {string} password 
 * @returns {boolean}
 */
export const isPasswordStrong = (password) => {
    if (password.length < 8) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};
