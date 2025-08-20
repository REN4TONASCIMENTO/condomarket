export const translateAuthError = (errorCode) => {
    switch (errorCode) {
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
            return 'E-mail ou senha inválido. Tente novamente.';
        case 'auth/invalid-email':
            return 'O formato do e-mail é inválido.';
        case 'auth/email-already-in-use':
            return 'Este e-mail já está em uso.';
        case 'auth/weak-password':
            return 'A senha deve ter pelo menos 6 caracteres.';
        default:
            return 'Ocorreu um erro. Tente novamente mais tarde.';
    }
};

export const isPasswordStrong = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars;
};