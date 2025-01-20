export const exists = (users, email) => {
    let found = false;
    users.forEach(user => {
        if(user.email === email) {
            found = true;
        }
    });

    return found;
};