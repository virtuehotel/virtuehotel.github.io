const clientId = '1360551839224959062';
const clientSecret = '20vNy72JN_LDyNMzFt8sSblwoT-bvixC';
const redirectUri = 'https://virtuehotel.github.io/intra/index.html'; // Update with your GitHub Pages URL

function saveUserDataToLocalStorage(userData) {
    localStorage.setItem('discordUserData', JSON.stringify(userData));
    console.log('User data saved to localStorage:', userData); // Log saved data
}

// Parse the authorization code from the query parameters
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
            // Redirect to dashboard
            window.location.href = 'dashboard.html'; // Redirect to dashboard after successful login
        })
        .catch(error => console.error('Error fetching user data:', error));
    })
    .catch(error => console.error('Error exchanging code for token:', error));
} else {
    console.warn('No authorization code found in URL');
}

// Check for user data on page load only if not in login.html
if (window.location.pathname !== '/login.html') {
    document.addEventListener('DOMContentLoaded', function () {
        const userData = JSON.parse(localStorage.getItem('discordUserData'));

        if (userData) {
            // const usernameElement = document.querySelector('.greetingMsg');
            // const avatarElement = document.querySelector('.userProfile');

            // usernameElement.textContent = "Welcome, " + userData.username;
            // avatarElement.src = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;

            console.log(userData);

            // Remove the code parameter from the URL
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.delete('code');
            const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;

            // Update the URL without the code parameter
            history.replaceState({}, document.title, newUrl);
        } else {
            // If user data is not available, redirect to sign-in page
            console.warn('User data not found, redirecting to login.');
            // window.location.href = './login.html';
        }
    });
}