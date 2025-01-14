export const exists = (users, email) => {
    const found = false;
    users.forEach(user => {
        if(user.email === email) {
            found = true;
        }
    });

    return found;
};