export const processTextToEmail = (text: string) => {
    const words = text.split(' ');
    const wordsNoPunctuation = words.map((word) => word.replace(/[^a-zA-Z0-9@.]/g, ''));

    const emails = []

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const word of wordsNoPunctuation) {
        if (emailRegex.test(word)) {
            emails.push(word);
        }
    }

    // delete duplicates
    const uniqueEmails = [...new Set(emails)];

    return uniqueEmails
}