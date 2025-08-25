/**
 * Stranger Face - Cyberpunk Anime Video Chat Application
 * Hobby-Based Matching System - No Gender Filters
 */

class StrangerFaceApp {
    constructor() {
        console.log('🚀 Initializing Cyberpunk Anime Stranger Face...');

        // Enhanced application state
        this.state = {
            currentView: 'landing', // landing, hobbySelection, loading, chat
            selectedHobby: null,
            isConnected: false,
            sessionStartTime: null,
            currentStranger: null,
            isReporting: false,
            isMuted: false,
            particleSystem: null,
            emojiReactionQueue: [],
            soundEffectsEnabled: true,
            animationSpeed: 1,
            isLoading: false
        };

        // Hobby data with colors and descriptions
        this.hobbies = [
            {
                id: "singing",
                name: "Singing", 
                emoji: "🎤",
                color: "#FF69B4",
                description: "Connect with fellow vocalists and music lovers"
            },
            {
                id: "dancing",
                name: "Dancing",
                emoji: "💃", 
                color: "#FF6B35",
                description: "Meet other dancers and movement enthusiasts"
            },
            {
                id: "music",
                name: "Music",
                emoji: "🎶",
                color: "#8B5CF6", 
                description: "Find musicians, producers, and music fans"
            },
            {
                id: "coding",
                name: "Coding", 
                emoji: "👨‍💻",
                color: "#00D4AA",
                description: "Connect with developers and tech enthusiasts"
            },
            {
                id: "gaming",
                name: "Gaming",
                emoji: "🎮",
                color: "#3B82F6",
                description: "Meet gamers and esports fans worldwide"
            },
            {
                id: "art",
                name: "Art",
                emoji: "🎨",
                color: "#F59E0B",
                description: "Find artists, designers, and creative minds"
            },
            {
                id: "books", 
                name: "Books",
                emoji: "📚",
                color: "#10B981",
                description: "Connect with readers and literary enthusiasts"
            },
            {
                id: "travel",
                name: "Travel",
                emoji: "✈️", 
                color: "#06B6D4",
                description: "Meet fellow travelers and adventure seekers"
            }
        ];

        // Enhanced country data
        this.countries = [
            {"code": "US", "name": "United States", "flag": "🇺🇸"},
            {"code": "GB", "name": "United Kingdom", "flag": "🇬🇧"},
            {"code": "DE", "name": "Germany", "flag": "🇩🇪"},
            {"code": "FR", "name": "France", "flag": "🇫🇷"},
            {"code": "JP", "name": "Japan", "flag": "🇯🇵"},
            {"code": "KR", "name": "South Korea", "flag": "🇰🇷"},
            {"code": "IN", "name": "India", "flag": "🇮🇳"},
            {"code": "BR", "name": "Brazil", "flag": "🇧🇷"},
            {"code": "CA", "name": "Canada", "flag": "🇨🇦"},
            {"code": "AU", "name": "Australia", "flag": "🇦🇺"}
        ];

        // Anime emoji reactions
        this.animeReactions = [
            {"emoji": "❤️", "name": "love", "color": "#FF1493"},
            {"emoji": "😂", "name": "laugh", "color": "#FFD700"},
            {"emoji": "👋", "name": "wave", "color": "#00CED1"},
            {"emoji": "🚀", "name": "rocket", "color": "#FF4500"},
            {"emoji": "🌸", "name": "flower", "color": "#FF69B4"},
            {"emoji": "🎮", "name": "gaming", "color": "#3B82F6"}
        ];

        // Search and connection messages
        this.searchMessages = [
            "🔍 Searching for someone who loves {hobby}… Please wait 🌍✨",
            "💫 Finding fellow {hobby} enthusiasts… Scanning network 🚀",
            "🌸 Connecting you with {hobby} lovers worldwide… ✨",
            "🚀 Discovering {hobby} community members… Almost there! 💫",
            "✨ Matching you with someone passionate about {hobby}… 🌍"
        ];

        this.connectionMessages = [
            "🎉 Connected with someone who loves {hobby} from {country}! 🌍✨",
            "💫 Found a {hobby} enthusiast from {country}! Say hello! 🚀", 
            "🌸 Met someone from {country} who shares your love for {hobby}! 💫",
            "✨ New connection: {hobby} lover from {country} joined! 🎉",
            "🚀 Portal opened to {country}! Time to talk about {hobby}! 🌍"
        ];

        // DOM elements cache
        this.elements = {};

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('🎌 Starting Cyberpunk Hobby Hub initialization...');

        // Cache DOM elements
        this.cacheElements();

        // Set up event listeners
        this.setupEventListeners();

        // Initialize particle system
        this.initializeParticleSystem();

        // Start with landing page
        this.showView('landing');

        // Add some initial flair
        this.addStartupAnimations();

        console.log('✨ Cyberpunk Stranger Face ready!');
    }

