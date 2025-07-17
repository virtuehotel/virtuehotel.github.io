const clientId = '1360551839224959062';
const clientSecret = '20vNy72JN_LDyNMzFt8sSblwoT-bvixC';
const redirectUri = 'https://virtuehotel.github.io/intra/index.html'; // Update with your GitHub Pages URL
const guildId = '1134637400547663942'; // Replace with your actual Guild ID

function saveUserDataToLocalStorage(userData) {
    localStorage.setItem('discordUserData', JSON.stringify(userData));
    console.log('User data saved to localStorage:', userData);
}

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
            throw new Error('Failed to exchange code for token');
        }
        return response.json();
    })
    .then(data => {
        const accessToken = data.access_token;

        // Fetch user data
        fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return response.json();
        })
        .then(userData => {
            // Save user data to localStorage
            saveUserDataToLocalStorage(userData);

            // Fetch user roles in the guild
            return fetch(`https://discord.com/api/guilds/${guildId}/members/${userData.id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch guild member data');
            }
            return response.json();
        })
        .then(guildMemberData => {
            // Add roles to user data
            const userData = JSON.parse(localStorage.getItem('discordUserData'));
            userData.roles = guildMemberData.roles || [];
            saveUserDataToLocalStorage(userData);

            // Redirect to dashboard
            window.location.href = 'index.html';
        })
        .catch(error => console.error('Error fetching user data:', error));
    })
    .catch(error => console.error('Error exchanging code for token:', error));
} else {
    console.warn('No authorization code found in URL');
}