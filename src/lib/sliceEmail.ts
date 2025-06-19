export const sliceEmail = (email: string) => {
    const name = email.split('@')[0];
    const domain = email.split('@')[1];
    const company = domain.split('.')[0];

    return {
        name,
        domain,
        company
    }
}