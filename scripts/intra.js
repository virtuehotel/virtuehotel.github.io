const clientId = '1360551839224959062';
const redirectUri = 'https://virtuehotel.github.io/intra/index.html'; // Update with your GitHub Pages URL

function saveUserDataToLocalStorage(userData) {
    localStorage.setItem('discordUserData', JSON.stringify(userData));
    console.log('User data saved to localStorage:', userData);
    return userData;
}

// Function to handle the OAuth2 flow
function handleOAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        // Exchange code for token (this should be done server-side for security)
        fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: 'pYHQtjcQNEPo6UYr30PHFH_l8fliJbXj', // WARNING: This is unsafe in client-side code!
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            })
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
            
            // Clean URL
            if (window.history.replaceState) {
                const url = new URL(window.location);
                url.search = '';
                window.history.replaceState({}, document.title, url);
            }
            
            // Now check whitelist
            return checkWhitelist(userData.id);
        })
        .then(isWhitelisted => {
            if (isWhitelisted) {
                alert('Access granted!');
                window.location.href = 'index.html';
            } else {
                alert('You are NOT on the whitelist.');
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Error during OAuth flow:', error);
            alert('Authentication failed. Please try again.');
            window.location.href = 'login.html';
        });
    } else {
        console.warn('No authorization code found in URL');
        // Redirect to Discord OAuth if no code
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;
    }
}

function checkWhitelist(userId) {
    return fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vT1nzgo9w6QqWX-ZYyv0jqrahG8BjE4HvOChQFPbl8c1_lOkJJW6KsVsAMdFvT-4PxVkMK7CuFXGeCi/pub?gid=0&single=true&output=csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch whitelist');
            }
            return response.text();
        })
        .then(csv => {
            // Split CSV by line, skip header
            const lines = csv.trim().split('\n').slice(1);
            // Check if any line starts with the userId (accounting for possible quotes)
            return lines.some(line => {
                const lineId = line.split(',')[0].replace(/"/g, '').trim();
                return lineId === userId;
            });
        })
        .catch(err => {
            console.error('Could not load whitelist:', err);
            return false;
        });
}

// Call the OAuth handling function on page load
document.addEventListener('DOMContentLoaded', handleOAuth);