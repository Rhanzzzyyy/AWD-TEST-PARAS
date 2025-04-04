document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    initLoginForm();
    initTournaments();
    
    document.querySelector('.logout-link')?.addEventListener('click', function(e) {
        e.preventDefault();
        logoutUser();
    });
});

// Authentication functions
function initLoginForm() {
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    if (!validateLoginForm(email, password)) return;

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner">⚙️</span> AUTHENTICATING...';
        const user = await authenticateUser(email, password);
        handleLoginSuccess(user);
    } catch (error) {
        handleLoginError(error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

function validateLoginForm(email, password) {
    if (!email || !password) {
        showCyberNotification('ERROR', 'Please enter both email and password!', 'error');
        return false;
    }
    return true;
}

async function authenticateUser(email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email && password) {
                resolve({ 
                    id: 1, 
                    email: email, 
                    name: email.split('@')[0] 
                });
            } else {
                reject(new Error('Invalid credentials'));
            }
        }, 1000);
    });
}

function handleLoginSuccess(user) {
    localStorage.setItem('currentUser', JSON.stringify({
        ...user,
        isLoggedIn: true
    }));
    showCyberNotification('ACCESS GRANTED', `Welcome ${user.name || user.email}!`, 'success');
    updateAuthUI();
    setTimeout(() => window.location.href = './index.html', 1500);
}

function handleLoginError(error) {
    showCyberNotification('ACCESS DENIED', error.message || 'Login failed', 'error');
}

function updateAuthUI() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authLinks = document.getElementById('authLinks');
    const userDropdown = document.getElementById('userDropdown');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const tournamentsSection = document.getElementById('tournamentsSection');

    if (currentUser?.isLoggedIn) {
        authLinks.style.display = 'none';
        userDropdown.style.display = 'block';
        usernameDisplay.textContent = currentUser.name || currentUser.email.split('@')[0];
        tournamentsSection.style.display = 'block';
        
        // Set userId in registration form
        document.getElementById('userId').value = currentUser.id;
    } else {
        authLinks.style.display = 'flex';
        userDropdown.style.display = 'none';
        if (tournamentsSection) tournamentsSection.style.display = 'none';
    }
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    showCyberNotification('LOGOUT COMPLETE', 'You have been logged out', 'success');
    updateAuthUI();
    setTimeout(() => window.location.href = './index.html', 1500);
}

// Tournament Functions
let tournaments = {
    tetris: {
        name: "Tetris Championship",
        players: [],
        rounds: [],
        champion: null
    },
    tekken: {
        name: "Tekken Tournament",
        players: [],
        rounds: [],
        champion: null
    }
};

function initTournaments() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser?.isLoggedIn) {
        // Initialize brackets
        initializeBrackets();
        
        // Load existing data if available
        const savedTournaments = localStorage.getItem('tournaments');
        if (savedTournaments) {
            const parsed = JSON.parse(savedTournaments);
            tournaments.tetris = parsed.tetris || tournaments.tetris;
            tournaments.tekken = parsed.tekken || tournaments.tekken;
        }
        
        // Render brackets
        renderBracket('tetris');
        renderBracket('tekken');
        
        // Set up player registration modal
        setupPlayerRegistrationModal();
        
        // Add reset button event listener
        document.getElementById('resetBracketsBtn')?.addEventListener('click', resetAllBrackets);
    }
}

function initializeBrackets() {
    // Initialize Tetris bracket with 8 slots (4 matches in first round)
    if (tournaments.tetris.rounds.length === 0) {
        tournaments.tetris.rounds = generateInitialRounds(8);
    }
    
    // Initialize Tekken bracket with 8 slots (4 matches in first round)
    if (tournaments.tekken.rounds.length === 0) {
        tournaments.tekken.rounds = generateInitialRounds(8);
    }
}

