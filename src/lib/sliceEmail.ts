export const sliceEmail = (email: string) => {
	let name = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);

	// separate the 2
	if (name.includes('.')) {
		name = name.replace('.', ' ');
		const lastName = name.split(' ')[1];
		const firstName = name.split(' ')[0];
		name = firstName + ' ' + lastName.charAt(0).toUpperCase() + lastName.slice(1);
	}

	const domain = email.split('@')[1];
	const company = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);

	return {
		name,
		domain,
		company,
	};
};
