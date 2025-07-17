const clientId = '1360551839224959062';
const clientSecret = 'pYHQtjcQNEPo6UYr30PHFH_l8fliJbXj';
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
            body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`
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

                function fetchWhitelistAndCheck(userId) {
                    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vT1nzgo9w6QqWX-ZYyv0jqrahG8BjE4HvOChQFPbl8c1_lOkJJW6KsVsAMdFvT-4PxVkMK7CuFXGeCi/pub?gid=0&single=true&output=csv')
                        .then(response => response.text())
                        .then(csv => {
                            // Split CSV by line, skip header
                            const lines = csv.trim().split('\n').slice(1);
                            const ids = lines.map(line => line.split(',')[0].replace(/"/g, ''));
                            if (ids.includes(userId)) {
                                // User is allowed
                                alert('Access granted!');
                                window.location.href = 'index2.html';
                            } else {
                                alert('You are NOT on the whitelist.');
                                window.location.href = 'login.html';
                            }
                        })
                        .catch(err => alert('Could not load whitelist.'));
                }
            })
            .catch(error => console.error('Error during OAuth flow:', error));
    } else {
        console.warn('No authorization code found in URL');
    }
}

// Call the OAuth handling function on page load
document.addEventListener('DOMContentLoaded', handleOAuth);