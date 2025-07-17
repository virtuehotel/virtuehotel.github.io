const clientId = '1360551839224959062';
const redirectUri = 'https://virtuehotel.github.io/intra/index.html'; // Update with your GitHub Pages URL

function saveUserDataToLocalStorage(userData) {
    localStorage.setItem('discordUserData', JSON.stringify(userData));
    console.log('User data saved to localStorage:', userData);
}

// Function to handle the OAuth2 flow
function handleOAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `client_id=${clientId}&grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to exchange code for token: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                const accessToken = data.access_token;

                // Fetch user data
                return fetch('https://discord.com/api/users/@me', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user data: ' + response.statusText);
                }
                return response.json();
            })
            .then(userData => {
                // Save user data to localStorage
                saveUserDataToLocalStorage(userData);

                if (window.history.replaceState) {
                    const url = new URL(window.location);
                    url.search = '';
                    window.history.replaceState({}, document.title, url.pathname + url.hash);
                }

                // Fetch the staff list JSON from your GitHub Pages
                return fetch('whitelist.json')
                    .then(res => {
                        if (!res.ok) {
                            throw new Error('Failed to fetch staff list: ' + res.statusText);
                        }
                        return res.json();
                    })
                    .then(staffList => {
                        // Check if the user is on the allowed list
                        const allowedUserIds = staffList.allowedUserIds || [];
                        const hasAccess = allowedUserIds.includes(userData.id);

                        if (hasAccess) {
                            // Redirect to intranet/dashboard if the user has access
                            window.location.href = 'index.html'; // Update this to your dashboard URL
                        } else {
                            // Redirect to an access denied page or show a message
                            alert('You do not have access to this intranet system.');
                            // window.location.href = 'access-denied.html'; // Update this to your access denied page
                        }
                    });
            })
            .catch(error => console.error('Error during OAuth flow:', error));
    } else {
        console.warn('No authorization code found in URL');
    }
}

// Call the OAuth handling function on page load
document.addEventListener('DOMContentLoaded', handleOAuth);