function generateInitialRounds(slots) {
    const rounds = [];
    const numRounds = Math.ceil(Math.log2(slots));
    
    // First Round
    const firstRound = {
        name: "ROUND 1",
        matches: []
    };
    
    for (let i = 0; i < slots / 2; i++) {
        firstRound.matches.push({
            id: `match-0-${i}`,
            player1: null,
            player2: null,
            winner: null,
            score1: null,
            score2: null,
            completed: false
        });
    }
    
    rounds.push(firstRound);
    
    // Subsequent rounds
    for (let i = 1; i < numRounds; i++) {
        const roundName = getRoundName(i, numRounds);
        const matchesInRound = Math.pow(2, numRounds - i - 1);
        
        const round = {
            name: roundName,
            matches: []
        };
        
        for (let j = 0; j < matchesInRound; j++) {
            round.matches.push({
                id: `match-${i}-${j}`,
                player1: null,
                player2: null,
                winner: null,
                score1: null,
                score2: null,
                completed: false
            });
        }
        
        rounds.push(round);
    }
    
    return rounds;
}

function renderBracket(tournamentType) {
    const bracketContainer = document.getElementById(`${tournamentType}Bracket`);
    if (!bracketContainer) return;
    
    const tournament = tournaments[tournamentType];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isOrganizer = currentUser?.email === 'Organizer@gmail.com';
    
    // Clear previous content
    bracketContainer.innerHTML = '';
    
    // Add clear button at the top of the bracket (only for organizers)
    if (isOrganizer) {
        const clearButton = document.createElement('button');
        clearButton.className = 'btn btn-danger btn-sm mb-3';
        clearButton.textContent = `Clear ${tournament.name}`;
        clearButton.onclick = () => confirmReset(tournamentType);
        bracketContainer.appendChild(clearButton);
    }
    
    const bracketGrid = document.createElement('div');
    bracketGrid.className = 'bracket-grid';
    bracketContainer.appendChild(bracketGrid);
    
    // Render each round
    tournament.rounds.forEach((round, roundIndex) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'bracket-round';
        
        const roundTitle = document.createElement('h5');
        roundTitle.className = 'round-title';
        roundTitle.textContent = round.name;
        roundDiv.appendChild(roundTitle);
        
        const matchesContainer = document.createElement('div');
        matchesContainer.className = 'matches-container';
        roundDiv.appendChild(matchesContainer);
        
        // Render each match
        round.matches.forEach((match, matchIndex) => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'bracket-match';
            matchDiv.dataset.matchId = match.id;
            matchDiv.dataset.roundIndex = roundIndex;
            matchDiv.dataset.matchIndex = matchIndex;
            
            // Top player slot
            const topPlayer = document.createElement('div');
            topPlayer.className = `match-player top ${match.player1 ? '' : 'empty-slot'} ${match.winner === match.player1 ? 'winner' : ''}`;
            topPlayer.dataset.position = 'top';
            topPlayer.textContent = match.player1 ? match.player1.name : 'Empty Slot';
            
            if (match.player1) {
                const details = document.createElement('div');
                details.className = 'player-details';
                details.textContent = `Rank: ${match.player1.rank}`;
                topPlayer.appendChild(details);
            }
            
            topPlayer.onclick = () => handlePlayerClick(tournamentType, roundIndex, matchIndex, 'player1', isOrganizer);
            matchDiv.appendChild(topPlayer);
            
            // Bottom player slot
            const bottomPlayer = document.createElement('div');
            bottomPlayer.className = `match-player bottom ${match.player2 ? '' : 'empty-slot'} ${match.winner === match.player2 ? 'winner' : ''}`;
            bottomPlayer.dataset.position = 'bottom';
            bottomPlayer.textContent = match.player2 ? match.player2.name : 'Empty Slot';
            
            if (match.player2) {
                const details = document.createElement('div');
                details.className = 'player-details';
                details.textContent = `Rank: ${match.player2.rank}`;
                bottomPlayer.appendChild(details);
            }
            
            bottomPlayer.onclick = () => handlePlayerClick(tournamentType, roundIndex, matchIndex, 'player2', isOrganizer);
            matchDiv.appendChild(bottomPlayer);
            
            matchesContainer.appendChild(matchDiv);
        });
        
        bracketGrid.appendChild(roundDiv);
    });
    
    // Add champion slot
    const championRound = document.createElement('div');
    championRound.className = 'bracket-round champion-round';
    
    const championTitle = document.createElement('h5');
    championTitle.className = 'round-title';
    championTitle.textContent = 'CHAMPION';
    championRound.appendChild(championTitle);
    
    const championSlot = document.createElement('div');
    championSlot.className = 'champion-slot';
    championSlot.textContent = tournament.champion ? tournament.champion.name : 'TBD';
    championRound.appendChild(championSlot);
    
    bracketGrid.appendChild(championRound);
    
    // Add connector lines
    addConnectorLines(tournamentType);
}