    cacheElements() {
        // Views
        this.elements.landingPage = document.getElementById('landingPage');
        this.elements.hobbySelection = document.getElementById('hobbySelection');
        this.elements.loadingScreen = document.getElementById('loadingScreen');
        this.elements.chatScreen = document.getElementById('chatScreen');

        // Landing page elements
        this.elements.getStartedBtn = document.getElementById('getStartedBtn');

        // Hobby selection elements
        this.elements.hobbyCards = document.querySelectorAll('.hobby-card');

        // Loading elements
        this.elements.loadingText = document.getElementById('loadingText');

        // Chat elements
        this.elements.connectionInfo = document.getElementById('connectionInfo');
        this.elements.hobbyName = document.getElementById('hobbyName');
        this.elements.countryInfo = document.getElementById('countryInfo');
        this.elements.nextBtn = document.getElementById('nextBtn');
        this.elements.muteBtn = document.getElementById('muteBtn');
        this.elements.reportBtn = document.getElementById('reportBtn');
        this.elements.sessionTime = document.getElementById('sessionTime');

        // Emoji reaction elements
        this.elements.emojiButtons = document.querySelectorAll('.emoji-btn');
        this.elements.emojiReactions = document.getElementById('emojiReactions');

        // Modal elements
        this.elements.reportModal = document.getElementById('reportModal');
        this.elements.closeReportModal = document.getElementById('closeReportModal');
        this.elements.cancelReport = document.getElementById('cancelReport');
        this.elements.submitReport = document.getElementById('submitReport');
        this.elements.reportReason = document.getElementById('reportReason');
        this.elements.reportDescription = document.getElementById('reportDescription');
    }

