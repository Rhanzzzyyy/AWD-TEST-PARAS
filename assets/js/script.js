document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    initLoginForm();
    initBracketCreator();
    
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

    if (currentUser?.isLoggedIn) {
        authLinks.style.display = 'none';
        userDropdown.style.display = 'block';
        usernameDisplay.textContent = currentUser.name || currentUser.email.split('@')[0];
    } else {
        authLinks.style.display = 'flex';
        userDropdown.style.display = 'none';
    }
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    showCyberNotification('LOGOUT COMPLETE', 'You have been logged out', 'success');
    updateAuthUI();
    setTimeout(() => window.location.href = './index.html', 1500);
}

// Bracket Creator Functions
let players = [];

function initBracketCreator() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const bracketCreator = document.getElementById('bracketCreatorContainer');
    
    if (currentUser?.isLoggedIn) {
        bracketCreator.style.display = 'block';
        
        // Set up event listeners for buttons
        document.getElementById('previewBracketBtn').addEventListener('click', previewBracket);
        document.getElementById('createBracketBtn').addEventListener('click', createBracket);
        document.getElementById('managePlayersBtn').addEventListener('click', showPlayerManagementModal);
        
        // Initialize player list (empty)
        renderPlayerList();
        
        // Setup player management modal
        setupPlayerManagementModal();
        
        // Initialize with empty state
        editBracket();
    } else {
        bracketCreator.style.display = 'none';
    }
}

function setupPlayerManagementModal() {
    const modalElement = document.getElementById('playerManagementModal');
    if (modalElement) {
        const playerModal = new bootstrap.Modal(modalElement);
        window.playerModal = playerModal;
    }
}

function showPlayerManagementModal() {
    if (window.playerModal) {
        window.playerModal.show();
    } else {
        const modal = document.getElementById('playerManagementModal');
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
        }
    }
}

