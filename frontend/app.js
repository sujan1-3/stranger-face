/**
 * Stranger Face - REAL WebRTC Video Chat Application
 * Complete production-ready implementation
 */

class StrangerFaceApp {
    constructor() {
        console.log('🚀 Initializing REAL Stranger Face...');
        
        // Real application state
        this.state = {
            currentView: 'landing',
            selectedHobby: null,
            isConnected: false,
            sessionStartTime: null,
            currentStranger: null,
            isReporting: false,
            isMuted: false,
            localStream: null,
            remoteStream: null,
            peerConnection: null,
            socket: null
        };

        // WebRTC configuration
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        };

        // Hobby data
        this.hobbies = [
            { id: "singing", name: "Singing", emoji: "🎤" },
            { id: "dancing", name: "Dancing", emoji: "💃" },
            { id: "music", name: "Music", emoji: "🎶" },
            { id: "coding", name: "Coding", emoji: "👨‍💻" },
            { id: "gaming", name: "Gaming", emoji: "🎮" },
            { id: "art", name: "Art", emoji: "🎨" },
            { id: "books", name: "Books", emoji: "📚" },
            { id: "travel", name: "Travel", emoji: "✈️" }
        ];

        // DOM elements cache
        this.elements = {};

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        console.log('🎌 Starting REAL Cyberpunk Hobby Hub...');
        
        // Cache DOM elements
        this.cacheElements();
        
        // Initialize Socket.IO connection to backend
        await this.initializeSocket();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Show landing page
        this.showView('landing');
        
