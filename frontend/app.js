/**
 * Stranger Face - WebRTC Video Chat with ICE-Synchronized Remote Video
 * Fixes: readyState 0 issue, autoplay restrictions, timing problems
 */

class StrangerFaceApp {
    constructor() {
        console.log('🚀 Initializing Stranger Face with ICE-Sync Video...');
        
        this.state = {
            currentView: 'landing',
            selectedHobby: null,
            localStream: null,
            remoteStream: null,
            peerConnection: null,
            socket: null,
            sessionStartTime: null,
            isMuted: false,
            currentStranger: null
        };

        // Will be filled from /ice endpoint
        this.rtcConfig = { iceServers: [] };
        this.queuedIceCandidates = [];
        
        // Critical state tracking
        this.iceConnected = false;
        this.remoteVideoElement = null;
        this.relayFallbackTimer = null;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        console.log('🎌 Starting REAL WebRTC with ICE-Sync...');
        this.cacheElements();
        await this.initializeSocket();
        this.setupEventListeners();
        this.showView('landing');
        console.log('✅ Stranger Face ready with enhanced video handling!');
    }

    cacheElements() {
        this.elements = {
            landingPage: document.getElementById('landingPage'),
            hobbySelection: document.getElementById('hobbySelection'),
            loadingScreen: document.getElementById('loadingScreen'),
            chatScreen: document.getElementById('chatScreen'),
            getStartedBtn: document.getElementById('getStartedBtn'),
            hobbyCards: document.querySelectorAll('.hobby-card'),
            loadingText: document.getElementById('loadingText'),
            hobbyName: document.getElementById('hobbyName'),
            countryInfo: document.getElementById('countryInfo'),
            nextBtn: document.getElementById('nextBtn'),
            muteBtn: document.getElementById('muteBtn'),
            reportBtn: document.getElementById('reportBtn'),
            selfVideo: document.getElementById('selfVideo'),
            strangerVideo: document.getElementById('strangerVideo'),
            sessionTime: document.getElementById('sessionTime'),
            emojiButtons: document.querySelectorAll('.emoji-btn')
        };
    }

