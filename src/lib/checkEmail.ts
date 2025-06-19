// email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const checkEmail = (email: string) => {
    return emailRegex.test(email);
}
