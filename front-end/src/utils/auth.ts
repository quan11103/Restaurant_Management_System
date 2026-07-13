export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');

    window.location.reload();
};