function confirmReset(tournamentType) {
    if (confirm(`Are you sure you want to reset the ${tournaments[tournamentType].name}? This will clear all players and matches.`)) {
        resetTournament(tournamentType);
    }
}

function addConnectorLines(tournamentType) {
    const bracketContainer = document.getElementById(`${tournamentType}Bracket`);
    if (!bracketContainer) return;
    
    const matches = bracketContainer.querySelectorAll('.bracket-match');
    
    matches.forEach(match => {
        const matchId = match.dataset.matchId;
        const [_, roundIndex, matchIndex] = matchId.split('-');
        const roundNum = parseInt(roundIndex);
        const matchNum = parseInt(matchIndex);
        
        // Horizontal line to next round
        if (roundNum < tournaments[tournamentType].rounds.length - 1) {
            const horizontalLine = document.createElement('div');
            horizontalLine.className = 'connector-line horizontal';
            match.appendChild(horizontalLine);
            
            // Vertical line for odd matches
            if (matchNum % 2 === 0) {
                const verticalLine = document.createElement('div');
                verticalLine.className = 'connector-line vertical top';
                match.appendChild(verticalLine);
            } else {
                const verticalLine = document.createElement('div');
                verticalLine.className = 'connector-line vertical bottom';
                match.appendChild(verticalLine);
            }
        }
    });
}

function handlePlayerClick(tournamentType, roundIndex, matchIndex, position, isOrganizer) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const match = tournaments[tournamentType].rounds[roundIndex].matches[matchIndex];
    const player = match[position];
    
    if (isOrganizer) {
        // Organizer can select winners in any round if both players are present
        const otherPosition = position === 'player1' ? 'player2' : 'player1';
        const otherPlayer = match[otherPosition];
        
        if (player && otherPlayer && !match.completed) {
            selectWinner(tournamentType, roundIndex, matchIndex, position);
        }
    } else {
        // Regular user can only join empty slots in first round
        if (roundIndex === 0 && !player) {
            showPlayerRegistrationModal(tournamentType, match.id, position);
        }
    }
}

function selectWinner(tournamentType, roundIndex, matchIndex, position) {
    const match = tournaments[tournamentType].rounds[roundIndex].matches[matchIndex];
    const winner = match[position];
    
    // Mark this match as completed
    match.winner = winner;
    match.completed = true;
    
    // Update scores
    if (position === 'player1') {
        match.score1 = 1;
        match.score2 = 0;
    } else {
        match.score1 = 0;
        match.score2 = 1;
    }
    
    // If this is not the final round, advance the winner
    if (roundIndex < tournaments[tournamentType].rounds.length - 1) {
        const nextRoundIndex = roundIndex + 1;
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const nextPosition = matchIndex % 2 === 0 ? 'player1' : 'player2';
        
        tournaments[tournamentType].rounds[nextRoundIndex].matches[nextMatchIndex][nextPosition] = winner;
    } else {
        // This is the final - set champion
        tournaments[tournamentType].champion = winner;
        showCyberNotification('CHAMPION CROWNED', `${winner.name} has won the ${tournaments[tournamentType].name}!`, 'success');
        
        // Automatically reset after a delay
        setTimeout(() => {
            resetTournament(tournamentType);
        }, 3000);
    }
    
    // Save and re-render
    saveTournaments();
    renderBracket(tournamentType);
}