    setupEventListeners() {
        // Get Started button
        if (this.elements.getStartedBtn) {
            this.elements.getStartedBtn.addEventListener('click', () => {
                this.handleGetStarted();
            });
        }

        // Hobby card selection
        this.elements.hobbyCards.forEach(card => {
            card.addEventListener('click', () => {
                this.handleHobbySelection(card);
            });
        });

        // Chat control buttons
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => {
                this.handleNextStranger();
            });
        }

        if (this.elements.muteBtn) {
            this.elements.muteBtn.addEventListener('click', () => {
                this.handleMuteToggle();
            });
        }

        if (this.elements.reportBtn) {
            this.elements.reportBtn.addEventListener('click', () => {
                this.handleReportUser();
            });
        }

        // Emoji reactions
        this.elements.emojiButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.dataset.emoji;
                this.sendEmojiReaction(emoji);
            });
        });

        // Report modal
        if (this.elements.closeReportModal) {
            this.elements.closeReportModal.addEventListener('click', () => {
                this.hideReportModal();
            });
        }

        if (this.elements.cancelReport) {
            this.elements.cancelReport.addEventListener('click', () => {
                this.hideReportModal();
            });
        }

        if (this.elements.submitReport) {
            this.elements.submitReport.addEventListener('click', () => {
                this.submitReport();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            this.handlePageUnload();
        });
    }

    showView(viewName) {
        console.log(`🎯 Switching to view: ${viewName}`);

        // Hide all views
        const views = ['landingPage', 'hobbySelection', 'loadingScreen', 'chatScreen'];
        views.forEach(view => {
            const element = this.elements[view];
            if (element) {
                element.style.display = 'none';
            }
        });

        // Show target view
        const targetView = this.elements[viewName];
        if (targetView) {
            targetView.style.display = 'flex';

            // Add view-specific animations
            this.addViewTransitionAnimation(viewName);
        }

        // Update state
        this.state.currentView = viewName;
    }

    handleGetStarted() {
        console.log('🚀 Get Started clicked!');

        // Add button animation
        this.elements.getStartedBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.elements.getStartedBtn.style.transform = '';
        }, 150);

        // Transition to hobby selection
        setTimeout(() => {
            this.showView('hobbySelection');
        }, 300);
    }

    handleHobbySelection(card) {
        const hobbyId = card.dataset.hobby;
        const hobby = this.hobbies.find(h => h.id === hobbyId);

        if (!hobby) return;

        console.log(`🎯 Selected hobby: ${hobby.name}`);

        // Remove previous selection
        this.elements.hobbyCards.forEach(c => c.classList.remove('selected'));

        // Add selection to clicked card
        card.classList.add('selected');

        // Store selection
        this.state.selectedHobby = hobby;

        // Add selection animation
        card.style.transform = 'scale(1.1)';

        // Start search after animation
        setTimeout(() => {
            this.startHobbySearch();
        }, 500);
    }

    startHobbySearch() {
        console.log(`🔍 Starting search for ${this.state.selectedHobby.name} enthusiasts...`);

        // Update loading text
        const searchText = this.getRandomSearchMessage(this.state.selectedHobby.name);
        if (this.elements.loadingText) {
            this.elements.loadingText.textContent = searchText;
        }

        // Show loading screen
        this.showView('loadingScreen');

        // Simulate search (in real app, this would connect to backend)
        this.simulateSearch();
    }

    simulateSearch() {
        // Simulate search time (2-5 seconds)
        const searchTime = Math.random() * 3000 + 2000;

        setTimeout(() => {
            this.handleMatchFound();
        }, searchTime);
    }

    handleMatchFound() {
        console.log('🎉 Match found!');

        // Get random stranger data
        const stranger = this.generateRandomStranger();
        this.state.currentStranger = stranger;

        // Update connection info
        this.updateConnectionInfo(stranger);

        // Show chat screen
        this.showView('chatScreen');

        // Start session timer
        this.startSessionTimer();

        // Show connection celebration
        this.showConnectionCelebration(stranger);
    }

    generateRandomStranger() {
        const randomCountry = this.countries[Math.floor(Math.random() * this.countries.length)];

        return {
            id: Date.now().toString(),
            country: randomCountry.name,
            countryCode: randomCountry.code,
            flag: randomCountry.flag,
            hobby: this.state.selectedHobby,
            connectedAt: new Date()
        };
    }

    updateConnectionInfo(stranger) {
        if (this.elements.hobbyName) {
            this.elements.hobbyName.textContent = stranger.hobby.name;
        }

        if (this.elements.countryInfo) {
            this.elements.countryInfo.textContent = `${stranger.flag} ${stranger.country}`;
        }
    }

    showConnectionCelebration(stranger) {
        // Show celebration message
        const message = this.getRandomConnectionMessage(stranger.hobby.name, stranger.country);

        // Create temporary celebration overlay
        const celebration = document.createElement('div');
        celebration.className = 'connection-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-text">${message}</div>
                <div class="celebration-emojis">🎉✨🚀💫</div>
            </div>
        `;

        // Add styles
        celebration.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1500;
            animation: fadeIn 0.5s ease-out;
        `;

        document.body.appendChild(celebration);

        // Remove after 3 seconds
        setTimeout(() => {
            celebration.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                document.body.removeChild(celebration);
            }, 500);
        }, 3000);
    }

    startSessionTimer() {
        this.state.sessionStartTime = Date.now();

        this.sessionTimer = setInterval(() => {
            this.updateSessionTimer();
        }, 1000);
    }

    updateSessionTimer() {
        if (!this.state.sessionStartTime) return;

        const elapsed = Date.now() - this.state.sessionStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (this.elements.sessionTime) {
            this.elements.sessionTime.textContent = timeString;
        }

        // Auto-disconnect after 30 minutes
        if (minutes >= 30) {
            this.handleAutoDisconnect();
        }
    }

    handleNextStranger() {
        console.log('➡️ Finding next stranger...');

        // Stop current session
        this.stopSession();

        // Start new search
        this.startHobbySearch();
    }

    handleMuteToggle() {
        this.state.isMuted = !this.state.isMuted;

        const muteBtn = this.elements.muteBtn;
        const icon = muteBtn.querySelector('.btn-icon');
        const text = muteBtn.querySelector('.btn-text');

        if (this.state.isMuted) {
            icon.textContent = '🔇';
            text.textContent = 'Unmute';
            muteBtn.style.background = 'rgba(255, 68, 68, 0.2)';
        } else {
            icon.textContent = '🔊';
            text.textContent = 'Mute';
            muteBtn.style.background = '';
        }

        console.log(`🔊 Audio ${this.state.isMuted ? 'muted' : 'unmuted'}`);
    }

    handleReportUser() {
        console.log('⚠️ Opening report modal...');
        this.showReportModal();
    }

    showReportModal() {
        if (this.elements.reportModal) {
            this.elements.reportModal.style.display = 'flex';
            this.elements.reportModal.style.animation = 'fadeIn 0.3s ease-out';
        }
    }

    hideReportModal() {
        if (this.elements.reportModal) {
            this.elements.reportModal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                this.elements.reportModal.style.display = 'none';
            }, 300);
        }
    }

    submitReport() {
        const reason = this.elements.reportReason.value;
        const description = this.elements.reportDescription.value;

        if (!reason) {
            alert('Please select a reason for reporting.');
            return;
        }

        console.log('📤 Submitting report...', { reason, description });

        // Simulate report submission
        setTimeout(() => {
            this.hideReportModal();
            this.showNotification('Report submitted successfully. Thank you for keeping our community safe.', 'success');

            // Disconnect from current stranger
            this.handleNextStranger();
        }, 1000);
    }

    sendEmojiReaction(emoji) {
        console.log(`💫 Sending emoji reaction: ${emoji}`);

        // Create floating emoji
        this.createFloatingEmoji(emoji);

        // In real app, send to other user via WebSocket
        // socket.emit('emoji-reaction', { emoji, timestamp: Date.now() });
    }

    createFloatingEmoji(emoji) {
        const container = this.elements.emojiReactions;
        if (!container) return;

        const emojiElement = document.createElement('div');
        emojiElement.className = 'floating-emoji';
        emojiElement.textContent = emoji;

        // Random start position
        const startX = Math.random() * window.innerWidth;
        emojiElement.style.left = startX + 'px';
        emojiElement.style.bottom = '10%';

        container.appendChild(emojiElement);

        // Remove after animation
        setTimeout(() => {
            if (container.contains(emojiElement)) {
                container.removeChild(emojiElement);
            }
        }, 3000);
    }

    handleKeyboardShortcuts(e) {
        // Only handle shortcuts in chat view
        if (this.state.currentView !== 'chatScreen') return;

        switch(e.key) {
            case ' ': // Space = Next stranger
                e.preventDefault();
                this.handleNextStranger();
                break;
            case 'Escape': // Esc = Back to landing
                this.handlePageUnload();
                this.showView('landing');
                break;
            case 'm': // M = Mute toggle
                this.handleMuteToggle();
                break;
        }
    }

    stopSession() {
        // Clear session timer
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }

        // Reset session state
        this.state.sessionStartTime = null;
        this.state.currentStranger = null;
        this.state.isConnected = false;
        this.state.isMuted = false;
    }

    handleAutoDisconnect() {
        console.log('⏰ Auto-disconnect after 30 minutes');
        this.showNotification('Session ended after 30 minutes. Starting new search...', 'info');
        this.handleNextStranger();
    }

    handlePageUnload() {
        // Clean up resources
        this.stopSession();

        // In real app, disconnect from WebSocket
        // if (this.socket) {
        //     this.socket.disconnect();
        // }
    }

    initializeParticleSystem() {
        // Particle system is handled by CSS animations
        // This method could be expanded for more complex particle effects
        console.log('✨ Particle system initialized');
    }

    addStartupAnimations() {
        // Add staggered animation to main title
        const titleParts = document.querySelectorAll('.title-part');
        titleParts.forEach((part, index) => {
            part.style.animation = `float 3s ease-in-out infinite ${index * 0.2}s`;
        });
    }

    addViewTransitionAnimation(viewName) {
        const view = this.elements[viewName];
        if (!view) return;

        // Reset any existing animations
        view.style.animation = '';

        // Add entrance animation
        setTimeout(() => {
            view.style.animation = 'fadeIn 0.5s ease-out';
        }, 50);
    }

    getRandomSearchMessage(hobbyName) {
        const messages = this.searchMessages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        return randomMessage.replace('{hobby}', hobbyName);
    }

    getRandomConnectionMessage(hobbyName, country) {
        const messages = this.connectionMessages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        return randomMessage.replace('{hobby}', hobbyName).replace('{country}', country);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Style notification
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            border: 1px solid ${type === 'success' ? '#00ff41' : type === 'error' ? '#ff4444' : '#00ffff'};
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            z-index: 2000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            font-size: 0.9rem;
        `;

        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // WebRTC Integration Placeholders
    // These methods would be implemented with actual WebRTC functionality
    initializeWebRTC() {
        // Initialize WebRTC peer connection
        // Set up local media stream
        // Handle ICE candidates
        console.log('🎥 WebRTC initialization placeholder');
    }

    connectToSignalingServer() {
        // Connect to Socket.io signaling server
        // Handle offer/answer exchange
        // Handle ICE candidate exchange
        console.log('🔌 WebSocket connection placeholder');
    }

    // Utility Methods
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    log(message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`, data || '');
    }
}

// Additional CSS animations via JavaScript
const additionalStyles = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-20px); }
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

.connection-celebration {
    animation: fadeIn 0.5s ease-out;
}

.celebration-content {
    background: rgba(0, 0, 0, 0.9);
    border: 2px solid #00ffff;
    border-radius: 20px;
    padding: 3rem;
    text-align: center;
    max-width: 500px;
    backdrop-filter: blur(20px);
}

.celebration-text {
    font-size: 1.5rem;
    font-weight: 600;
    color: white;
    margin-bottom: 1rem;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.celebration-emojis {
    font-size: 2rem;
    animation: bounce-emoji 1s ease-in-out infinite;
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the application
new StrangerFaceApp();