function closePlayerModal() {
    if (window.playerModal) {
        window.playerModal.hide();
    } else {
        const modal = document.getElementById('playerManagementModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
    }
}

function addPlayer() {
    const input = document.getElementById('playerNameInput');
    const name = input.value.trim();
    
    if (!name) {
        showCyberNotification('ERROR', 'Please enter a player name', 'error');
        return;
    }
    
    players.push(name);
    input.value = '';
    renderPlayerList();
    updatePreviewPlayerCount();
    showCyberNotification('SUCCESS', 'Player added', 'success');
}

function removePlayer(index) {
    players.splice(index, 1);
    renderPlayerList();
    updatePreviewPlayerCount();
}

function renderPlayerList() {
    const list = document.getElementById('playerList');
    if (!list) return;
    
    list.innerHTML = '';
    
    players.forEach((player, index) => {
        const li = document.createElement('li');
        li.className = 'player-list-item';
        li.innerHTML = `
            <span>${player}</span>
            <button class="btn btn-sm btn-outline-danger" onclick="removePlayer(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        list.appendChild(li);
    });
}

function updatePreviewPlayerCount() {
    const previewBtn = document.getElementById('previewManagePlayersBtn');
    if (previewBtn) {
        previewBtn.innerHTML = `<i class="fas fa-users me-2"></i>Manage Players (${players.length})`;
    }
    if (document.getElementById('bracketPreview').innerHTML.includes('bracket-preview-content')) {
        previewBracket();
    }
}

// Bracket Visualization
function previewBracket() {
    const maxPlayers = parseInt(document.getElementById('maxPlayers').value);
    const preview = document.getElementById('bracketPreview');
    const tournamentName = document.getElementById('tournamentName').value || 'TOURNAMENT';
    
    if (!tournamentName) {
        showCyberNotification('ERROR', 'Please enter a tournament name', 'error');
        return;
    }
    
    preview.innerHTML = `
        <div class="bracket-preview-content">
            <h3>${tournamentName}</h3>
            <button class="btn cyber-btn mb-3" id="previewManagePlayersBtn" onclick="showPlayerManagementModal()">
                <i class="fas fa-users me-2"></i>Manage Players (${players.length})
            </button>
            ${players.length >= 2 ? generateBracketVisualization(players.slice(0, maxPlayers)) : `
                <div class="empty-bracket-message">
                    <i class="fas fa-user-plus"></i>
                    <p>Add at least 2 players to generate bracket</p>
                </div>
            `}
            <div class="bracket-actions mt-3">
                <button class="btn cyber-btn me-2" onclick="editBracket()">
                    <i class="fas fa-edit me-2"></i>Edit
                </button>
                <button class="btn cyber-btn-primary" onclick="createBracket()">
                    <i class="fas fa-check me-2"></i>Create
                </button>
            </div>
        </div>
    `;
}

function generateBracketVisualization(teams) {
    if (teams.length < 2) return '';
    
    const rounds = Math.ceil(Math.log2(teams.length));
    let html = '<div class="bracket-grid">';
    
    // First Round
    html += `
        <div class="bracket-round">
            <h5 class="round-title">ROUND 1</h5>
            <div class="matches-container">
    `;
    
    const spacing = Math.pow(2, rounds - 1) * 20;
    
    for (let i = 0; i < teams.length; i += 2) {
        const player1 = teams[i] || 'TBD';
        const player2 = teams[i+1] || (i+1 < teams.length ? 'TBD' : 'BYE');
        const matchId = `match-0-${i/2}`;
        
        html += `
            <div class="bracket-match" data-match-id="${matchId}" style="margin-top:${i > 0 ? spacing + 'px' : '0'}">
                <div class="match-player top" data-player="${player1}" onclick="selectWinner('${matchId}', 'top')">${player1}</div>
                <div class="match-player bottom" data-player="${player2}" onclick="selectWinner('${matchId}', 'bottom')">${player2}</div>
            </div>
        `;
    }
    html += `</div></div>`;
    
    // Subsequent rounds
    let currentRoundMatches = Math.ceil(teams.length / 2);
    
    for (let round = 1; round < rounds; round++) {
        const nextRoundMatches = Math.ceil(currentRoundMatches / 2);
        const roundSpacing = Math.pow(2, rounds - round - 1) * 40;
        
        html += `
            <div class="bracket-round">
                <h5 class="round-title">${getRoundName(round, rounds)}</h5>
                <div class="matches-container">
        `;
        
        for (let i = 0; i < nextRoundMatches; i++) {
            const matchId = `match-${round}-${i}`;
            
            html += `
                <div class="bracket-match" data-match-id="${matchId}" style="margin-top:${i > 0 ? roundSpacing + 'px' : '0'}">
                    <div class="match-player top" onclick="selectWinner('${matchId}', 'top')">TBD</div>
                    <div class="match-player bottom" onclick="selectWinner('${matchId}', 'bottom')">TBD</div>
                </div>
            `;
        }
        
        html += `</div></div>`;
        currentRoundMatches = nextRoundMatches;
    }
    
    // Champion
    html += `
        <div class="bracket-round champion-round">
            <h5 class="round-title">CHAMPION</h5>
            <div class="champion-slot" id="champion">TBD</div>
        </div>
    `;
    
    return html + '</div>';
}

function selectWinner(matchId, position) {
    const [_, roundIndex, matchIndex] = matchId.split('-');
    const round = parseInt(roundIndex);
    const match = parseInt(matchIndex);
    
    const matchElement = document.querySelector(`[data-match-id="${matchId}"]`);
    const playerElement = matchElement.querySelector(`.match-player.${position}`);
    const playerName = playerElement.getAttribute('data-player') || playerElement.textContent;
    
    matchElement.querySelector('.match-player.top').classList.remove('winner');
    matchElement.querySelector('.match-player.bottom').classList.remove('winner');
    playerElement.classList.add('winner');
    
    const nextRound = round + 1;
    const nextMatch = Math.floor(match / 2);
    const nextPosition = match % 2 === 0 ? 'top' : 'bottom';
    const nextMatchId = `match-${nextRound}-${nextMatch}`;
    
    const nextMatchElement = document.querySelector(`[data-match-id="${nextMatchId}"]`);
    if (nextMatchElement) {
        const nextPlayerElement = nextMatchElement.querySelector(`.match-player.${nextPosition}`);
        nextPlayerElement.textContent = playerName;
        nextPlayerElement.setAttribute('data-player', playerName);
    } else if (round === Math.ceil(Math.log2(players.length)) - 1) {
        document.getElementById('champion').textContent = playerName;
    }
    
    updateBracketData(matchId, position, playerName);
}

function updateBracketData(matchId, winnerPosition, winnerName) {
    const urlParams = new URLSearchParams(window.location.search);
    const bracketId = urlParams.get('id');
    
    if (!bracketId) return;
    
    const brackets = JSON.parse(localStorage.getItem('brackets') || '[]');
    const bracketIndex = brackets.findIndex(b => b.id == bracketId);
    
    if (bracketIndex < 0) return;
    
    const bracket = brackets[bracketIndex];
    const [_, roundIndex, matchIndex] = matchId.split('-');
    const round = parseInt(roundIndex);
    const match = parseInt(matchIndex);
    
    if (bracket.rounds[round] && bracket.rounds[round].matches[match]) {
        const matchData = bracket.rounds[round].matches[match];
        matchData.winner = winnerName;
        matchData.completed = true;
        
        if (winnerPosition === 'top') {
            matchData.score1 = 1;
            matchData.score2 = 0;
        } else {
            matchData.score1 = 0;
            matchData.score2 = 1;
        }
        
        if (round < bracket.rounds.length - 1) {
            const nextRound = round + 1;
            const nextMatch = Math.floor(match / 2);
            const nextPosition = match % 2 === 0 ? 'player1' : 'player2';
            
            if (bracket.rounds[nextRound] && bracket.rounds[nextRound].matches[nextMatch]) {
                bracket.rounds[nextRound].matches[nextMatch][nextPosition] = winnerName;
            }
        }
        
        brackets[bracketIndex] = bracket;
        localStorage.setItem('brackets', JSON.stringify(brackets));
    }
}

function getRoundName(roundIndex, totalRounds) {
    if (roundIndex === totalRounds - 1) return "FINALS";
    if (roundIndex === totalRounds - 2) return "SEMI-FINALS";
    if (roundIndex === totalRounds - 3) return "QUARTER-FINALS";
    return `ROUND ${roundIndex + 1}`;
}

function editBracket() {
    const preview = document.getElementById('bracketPreview');
    preview.innerHTML = '';
    
    const editorForm = document.querySelector('.bracket-editor-form');
    if (editorForm) {
        editorForm.style.display = 'block';
    }
}

function createBracket() {
    const tournamentName = document.getElementById('tournamentName').value;
    const maxPlayers = parseInt(document.getElementById('maxPlayers').value);
    
    if (!tournamentName) {
        showCyberNotification('ERROR', 'Please enter a tournament name', 'error');
        return;
    }
    
    if (players.length < 2) {
        showCyberNotification('ERROR', 'Need at least 2 players for a tournament', 'error');
        return;
    }
    
    const bracketData = {
        id: Date.now(),
        name: tournamentName,
        createdAt: new Date().toISOString(),
        players: players.slice(0, maxPlayers),
        rounds: generateInitialRounds(players.slice(0, maxPlayers))
    };
    
    saveBracket(bracketData);
    
    showCyberNotification('SUCCESS', 'Tournament bracket created!', 'success');
    
    setTimeout(() => {
        window.location.href = `./bracket.html?id=${bracketData.id}`;
    }, 1500);
}

function generateInitialRounds(playerList) {
    const rounds = [];
    const numRounds = Math.ceil(Math.log2(playerList.length));
    
    // First round matches
    const firstRound = {
        name: "ROUND 1",
        matches: []
    };
    
    for (let i = 0; i < playerList.length; i += 2) {
        const player1 = playerList[i];
        const player2 = (i + 1 < playerList.length) ? playerList[i + 1] : null;
        
        firstRound.matches.push({
            id: `match-${rounds.length}-${firstRound.matches.length}`,
            player1: player1,
            player2: player2,
            winner: null,
            score1: null,
            score2: null,
            completed: false
        });
    }
    
    rounds.push(firstRound);
    
    // Empty subsequent rounds
    for (let i = 1; i < numRounds; i++) {
        const roundName = getRoundName(i, numRounds);
        const matchesInRound = Math.pow(2, numRounds - i - 1);
        
        const round = {
            name: roundName,
            matches: []
        };
        
        for (let j = 0; j < matchesInRound; j++) {
            round.matches.push({
                id: `match-${rounds.length}-${j}`,
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

function saveBracket(bracketData) {
    let brackets = JSON.parse(localStorage.getItem('brackets') || '[]');
    brackets.push(bracketData);
    localStorage.setItem('brackets', JSON.stringify(brackets));
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