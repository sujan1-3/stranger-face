# FRONTEND FILES - Exact content from the latest cyberpunk hobby version

# 1. Frontend index.html - Exact content
frontend_index_html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>👾 Stranger Face 🌍 - Cyberpunk Anime Social Hub</title>
    <meta name="description" content="Meet Strangers. Share Your World. Discover New Passions 🚀✨">
    
    <!-- Futuristic Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- 3D Particle Background System -->
    <div class="particles-universe">
        <div class="particle-layer layer-1">
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
        </div>
        <div class="particle-layer layer-2">
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
        </div>
        <div class="particle-layer layer-3">
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
        </div>
        <div class="floating-orbs">
            <div class="orb orb-1"></div>
            <div class="orb orb-2"></div>
            <div class="orb orb-3"></div>
        </div>
    </div>

    <!-- Emoji Reactions Overlay -->
    <div id="emojiReactions" class="emoji-reactions-container"></div>

    <!-- Landing Page -->
    <div id="landingPage" class="landing-container">
        <!-- 3D Animated Logo Section -->
        <div class="hero-section">
            <div class="logo-3d-container">
                <div class="logo-3d-wrapper">
                    <div class="logo-glow-ring"></div>
                    <h1 class="main-title">
                        <span class="title-part">👾</span>
                        <span class="title-part">Stranger</span>
                        <span class="title-part">Face</span>
                        <span class="title-part">🌍</span>
                    </h1>
                </div>
            </div>
            
            <!-- Tagline -->
            <div class="tagline-container">
                <p class="main-tagline">
                    Meet Strangers. Share Your World. Discover New Passions <span class="emoji-bounce">🚀✨</span>
                </p>
            </div>

            <!-- Get Started Button -->
            <div class="start-button-container">
                <button id="getStartedBtn" class="get-started-btn">
                    <span class="btn-glow"></span>
                    <span class="btn-text">Get Started ⚡</span>
                    <div class="btn-ripple"></div>
                </button>
            </div>
        </div>
    </div>

    <!-- Hobby Selection Screen -->
    <div id="hobbySelection" class="hobby-selection-container" style="display: none;">
        <div class="hobby-header">
            <h2 class="hobby-title">Choose Your Passion</h2>
            <p class="hobby-subtitle">Connect with people who share your interests</p>
        </div>
        
        <div class="hobby-grid">
            <div class="hobby-card" data-hobby="singing">
                <div class="hobby-card-glow"></div>
                <div class="hobby-icon">🎤</div>
                <div class="hobby-name">Singing</div>
                <div class="hobby-description">Connect with fellow vocalists</div>
            </div>
            
            <div class="hobby-card" data-hobby="dancing">
                <div class="hobby-card-glow"></div>
                <div class="hobby-icon">💃</div>
                <div class="hobby-name">Dancing</div>
                <div class="hobby-description">Meet movement enthusiasts</div>
            </div>
            
            <div class="hobby-card" data-hobby="music">
                <div class="hobby-card-glow"></div>
                <div class="hobby-icon">🎶</div>
                <div class="hobby-name">Music</div>
                <div class="hobby-description">Find musicians and fans</div>
            </div>
            
            <div class="hobby-card" data-hobby="coding">
                <div class="hobby-card-glow"></div>
                <div class="hobby-icon">👨‍💻</div>
                <div class="hobby-name">Coding</div>
                <div class="hobby-description">Connect with developers</div>
            </div>
            
            <div class="hobby-card" data-hobby="gaming">
                <div class="hobby-card-glow"></div>
                <div class="hobby-icon">🎮</div>
                <div class="hobby-name">Gaming</div>
                <div class="hobby-description">Meet gamers worldwide</div>
            </div>
            
            <div class="hobby-card" data-hobby="art">
                <div class="hobby-card-glow"></div>
                <div class="hobby-icon">🎨</div>
                <div class="hobby-name">Art</div>
                <div class="hobby-description">Find creative minds</div>
            </div>
            
            <div class="hobby-card" data-hobby="books">
                <div class="hobby-card-glow"></div>
                <div class="hobby-icon">📚</div>
                <div class="hobby-name">Books</div>
                <div class="hobby-description">Connect with readers</div>
            </div>
            
            <div class="hobby-card" data-hobby="travel">
                <div class="hobby-card-glow"></div>
                <div class="hobby-icon">✈️</div>
                <div class="hobby-name">Travel</div>
                <div class="hobby-description">Meet adventure seekers</div>
            </div>
        </div>
    </div>

    <!-- Loading Screen -->
    <div id="loadingScreen" class="loading-container" style="display: none;">
        <div class="loading-character">
            <div class="character-console">
                <div class="console-screens"></div>
                <div class="typing-animation"></div>
            </div>
        </div>
        
        <div class="loading-text-container">
            <h3 id="loadingText" class="loading-text">
                🔍 Searching for someone who loves Music… Please wait 🌍✨
            </h3>
            <div class="loading-dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        </div>
        
        <div class="scanning-animation">
            <div class="scan-line"></div>
        </div>
    </div>

    <!-- Video Chat Screen -->
    <div id="chatScreen" class="chat-container" style="display: none;">
        <!-- Background Elements -->
        <div class="chat-background">
            <div class="holographic-interface"></div>
            <div class="ambient-characters"></div>
        </div>
        
        <!-- Connection Info -->
        <div id="connectionInfo" class="connection-info">
            🌍 Connected with someone who loves <span id="hobbyName">Music</span> from <span id="countryInfo">🇺🇸 United States</span>
        </div>
        
        <!-- Video Containers -->
        <div class="video-layout">
            <!-- Stranger Video (Large) -->
            <div class="stranger-video-container">
                <div class="video-frame-glow"></div>
                <div id="strangerVideo" class="stranger-video">
                    <div class="video-placeholder">
                        <div class="placeholder-icon">🎥</div>
                        <div class="placeholder-text">Stranger's Video</div>
                    </div>
                </div>
                <div class="video-overlay">
                    <div class="connection-status">🟢 Connected</div>
                </div>
            </div>
            
            <!-- Self Video (Small Circular) -->
            <div class="self-video-container">
                <div class="self-video-glow"></div>
                <div id="selfVideo" class="self-video">
                    <div class="video-placeholder small">
                        <div class="placeholder-icon">📷</div>
                        <div class="placeholder-text">You</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Chat Controls -->
        <div class="chat-controls">
            <button id="nextBtn" class="control-btn next-btn">
                <span class="btn-icon">➡️</span>
                <span class="btn-text">Next</span>
                <div class="btn-glow-effect"></div>
            </button>
            
            <button id="muteBtn" class="control-btn mute-btn">
                <span class="btn-icon">🔇</span>
                <span class="btn-text">Mute</span>
                <div class="btn-glow-effect"></div>
            </button>
            
            <button id="reportBtn" class="control-btn report-btn">
                <span class="btn-icon">⚠️</span>
                <span class="btn-text">Report</span>
                <div class="btn-glow-effect"></div>
            </button>
        </div>
        
        <!-- Emoji Reactions -->
        <div class="emoji-reactions">
            <button class="emoji-btn" data-emoji="❤️">❤️</button>
            <button class="emoji-btn" data-emoji="😂">😂</button>
            <button class="emoji-btn" data-emoji="👋">👋</button>
            <button class="emoji-btn" data-emoji="🚀">🚀</button>
            <button class="emoji-btn" data-emoji="🌸">🌸</button>
            <button class="emoji-btn" data-emoji="🎮">🎮</button>
        </div>
        
        <!-- Session Timer -->
        <div class="session-timer">
            <span id="sessionTime">00:00</span>
        </div>
    </div>

    <!-- Report Modal -->
    <div id="reportModal" class="modal-overlay" style="display: none;">
        <div class="modal-container">
            <div class="modal-header">
                <h3>⚠️ Report User</h3>
                <button id="closeReportModal" class="close-btn">×</button>
            </div>
            <div class="modal-content">
                <p>Why are you reporting this user?</p>
                <select id="reportReason" class="report-select">
                    <option value="">Select a reason...</option>
                    <option value="inappropriate_behavior">Inappropriate Behavior</option>
                    <option value="harassment">Harassment</option>
                    <option value="nudity">Nudity</option>
                    <option value="spam">Spam</option>
                    <option value="underage">Underage User</option>
                    <option value="violence">Violence</option>
                    <option value="other">Other</option>
                </select>
                <textarea id="reportDescription" placeholder="Additional details (optional)..." class="report-textarea"></textarea>
            </div>
            <div class="modal-footer">
                <button id="cancelReport" class="modal-btn cancel-btn">Cancel</button>
                <button id="submitReport" class="modal-btn submit-btn">Submit Report</button>
            </div>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>'''

save_file('frontend-index.html', frontend_index_html)