    async initializeSocket() {
        try {
            console.log('🔌 Connecting to backend...');
            this.socket = io('https://stranger-face-backend.onrender.com', {
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            this.socket.on('connect', () => {
                console.log('✅ Connected to backend server!');
                this.showNotification('Connected to server', 'success');
            });

            this.socket.on('disconnect', (reason) => {
                console.log('❌ Disconnected:', reason);
                this.showNotification('Disconnected from server', 'error');
            });

            this.socket.on('waiting-for-match', () => {
                this.updateSearchStatus('Searching for someone awesome...');
            });

            this.socket.on('match-found', (data) => {
                console.log('🎉 Match found!', data);
                this.handleRealMatchFound(data);
            });

            // WebRTC signaling events
            this.socket.on('offer', (data) => this.handleOffer(data));
            this.socket.on('answer', (data) => this.handleAnswer(data));
            this.socket.on('ice-candidate', (data) => this.handleIceCandidate(data));
            this.socket.on('partner-disconnected', () => this.handlePartnerDisconnected());
            this.socket.on('error', (error) => {
                console.error('❌ Socket error:', error);
                this.showNotification(error.message || 'Server error', 'error');
            });

        } catch (error) {
            console.error('❌ Socket initialization failed:', error);
            this.showNotification('Failed to connect to server', 'error');
        }
    }

    setupEventListeners() {
        // Get Started
        this.elements.getStartedBtn?.addEventListener('click', () => {
            console.log('🚀 Get Started clicked!');
            this.showView('hobbySelection');
        });

        // Hobby selection
        this.elements.hobbyCards.forEach(card => {
            card.addEventListener('click', async () => {
                const hobbyId = card.dataset.hobby;
                const hobbyName = card.textContent?.trim() || hobbyId;
                
                console.log(`🎯 Selected hobby: ${hobbyName}`);

                // Visual feedback
                this.elements.hobbyCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                this.state.selectedHobby = { id: hobbyId, name: hobbyName };

                // Request media access
                const mediaGranted = await this.requestMediaAccess();
                if (!mediaGranted) {
                    card.classList.remove('selected');
                    this.state.selectedHobby = null;
                    return;
                }

                // Start search
                setTimeout(() => this.startRealSearch(), 800);
            });
        });

        // Controls
        this.elements.nextBtn?.addEventListener('click', () => this.handleNextStranger());
        this.elements.muteBtn?.addEventListener('click', () => this.handleMuteToggle());
        this.elements.reportBtn?.addEventListener('click', () => this.handleReportUser());
        
        // Emoji reactions
        this.elements.emojiButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.dataset.emoji;
                this.sendEmojiReaction(emoji);
            });
        });
    }

    async requestMediaAccess() {
        try {
            console.log('🎥 Requesting camera and microphone...');
            
            const constraints = {
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    facingMode: 'user',
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000
                }
            };

            this.state.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Display local video
            const localVideo = document.createElement('video');
            localVideo.autoplay = true;
            localVideo.playsInline = true;
            localVideo.muted = true; // Prevent echo
            localVideo.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;background:#000;';
            localVideo.srcObject = this.state.localStream;
            
            this.elements.selfVideo.innerHTML = '';
            this.elements.selfVideo.appendChild(localVideo);
            
            console.log('✅ Camera and microphone ready!');
            this.showNotification('Camera ready!', 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Media access denied:', error);
            let message = 'Camera access required for video chat';
            if (error.name === 'NotAllowedError') {
                message = 'Please allow camera access and refresh';
            }
            this.showNotification(message, 'error');
            return false;
        }
    }

    // Fetch ICE servers from backend (uses Xirsys TURN)
    async fetchIceServers() {
        try {
            console.log('🧊 Fetching TURN servers from backend...');
            const response = await fetch('/ice');
            if (!response.ok) throw new Error('ICE fetch failed');
            
            const data = await response.json();
            this.rtcConfig.iceServers = data.iceServers || [{ urls: 'stun:stun.l.google.com:19302' }];
            console.log(`✅ Got ${this.rtcConfig.iceServers.length} ICE servers (includes TURN)`);
            
        } catch (error) {
            console.error('❌ ICE server fetch failed:', error);
            // Fallback to STUN only
            this.rtcConfig.iceServers = [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ];
        }
    }

    // Initialize peer connection with ICE-synchronized video attachment
    async initializePeerConnection(forceRelay = false) {
        try {
            console.log('🔗 Initializing peer connection...');
            
            // Fetch ICE servers if not already done
            if (!this.rtcConfig.iceServers?.length) {
                await this.fetchIceServers();
            }

            // Create peer connection with optional relay-only mode
            const config = {
                ...this.rtcConfig,
                iceTransportPolicy: forceRelay ? 'relay' : 'all'
            };
            
            this.state.peerConnection = new RTCPeerConnection(config);
            const pc = this.state.peerConnection;
            
            // Reset state
            this.iceConnected = false;
            this.remoteVideoElement = null;

            // CRITICAL: ICE connection state handler - only attach video when ICE is ready
            pc.oniceconnectionstatechange = () => {
                const state = pc.iceConnectionState;
                console.log('🧊 ICE connection state:', state);
                
                if (state === 'connected' || state === 'completed') {
                    console.log('✅ ICE connection established!');
                    this.iceConnected = true;
                    
                    // Cancel relay fallback timer
                    if (this.relayFallbackTimer) {
                        clearTimeout(this.relayFallbackTimer);
                        this.relayFallbackTimer = null;
                    }
                    
                    // Try to play remote video if stream is ready
                    if (this.state.remoteStream && this.remoteVideoElement) {
                        console.log('🎥 ICE ready - attempting video playback...');
                        this.attachAndPlayRemoteVideo();
                    }
                    
                } else if (state === 'failed') {
                    console.log('❌ ICE connection failed');
                    this.showNotification('Connection failed', 'error');
                } else if (state === 'disconnected') {
                    console.log('⚠️ ICE disconnected');
                    this.iceConnected = false;
                }
            };

            // CRITICAL: ontrack handler - collect stream but don't play until ICE ready
            pc.ontrack = (event) => {
                console.log('📥 Remote stream received!');
                console.log('📥 Track kind:', event.track.kind);
                console.log('📥 Track state:', event.track.readyState);
                
                const [remoteStream] = event.streams;
                this.state.remoteStream = remoteStream;
                
                // Log stream details
                const videoTracks = remoteStream.getVideoTracks();
                const audioTracks = remoteStream.getAudioTracks();
                console.log(`📊 Remote stream: ${videoTracks.length} video, ${audioTracks.length} audio tracks`);
                
                // Create video element if not exists
                if (!this.remoteVideoElement) {
                    console.log('🎥 Creating remote video element...');
                    this.remoteVideoElement = document.createElement('video');
                    this.remoteVideoElement.autoplay = true;
                    this.remoteVideoElement.playsInline = true;
                    this.remoteVideoElement.controls = false;
                    this.remoteVideoElement.muted = false; // Allow audio
                    this.remoteVideoElement.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:15px;background:#000;';
                    
                    // Enhanced event logging
                    this.remoteVideoElement.onloadedmetadata = () => {
                        console.log('🎥 Remote video metadata loaded');
                        console.log(`🎥 Dimensions: ${this.remoteVideoElement.videoWidth}x${this.remoteVideoElement.videoHeight}`);
                    };
                    
                    this.remoteVideoElement.oncanplay = () => {
                        console.log('🎥 Remote video can play');
                    };
                    
                    this.remoteVideoElement.onplaying = () => {
                        console.log('✅ Remote video is now playing!');
                        this.showNotification('Remote video connected!', 'success');
                    };
                    
                    this.remoteVideoElement.onwaiting = () => {
                        console.log('⏳ Remote video waiting for data');
                    };
                    
                    this.remoteVideoElement.onerror = (e) => {
                        console.error('❌ Remote video error:', e);
                    };
                    
                    // Add to container
                    this.elements.strangerVideo.innerHTML = '';
                    this.elements.strangerVideo.appendChild(this.remoteVideoElement);
                }
                
                // CRITICAL: Only attach and play if ICE is ready
                if (this.iceConnected) {
                    console.log('🎥 ICE already ready - attaching stream immediately');
                    this.attachAndPlayRemoteVideo();
                } else {
                    console.log('⏳ ICE not ready yet - will attach stream when ICE connects');
                }
                
                // Process queued ICE candidates
                this.processQueuedIceCandidates();
            };

            // Add local tracks
            if (this.state.localStream) {
                console.log('📤 Adding local tracks...');
                this.state.localStream.getTracks().forEach(track => {
                    console.log(`📤 Adding ${track.kind} track`);
                    pc.addTrack(track, this.state.localStream);
                });
            }

            // ICE candidate handler
            pc.onicecandidate = (event) => {
                if (event.candidate && this.socket) {
                    console.log('🧊 Sending ICE candidate');
                    this.socket.emit('ice-candidate', { candidate: event.candidate });
                } else if (!event.candidate) {
                    console.log('🧊 ICE gathering completed');
                }
            };

            // Connection state handler
            pc.onconnectionstatechange = () => {
                const state = pc.connectionState;
                console.log('🔗 Connection state:', state);
                
                switch (state) {
                    case 'connecting':
                        this.showNotification('Connecting...', 'info');
                        break;
                    case 'connected':
                        console.log('🎉 WebRTC connection established!');
                        this.showNotification('Video chat connected!', 'success');
                        this.startSessionTimer();
                        break;
                    case 'disconnected':
                        this.showNotification('Peer disconnected', 'info');
                        break;
                    case 'failed':
                        this.showNotification('Connection failed', 'error');
                        break;
                }
            };

            // Set up relay fallback timer (7 seconds)
            if (!forceRelay) {
                this.relayFallbackTimer = setTimeout(async () => {
                    if (!this.iceConnected) {
                        console.log('⚡ Relay fallback: ICE not connected, trying TURN-only...');
                        try {
                            pc.close();
                        } catch (e) {}
                        await this.initializePeerConnection(true);
                        await this.createAndSendOffer();
                    }
                }, 7000);
            }

            console.log('✅ Peer connection initialized with ICE-sync video');
            
        } catch (error) {
            console.error('❌ Peer connection initialization failed:', error);
            this.showNotification('Failed to initialize connection', 'error');
        }
    }

    // CRITICAL: Attach stream and play video (only called when ICE is ready)
    async attachAndPlayRemoteVideo() {
        if (!this.remoteVideoElement || !this.state.remoteStream) {
            console.log('⚠️ Cannot attach video - element or stream missing');
            return;
        }

        try {
            console.log('🔗 Attaching remote stream to video element...');
            this.remoteVideoElement.srcObject = this.state.remoteStream;
            
            // Robust play with fallback to muted
            await this.playVideoWithFallback(this.remoteVideoElement);
            
        } catch (error) {
            console.error('❌ Failed to attach remote stream:', error);
        }
    }

    // Robust video play with muted fallback
    async playVideoWithFallback(videoElement) {
        try {
            console.log('▶️ Attempting to play remote video...');
            console.log(`📊 Video state: readyState=${videoElement.readyState}, networkState=${videoElement.networkState}`);
            
            await videoElement.play();
            console.log('✅ Remote video playing successfully!');
            
        } catch (error) {
            console.log('⚠️ First play attempt failed, trying muted playback:', error.message);
            
            try {
                // Fallback: muted autoplay
                videoElement.muted = true;
                await videoElement.play();
                console.log('✅ Remote video playing (muted)');
                
                // Unmute after 2 seconds
                setTimeout(() => {
                    videoElement.muted = false;
                    console.log('🔊 Unmuted remote video');
                }, 2000);
                
            } catch (mutedError) {
                console.error('❌ Even muted playback failed:', mutedError.message);
                
                // Last resort: reload the element
                try {
                    videoElement.load();
                    console.log('🔄 Reloaded video element');
                } catch (loadError) {
                    console.error('❌ Video element reload failed:', loadError);
                }
            }
        }
    }

    async startRealSearch() {
        console.log(`🔍 Searching for ${this.state.selectedHobby.name} enthusiasts...`);
        
        if (this.elements.loadingText) {
            this.elements.loadingText.textContent = 
                `🔍 Searching for ${this.state.selectedHobby.name} fans... 🌍✨`;
        }

        this.showView('loadingScreen');

        if (this.socket) {
            this.socket.emit('set-hobby-preference', this.state.selectedHobby.id);
            this.socket.emit('find-match');
        }
    }

    async handleRealMatchFound(matchData) {
        console.log('🎉 Real match found!', matchData);
        
        this.state.currentStranger = {
            country: matchData.partner.country || 'Unknown',
            flag: matchData.partner.flag || '🌍',
            hobby: matchData.partner.hobby || this.state.selectedHobby.id,
            roomId: matchData.roomId
        };

        // Initialize peer connection
        await this.initializePeerConnection();

        // Update UI
        this.updateConnectionInfo();
        this.showView('chatScreen');
        this.showConnectionCelebration();
        
        // Create offer after delay
        setTimeout(() => this.createAndSendOffer(), 1000);
    }

    async createAndSendOffer() {
        try {
            console.log('📞 Creating offer...');
            
            const offer = await this.state.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            
            await this.state.peerConnection.setLocalDescription(offer);
            
            console.log('📤 Sending offer');
            this.socket.emit('offer', { offer });
            
        } catch (error) {
            console.error('❌ Failed to create offer:', error);
        }
    }

    async handleOffer(data) {
        try {
            console.log('📞 Handling offer...');
            
            if (!this.state.peerConnection) {
                await this.initializePeerConnection();
            }

            const pc = this.state.peerConnection;
            
            // Handle signaling state
            if (pc.signalingState === 'have-local-offer') {
                console.log('🔄 Rolling back local offer...');
                await pc.setLocalDescription({ type: 'rollback' });
            }
            
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            
            if (pc.signalingState === 'have-remote-offer') {
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                
                console.log('📤 Sending answer');
                this.socket.emit('answer', { answer });
            }
            
        } catch (error) {
            console.error('❌ Failed to handle offer:', error);
        }
    }

    async handleAnswer(data) {
        try {
            console.log('✅ Handling answer...');
            
            const pc = this.state.peerConnection;
            if (!pc || pc.signalingState === 'stable') return;
            
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            console.log('✅ Answer processed');
            
        } catch (error) {
            console.error('❌ Failed to handle answer:', error);
        }
    }

    async handleIceCandidate(data) {
        try {
            const pc = this.state.peerConnection;
            if (!pc) return;
            
            if (pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                console.log('🧊 ICE candidate added');
            } else {
                console.log('⏳ Queueing ICE candidate');
                this.queuedIceCandidates.push(data.candidate);
            }
            
        } catch (error) {
            console.error('❌ Failed to add ICE candidate:', error);
        }
    }

    async processQueuedIceCandidates() {
        const pc = this.state.peerConnection;
        if (!pc?.remoteDescription || !this.queuedIceCandidates.length) return;
        
        console.log(`🧊 Processing ${this.queuedIceCandidates.length} queued ICE candidates`);
        
        while (this.queuedIceCandidates.length > 0) {
            const candidate = this.queuedIceCandidates.shift();
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('❌ Failed to add queued ICE candidate:', error);
            }
        }
    }

    updateConnectionInfo() {
        if (this.elements.hobbyName && this.state.selectedHobby) {
            this.elements.hobbyName.textContent = this.state.selectedHobby.name;
        }
        if (this.elements.countryInfo && this.state.currentStranger) {
            this.elements.countryInfo.textContent = 
                `${this.state.currentStranger.flag} ${this.state.currentStranger.country}`;
        }
    }

    handleNextStranger() {
        console.log('➡️ Finding next stranger...');
        this.closePeerConnection();
        this.stopSessionTimer();
        this.socket?.emit('next-stranger');
    }

    handleMuteToggle() {
        const audioTracks = this.state.localStream?.getAudioTracks() || [];
        audioTracks.forEach(track => track.enabled = !track.enabled);
        this.state.isMuted = audioTracks.length ? !audioTracks[0].enabled : false;
        
        const muteBtn = this.elements.muteBtn;
        if (muteBtn) {
            const icon = muteBtn.querySelector('.btn-icon');
            const text = muteBtn.querySelector('.btn-text');
            if (icon) icon.textContent = this.state.isMuted ? '🔇' : '🔊';
            if (text) text.textContent = this.state.isMuted ? 'Unmute' : 'Mute';
        }
        
        console.log(`🔊 Audio ${this.state.isMuted ? 'muted' : 'unmuted'}`);
    }

    handleReportUser() {
        console.log('⚠️ User reported');
        this.showNotification('User reported. Thank you!', 'success');
        setTimeout(() => this.handleNextStranger(), 1000);
    }

    sendEmojiReaction(emoji) {
        console.log(`💫 Sending emoji: ${emoji}`);
        this.createFloatingEmoji(emoji);
    }

    createFloatingEmoji(emoji) {
        const container = document.getElementById('emojiReactions') || document.body;
        const emojiElement = document.createElement('div');
        emojiElement.textContent = emoji;
        emojiElement.style.cssText = `
            position: absolute;
            font-size: 2rem;
            pointer-events: none;
            z-index: 1000;
            animation: emoji-float 3s ease-out forwards;
            left: ${Math.random() * window.innerWidth}px;
            bottom: 20%;
        `;
        
        container.appendChild(emojiElement);
        setTimeout(() => container.removeChild(emojiElement), 3000);
    }

    handlePartnerDisconnected() {
        this.showNotification('Partner disconnected', 'info');
        this.closePeerConnection();
        setTimeout(() => this.startRealSearch(), 1000);
    }

    closePeerConnection() {
        try {
            if (this.state.peerConnection) {
                this.state.peerConnection.close();
                this.state.peerConnection = null;
            }
        } catch (e) {}
        
        if (this.relayFallbackTimer) {
            clearTimeout(this.relayFallbackTimer);
            this.relayFallbackTimer = null;
        }
        
        this.iceConnected = false;
        this.remoteVideoElement = null;
        this.state.remoteStream = null;
        this.queuedIceCandidates = [];
        
        // Reset video container
        if (this.elements.strangerVideo) {
            this.elements.strangerVideo.innerHTML = `
                <div class="video-placeholder">
                    <div class="placeholder-icon">🎥</div>
                    <div class="placeholder-text">Connecting...</div>
                </div>
            `;
        }
    }

    startSessionTimer() {
        this.state.sessionStartTime = Date.now();
        this.sessionTimer = setInterval(() => {
            if (!this.state.sessionStartTime) return;
            
            const elapsed = Date.now() - this.state.sessionStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.elements.sessionTime) {
                this.elements.sessionTime.textContent = timeString;
            }
        }, 1000);
    }

    stopSessionTimer() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
        this.state.sessionStartTime = null;
        if (this.elements.sessionTime) {
            this.elements.sessionTime.textContent = '00:00';
        }
    }

    showConnectionCelebration() {
        const hobbyName = this.state.selectedHobby?.name || 'your hobby';
        const country = this.state.currentStranger?.country || 'somewhere';
        const message = `🎉 Connected with someone who loves ${hobbyName} from ${country}! Say hello! 👋`;
        
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
                <div style="font-size: 2rem;">🎉✨🚀💫🌸</div>
            </div>
        `;
        
        document.body.appendChild(celebration);
        setTimeout(() => {
            celebration.style.opacity = '0';
            setTimeout(() => document.body.removeChild(celebration), 500);
        }, 3000);
    }

    showView(name) {
        ['landingPage', 'hobbySelection', 'loadingScreen', 'chatScreen'].forEach(view => {
            const element = this.elements[view];
            if (element) element.style.display = 'none';
        });
        
        const targetView = this.elements[name];
        if (targetView) targetView.style.display = 'flex';
        this.state.currentView = name;
    }

    updateSearchStatus(message) {
        if (this.elements.loadingText) {
            this.elements.loadingText.textContent = message;
        }
    }

    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        const colors = { success: '#00ff41', error: '#ff4444', info: '#00ffff' };
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 2rem; right: 2rem; z-index: 2000;
            background: rgba(0, 0, 0, 0.9); color: white; padding: 1rem 1.5rem;
            border-radius: 10px; border: 1px solid ${colors[type]};
            max-width: 300px; font-size: 0.9rem;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 4000);
    }
}

// Add required CSS animations
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes emoji-float {
    0% { transform: translateY(0) scale(0.8); opacity: 1; }
    50% { transform: translateY(-200px) scale(1.2); opacity: 1; }
    100% { transform: translateY(-400px) scale(0.6); opacity: 0; }
}
`;
document.head.appendChild(style);

// Initialize the application
console.log('🚀 Starting Stranger Face with ICE-Synchronized Video...');
window.strangerFaceApp = new StrangerFaceApp();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.strangerFaceApp) {
        try {
            window.strangerFaceApp.closePeerConnection();
            if (window.strangerFaceApp.state.localStream) {
                window.strangerFaceApp.state.localStream.getTracks().forEach(track => track.stop());
            }
        } catch (e) {}
    }
});