        console.log('✅ Real Stranger Face ready!');
    }

    // Initialize real Socket.IO connection
    async initializeSocket() {
        try {
            // Connect to your Render backend
            this.socket = io('https://stranger-face-backend.onrender.com', {
                transports: ['websocket', 'polling']
            });

            this.socket.on('connect', () => {
                console.log('🔌 Connected to real backend server!');
                this.showNotification('Connected to server', 'success');
            });

            this.socket.on('disconnect', () => {
                console.log('❌ Disconnected from server');
                this.showNotification('Disconnected from server', 'error');
            });

            // Real match found from backend
            this.socket.on('match-found', (data) => {
                console.log('🎉 REAL match found!', data);
                this.handleRealMatchFound(data);
            });

            // WebRTC signaling events
            this.socket.on('offer', async (data) => {
                console.log('📞 Received offer from peer');
                await this.handleOffer(data);
            });

            this.socket.on('answer', async (data) => {
                console.log('✅ Received answer from peer');
                await this.handleAnswer(data);
            });

            this.socket.on('ice-candidate', async (data) => {
                console.log('🧊 Received ICE candidate');
                await this.handleIceCandidate(data);
            });

            this.socket.on('partner-disconnected', () => {
                console.log('👋 Partner disconnected');
                this.handlePartnerDisconnected();
            });

            this.socket.on('waiting-for-match', () => {
                console.log('⏳ Waiting for match...');
                this.updateSearchStatus('Searching for someone awesome...');
            });

        } catch (error) {
            console.error('❌ Socket connection failed:', error);
            this.showNotification('Failed to connect to server', 'error');
        }
    }

    // Cache DOM elements
    cacheElements() {
        this.elements.landingPage = document.getElementById('landingPage');
        this.elements.hobbySelection = document.getElementById('hobbySelection');
        this.elements.loadingScreen = document.getElementById('loadingScreen');
        this.elements.chatScreen = document.getElementById('chatScreen');
        this.elements.getStartedBtn = document.getElementById('getStartedBtn');
        this.elements.hobbyCards = document.querySelectorAll('.hobby-card');
        this.elements.loadingText = document.getElementById('loadingText');
        this.elements.connectionInfo = document.getElementById('connectionInfo');
        this.elements.hobbyName = document.getElementById('hobbyName');
        this.elements.countryInfo = document.getElementById('countryInfo');
        this.elements.nextBtn = document.getElementById('nextBtn');
        this.elements.muteBtn = document.getElementById('muteBtn');
        this.elements.reportBtn = document.getElementById('reportBtn');
        this.elements.selfVideo = document.getElementById('selfVideo');
        this.elements.strangerVideo = document.getElementById('strangerVideo');
    }

    // Set up all event listeners
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

        // Chat controls
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
    }

    // Request real camera and microphone access
    async requestMediaAccess() {
        try {
            console.log('🎥 Requesting camera and microphone access...');
            
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };

            this.state.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Show local video in self video element
            const selfVideoElement = this.createVideoElement();
            selfVideoElement.srcObject = this.state.localStream;
            selfVideoElement.muted = true; // Prevent echo
            
            // Replace placeholder with real video
            const selfVideoContainer = this.elements.selfVideo;
            selfVideoContainer.innerHTML = '';
            selfVideoContainer.appendChild(selfVideoElement);
            
            console.log('✅ Camera and microphone access granted!');
            return true;
            
        } catch (error) {
            console.error('❌ Media access denied:', error);
            
            let errorMessage = 'Camera and microphone access is required for video chat.';
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Permission denied. Please enable camera and microphone access.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No camera or microphone found. Please check your devices.';
            }
            
            this.showNotification(errorMessage, 'error');
            return false;
        }
    }

    // Create video element with proper styling
    createVideoElement() {
        const video = document.createElement('video');
        video.autoplay = true;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.borderRadius = '15px';
        return video;
    }

    // Initialize WebRTC peer connection
    async initializePeerConnection() {
        try {
            this.state.peerConnection = new RTCPeerConnection(this.rtcConfig);
            
            // Add local stream to peer connection
            if (this.state.localStream) {
                this.state.localStream.getTracks().forEach(track => {
                    this.state.peerConnection.addTrack(track, this.state.localStream);
                });
            }

            // Handle incoming stream
            this.state.peerConnection.ontrack = (event) => {
                console.log('🎬 Received remote stream');
                const [remoteStream] = event.streams;
                this.state.remoteStream = remoteStream;
                
                // Display remote video
                const remoteVideoElement = this.createVideoElement();
                remoteVideoElement.srcObject = remoteStream;
                
                const strangerVideoContainer = this.elements.strangerVideo;
                strangerVideoContainer.innerHTML = '';
                strangerVideoContainer.appendChild(remoteVideoElement);
            };

            // Handle ICE candidates
            this.state.peerConnection.onicecandidate = (event) => {
                if (event.candidate && this.socket) {
                    console.log('🧊 Sending ICE candidate');
                    this.socket.emit('ice-candidate', {
                        candidate: event.candidate
                    });
                }
            };

            // Handle connection state changes
            this.state.peerConnection.onconnectionstatechange = () => {
                console.log('🔗 Connection state:', this.state.peerConnection.connectionState);
                
                if (this.state.peerConnection.connectionState === 'connected') {
                    this.showNotification('Video chat connected!', 'success');
                } else if (this.state.peerConnection.connectionState === 'disconnected') {
                    this.showNotification('Partner disconnected', 'info');
                }
            };

            console.log('🔗 Peer connection initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize peer connection:', error);
            this.showNotification('Failed to initialize video connection', 'error');
        }
    }

    // Handle view switching
    showView(viewName) {
        console.log(`🎯 Switching to view: ${viewName}`);
        
        const views = ['landingPage', 'hobbySelection', 'loadingScreen', 'chatScreen'];
        views.forEach(view => {
            const element = this.elements[view];
            if (element) {
                element.style.display = 'none';
            }
        });

        const targetView = this.elements[viewName];
        if (targetView) {
            targetView.style.display = 'flex';
        }

        this.state.currentView = viewName;
    }

    // Handle get started click
    handleGetStarted() {
        console.log('🚀 Get Started clicked!');
        this.showView('hobbySelection');
    }

    // Handle hobby selection
    async handleHobbySelection(card) {
        const hobbyId = card.dataset.hobby;
        const hobby = this.hobbies.find(h => h.id === hobbyId);
        
        if (!hobby) return;

        console.log(`🎯 Selected hobby: ${hobby.name}`);

        // Remove previous selection
        this.elements.hobbyCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        this.state.selectedHobby = hobby;

        // Request camera access before starting search
        const mediaGranted = await this.requestMediaAccess();
        if (!mediaGranted) {
            return; // Don't proceed if camera access denied
        }

        // Start real search
        setTimeout(() => {
            this.startRealSearch();
        }, 1000);
    }

    // Start real search for users with same hobby
    async startRealSearch() {
        console.log(`🔍 Starting REAL search for ${this.state.selectedHobby.name} enthusiasts...`);
        
        // Update loading text
        if (this.elements.loadingText) {
            this.elements.loadingText.textContent = 
                `🔍 Searching for someone who loves ${this.state.selectedHobby.name}… Please wait 🌍✨`;
        }

        // Show loading screen
        this.showView('loadingScreen');

        // Send hobby preference to backend
        if (this.socket && this.socket.connected) {
            this.socket.emit('set-hobby-preference', this.state.selectedHobby.id);
            this.socket.emit('find-match');
        } else {
            console.error('❌ Socket not connected');
            this.showNotification('Connection to server lost', 'error');
        }
    }

    // Handle real match found from backend
    async handleRealMatchFound(matchData) {
        console.log('🎉 REAL match found!', matchData);
        
        this.state.currentStranger = {
            country: matchData.partner.country,
            countryCode: matchData.partner.countryCode,
            flag: matchData.partner.flag,
            hobby: matchData.partner.hobby,
            roomId: matchData.roomId
        };

        // Initialize peer connection
        await this.initializePeerConnection();

        // Update connection info
        this.updateConnectionInfo();
        
        // Show chat screen
        this.showView('chatScreen');
        
        // Show celebration
        this.showConnectionCelebration();
        
        // Create and send offer (caller)
        await this.createAndSendOffer();
    }

    // Create and send WebRTC offer
    async createAndSendOffer() {
        try {
            const offer = await this.state.peerConnection.createOffer();
            await this.state.peerConnection.setLocalDescription(offer);
            
            console.log('📞 Sending offer to peer');
            this.socket.emit('offer', {
                offer: offer,
                roomId: this.state.currentStranger.roomId
            });
            
        } catch (error) {
            console.error('❌ Failed to create offer:', error);
        }
    }

    // Handle incoming WebRTC offer
    async handleOffer(data) {
        try {
            if (!this.state.peerConnection) {
                await this.initializePeerConnection();
            }
            
            await this.state.peerConnection.setRemoteDescription(data.offer);
            
            const answer = await this.state.peerConnection.createAnswer();
            await this.state.peerConnection.setLocalDescription(answer);
            
            console.log('📞 Sending answer to peer');
            this.socket.emit('answer', {
                answer: answer
            });
            
        } catch (error) {
            console.error('❌ Failed to handle offer:', error);
        }
    }

    // Handle incoming WebRTC answer
    async handleAnswer(data) {
        try {
            await this.state.peerConnection.setRemoteDescription(data.answer);
            console.log('✅ Answer set successfully');
            
        } catch (error) {
            console.error('❌ Failed to handle answer:', error);
        }
    }

    // Handle incoming ICE candidate
    async handleIceCandidate(data) {
        try {
            await this.state.peerConnection.addIceCandidate(data.candidate);
            console.log('🧊 ICE candidate added');
            
        } catch (error) {
            console.error('❌ Failed to add ICE candidate:', error);
        }
    }

    // Update connection info display
    updateConnectionInfo() {
        if (this.elements.hobbyName) {
            this.elements.hobbyName.textContent = this.state.selectedHobby.name;
        }
        
        if (this.elements.countryInfo && this.state.currentStranger) {
            this.elements.countryInfo.textContent = 
                `${this.state.currentStranger.flag} ${this.state.currentStranger.country}`;
        }
    }

    // Handle next stranger
    handleNextStranger() {
        console.log('➡️ Finding next stranger...');
        
        // Close current connection
        this.closePeerConnection();
        
        // Request new match
        if (this.socket && this.socket.connected) {
            this.socket.emit('next-stranger');
            this.startRealSearch();
        }
    }

    // Handle mute toggle
    handleMuteToggle() {
        if (this.state.localStream) {
            const audioTracks = this.state.localStream.getAudioTracks();
            const isMuted = !audioTracks[0]?.enabled;
            
            audioTracks.forEach(track => {
                track.enabled = isMuted;
            });
            
            this.state.isMuted = !isMuted;
            
            const muteBtn = this.elements.muteBtn;
            const icon = muteBtn.querySelector('.btn-icon');
            const text = muteBtn.querySelector('.btn-text');
            
            if (this.state.isMuted) {
                icon.textContent = '🔇';
                text.textContent = 'Unmute';
            } else {
                icon.textContent = '🔊';
                text.textContent = 'Mute';
            }
            
            console.log(`🔊 Audio ${this.state.isMuted ? 'muted' : 'unmuted'}`);
        }
    }

    // Handle report user
    handleReportUser() {
        console.log('⚠️ Reporting user...');
        
        if (this.socket && this.state.currentStranger) {
            this.socket.emit('report-user', {
                reportedUser: this.state.currentStranger.roomId,
                reason: 'inappropriate_behavior'
            });
            
            this.showNotification('User reported. Thank you for keeping our community safe.', 'success');
            this.handleNextStranger();
        }
    }

    // Handle partner disconnected
    handlePartnerDisconnected() {
        this.showNotification('Partner disconnected. Finding new match...', 'info');
        this.closePeerConnection();
        this.startRealSearch();
    }

    // Close peer connection
    closePeerConnection() {
        if (this.state.peerConnection) {
            this.state.peerConnection.close();
            this.state.peerConnection = null;
        }
        
        if (this.state.remoteStream) {
            this.state.remoteStream.getTracks().forEach(track => track.stop());
            this.state.remoteStream = null;
        }
    }

    // Show connection celebration
    showConnectionCelebration() {
        const message = `🎉 Connected with someone who loves ${this.state.selectedHobby.name} from ${this.state.currentStranger.country}! 🌍✨`;
        
        const celebration = document.createElement('div');
        celebration.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); display: flex; align-items: center;
            justify-content: center; z-index: 1500; animation: fadeIn 0.5s ease-out;
        `;
        
        celebration.innerHTML = `
            <div style="background: rgba(0, 0, 0, 0.9); border: 2px solid #00ffff; 
                 border-radius: 20px; padding: 3rem; text-align: center; max-width: 500px;">
                <div style="font-size: 1.5rem; color: white; margin-bottom: 1rem;">${message}</div>
                <div style="font-size: 2rem;">🎉✨🚀💫</div>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            document.body.removeChild(celebration);
        }, 3000);
    }

    // Update search status
    updateSearchStatus(message) {
        if (this.elements.loadingText) {
            this.elements.loadingText.textContent = message;
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: '#00ff41',
            error: '#ff4444',
            info: '#00ffff'
        };
        
        notification.style.cssText = `
            position: fixed; top: 2rem; right: 2rem; z-index: 2000;
            background: rgba(0, 0, 0, 0.9); color: white; padding: 1rem 1.5rem;
            border-radius: 10px; border: 1px solid ${colors[type]};
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: slideIn 0.3s ease-out; max-width: 300px; font-size: 0.9rem;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 5000);
    }

    // Cleanup on page unload
    cleanup() {
        if (this.state.localStream) {
            this.state.localStream.getTracks().forEach(track => track.stop());
        }
        
        this.closePeerConnection();
        
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
`;
document.head.appendChild(style);

// Initialize the real application
window.strangerFaceApp = new StrangerFaceApp();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.strangerFaceApp) {
        window.strangerFaceApp.cleanup();
    }
});