function resetTournament(tournamentType) {
    tournaments[tournamentType] = {
        name: tournaments[tournamentType].name,
        players: [],
        rounds: generateInitialRounds(8),
        champion: null
    };
    
    saveTournaments();
    renderBracket(tournamentType);
    showCyberNotification('TOURNAMENT RESET', `${tournaments[tournamentType].name} has been reset`, 'info');
}

function resetAllBrackets() {
    resetTournament('tetris');
    resetTournament('tekken');
    
    // Clear the database (API)
    clearDatabase().then(() => {
        showCyberNotification('SYSTEM RESET', 'All tournaments and player data have been reset', 'success');
    }).catch(error => {
        showCyberNotification('ERROR', 'Failed to clear database: ' + error.message, 'error');
    });
}

async function clearDatabase() {
    try {
        const response = await fetch('https://demo-api-skills.vercel.app/api/GameHub/players', {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to clear database');
        }
    } catch (error) {
        console.error('Database clear error:', error);
        throw error;
    }
}

function showPlayerRegistrationModal(tournamentType, matchId, position) {
    const modal = new bootstrap.Modal(document.getElementById('playerRegistrationModal'));
    document.getElementById('tournamentType').value = tournamentType;
    document.getElementById('matchId').value = matchId;
    document.getElementById('playerPosition').value = position;
    modal.show();
}

function setupPlayerRegistrationModal() {
    document.getElementById('submitPlayerRegistration').addEventListener('click', async function() {
        const tournamentType = document.getElementById('tournamentType').value;
        const matchId = document.getElementById('matchId').value;
        const position = document.getElementById('playerPosition').value;
        const userId = document.getElementById('userId').value;
        const playerName = document.getElementById('playerName').value;
        const playerRank = document.getElementById('playerRank').value;
        const mainGame = document.getElementById('mainGame').value;
        
        if (!playerName || !playerRank || !mainGame) {
            showCyberNotification('ERROR', 'Please fill all fields', 'error');
            return;
        }
        
        const playerData = {
            name: playerName,
            rank: playerRank,
            mainGame: mainGame,
            userId: userId
        };
        
        try {
            // Save to API
            const response = await fetch('https://demo-api-skills.vercel.app/api/GameHub/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(playerData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to register player');
            }
            
            // Add player to tournament
            const [_, roundIndex, matchIndex] = matchId.split('-');
            const roundNum = parseInt(roundIndex);
            const matchNum = parseInt(matchIndex);
            
            tournaments[tournamentType].rounds[roundNum].matches[matchNum][position] = playerData;
            
            saveTournaments();
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('playerRegistrationModal'));
            modal.hide();
            document.getElementById('playerRegistrationForm').reset();
            
            renderBracket(tournamentType);
            
            showCyberNotification('SUCCESS', 'Successfully joined tournament!', 'success');
        } catch (error) {
            console.error('Registration error:', error);
            showCyberNotification('ERROR', error.message, 'error');
        }
    });
}

function saveTournaments() {
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
}

function getRoundName(roundIndex, totalRounds) {
    if (roundIndex === totalRounds - 1) return "FINALS";
    if (roundIndex === totalRounds - 2) return "SEMI-FINALS";
    if (roundIndex === totalRounds - 3) return "QUARTER-FINALS";
    return `ROUND ${roundIndex + 1}`;
}

// Notification system
function showCyberNotification(title, message, type = 'info') {
    const notificationContainer = document.getElementById('notificationContainer') || createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = `cyber-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-header">
            <h5>${title}</h5>
            <button class="close-btn" onclick="this.parentNode.parentNode.remove()">×</button>
        </div>
        <div class="notification-body">
            ${message}
        </div>
    `;
    
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}