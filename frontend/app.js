/**
 * Stranger Face - WebRTC with ICE-Synchronized Video + Autoplay Handling
 * Fixes: Browser autoplay restrictions, premature video attachment, timing issues
 */

class StrangerFaceApp {
    constructor() {
        console.log('🚀 Initializing Stranger Face with ICE-Sync + Autoplay Fix...');
        
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

        // WebRTC configuration
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        this.queuedIceCandidates = [];
        
        // CRITICAL: Track ICE and video states separately
        this.iceConnectionReady = false;
        this.remoteVideoElement = null;
        this.videoAttachmentAttempted = false;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        console.log('🎌 Starting with ICE-synchronized video...');
        this.cacheElements();
        await this.initializeSocket();
        this.setupEventListeners();
        this.showView('landing');
        console.log('✅ Ready with autoplay fix!');
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
                reconnection: true
            });

            this.socket.on('connect', () => {
                console.log('✅ Connected to backend!');
                this.showNotification('Connected to server', 'success');
            });

            this.socket.on('waiting-for-match', () => {
                this.updateSearchStatus('Searching...');
            });

            this.socket.on('match-found', (data) => {
                console.log('🎉 Match found!', data);
                this.handleRealMatchFound(data);
            });

            // WebRTC signaling
            this.socket.on('offer', (data) => this.handleOffer(data));
            this.socket.on('answer', (data) => this.handleAnswer(data));
            this.socket.on('ice-candidate', (data) => this.handleIceCandidate(data));
            this.socket.on('partner-disconnected', () => this.handlePartnerDisconnected());

        } catch (error) {
            console.error('❌ Socket failed:', error);
        }
    }

    setupEventListeners() {
        this.elements.getStartedBtn?.addEventListener('click', () => {
            this.showView('hobbySelection');
        });

        this.elements.hobbyCards.forEach(card => {
            card.addEventListener('click', async () => {
                const hobbyId = card.dataset.hobby;
                const hobbyName = card.textContent?.trim() || hobbyId;
                
                console.log(`🎯 Selected hobby: ${hobbyName}`);

                this.elements.hobbyCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                this.state.selectedHobby = { id: hobbyId, name: hobbyName };

                const mediaGranted = await this.requestMediaAccess();
                if (!mediaGranted) {
                    card.classList.remove('selected');
                    this.state.selectedHobby = null;
                    return;
                }

                setTimeout(() => this.startRealSearch(), 800);
            });
        });

        this.elements.nextBtn?.addEventListener('click', () => this.handleNextStranger());
        this.elements.muteBtn?.addEventListener('click', () => this.handleMuteToggle());
        this.elements.reportBtn?.addEventListener('click', () => this.handleReportUser());
    }

    async requestMediaAccess() {
        try {
            console.log('🎥 Requesting media access...');
            
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            };

            this.state.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            const localVideo = document.createElement('video');
            localVideo.autoplay = true;
            localVideo.playsInline = true;
            localVideo.muted = true;
            localVideo.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
            localVideo.srcObject = this.state.localStream;
            
            this.elements.selfVideo.innerHTML = '';
            this.elements.selfVideo.appendChild(localVideo);
            
            console.log('✅ Media access granted!');
            return true;
            
        } catch (error) {
            console.error('❌ Media access denied:', error);
            this.showNotification('Camera access required', 'error');
            return false;
        }
    }

    // CRITICAL: Initialize peer connection with ICE-synchronized video attachment
    async initializePeerConnection() {
        try {
            console.log('🔗 Initializing peer connection with ICE sync...');
            
            this.state.peerConnection = new RTCPeerConnection(this.rtcConfig);
            const pc = this.state.peerConnection;
            
            // Reset state
            this.iceConnectionReady = false;
            this.remoteVideoElement = null;
            this.videoAttachmentAttempted = false;

            // CRITICAL: ICE connection state handler - WAIT for connection before video
            pc.oniceconnectionstatechange = () => {
                const state = pc.iceConnectionState;
                console.log('🧊 ICE connection state:', state);
                
                if (state === 'connected' || state === 'completed') {
                    console.log('✅ ICE CONNECTION READY - can now attach video!');
                    this.iceConnectionReady = true;
                    
                    // Try to attach video now that ICE is ready
                    this.tryAttachRemoteVideo();
                    
                } else if (state === 'failed') {
                    console.log('❌ ICE connection failed');
                    this.showNotification('Connection failed', 'error');
                } else if (state === 'disconnected') {
                    this.iceConnectionReady = false;
                }
            };

            // CRITICAL: ontrack handler - collect stream but DON'T attach until ICE ready
            pc.ontrack = (event) => {
                console.log('📥 Remote stream received!');
                console.log('📥 Track kind:', event.track.kind, 'enabled:', event.track.enabled);
                
                const [remoteStream] = event.streams;
                this.state.remoteStream = remoteStream;
                
                // Log stream details
                const videoTracks = remoteStream.getVideoTracks();
                const audioTracks = remoteStream.getAudioTracks();
                console.log(`📊 Stream: ${videoTracks.length} video, ${audioTracks.length} audio tracks`);
                
                // Create video element if not exists (but don't attach stream yet)
                if (!this.remoteVideoElement) {
                    console.log('🎥 Creating remote video element (but not attaching stream yet)...');
                    this.remoteVideoElement = this.createRemoteVideoElement();
                    
                    // Add to container
                    this.elements.strangerVideo.innerHTML = '';
                    this.elements.strangerVideo.appendChild(this.remoteVideoElement);
                }
                
                // Try to attach video if ICE is already ready
                this.tryAttachRemoteVideo();
                
                // Process queued ICE candidates
                this.processQueuedIceCandidates();
            };

            // Add local tracks
            if (this.state.localStream) {
                this.state.localStream.getTracks().forEach(track => {
                    pc.addTrack(track, this.state.localStream);
                });
            }

            // ICE candidate handler
            pc.onicecandidate = (event) => {
                if (event.candidate && this.socket) {
                    this.socket.emit('ice-candidate', { candidate: event.candidate });
                }
            };

            // Connection state handler
            pc.onconnectionstatechange = () => {
                const state = pc.connectionState;
                console.log('🔗 Connection state:', state);
                
                if (state === 'connected') {
                    this.showNotification('Video chat connected!', 'success');
                    this.startSessionTimer();
                }
            };

            console.log('✅ Peer connection initialized with ICE sync');
            
        } catch (error) {
            console.error('❌ Peer connection failed:', error);
        }
    }

    // Create video element with proper configuration for autoplay handling
    createRemoteVideoElement() {
        const video = document.createElement('video');
        video.autoplay = true;
        video.playsInline = true; // CRITICAL for mobile Safari
        video.controls = false;
        video.muted = true; // Start muted for autoplay compliance
        video.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:15px;background:#000;';
        
        // Enhanced event handlers
        video.onloadedmetadata = () => {
            console.log('🎥 Remote video metadata loaded');
            console.log(`🎥 Dimensions: ${video.videoWidth}x${video.videoHeight}`);
        };
        
        video.oncanplay = () => {
            console.log('🎥 Remote video can play');
        };
        
        video.onplaying = () => {
            console.log('✅ Remote video is playing!');
            this.showNotification('Remote video playing!', 'success');
            
            // Unmute after 2 seconds if playing successfully
            setTimeout(() => {
                if (!video.paused) {
                    video.muted = false;
                    console.log('🔊 Unmuted remote video');
                }
            }, 2000);
        };
        
        video.onwaiting = () => {
            console.log('⏳ Remote video waiting for data');
        };
        
        video.onerror = (e) => {
            console.error('❌ Remote video error:', e);
        };
        
        return video;
    }

    // CRITICAL: Only attach stream when BOTH conditions are met:
    // 1. ICE connection is ready (connected/completed)  
    // 2. Remote stream is available
    async tryAttachRemoteVideo() {
        if (!this.iceConnectionReady) {
            console.log('⏳ ICE not ready yet - waiting before attaching video');
            return;
        }
        
        if (!this.state.remoteStream) {
            console.log('⏳ Remote stream not available yet - waiting');
            return;
        }
        
        if (!this.remoteVideoElement) {
            console.log('⏳ Remote video element not created yet - waiting');
            return;
        }
        
        if (this.videoAttachmentAttempted) {
            console.log('📹 Video attachment already attempted');
            return;
        }

        console.log('🎬 CONDITIONS MET - Attaching remote stream and playing video!');
        this.videoAttachmentAttempted = true;
        
        try {
            // Attach stream
            this.remoteVideoElement.srcObject = this.state.remoteStream;
            console.log('🔗 Remote stream attached to video element');
            
            // Wait a moment for the stream to be processed
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Robust play with multiple attempts
            await this.playVideoWithRetry(this.remoteVideoElement);
            
        } catch (error) {
            console.error('❌ Failed to attach/play remote video:', error);
            this.showNotification('Video playback failed', 'error');
        }
    }

    // Robust video play with autoplay policy compliance
    async playVideoWithRetry(videoElement, maxRetries = 3) {
        console.log('▶️ Attempting to play video with retry logic...');
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🎮 Play attempt ${attempt}/${maxRetries}`);
                console.log(`📊 Video state: readyState=${videoElement.readyState}, paused=${videoElement.paused}`);
                
                // Ensure video is muted for autoplay compliance
                videoElement.muted = true;
                
                await videoElement.play();
                console.log('✅ Video playing successfully!');
                return; // Success!
                
            } catch (error) {
                console.log(`⚠️ Play attempt ${attempt} failed:`, error.message);
                
                if (attempt === maxRetries) {
                    console.error('❌ All play attempts failed');
                    
                    // Last resort: show user interaction prompt
                    this.showPlayButton();
                    return;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 500 * attempt));
            }
        }
    }

    // Show manual play button for user interaction (autoplay policy compliance)
    showPlayButton() {
        console.log('🎯 Showing manual play button for user interaction');
        
        const playButton = document.createElement('button');
        playButton.textContent = '▶️ Click to Play Video';
        playButton.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            padding: 1rem 2rem; font-size: 1.2rem; background: #00ff41;
            border: none; border-radius: 10px; cursor: pointer; z-index: 100;
        `;
        
        playButton.onclick = async () => {
            try {
                this.remoteVideoElement.muted = true;
                await this.remoteVideoElement.play();
                playButton.remove();
                
                // Unmute after successful user-initiated playback
                setTimeout(() => {
                    this.remoteVideoElement.muted = false;
                }, 1000);
                
            } catch (error) {
                console.error('❌ User-initiated play failed:', error);
            }
        };
        
        this.elements.strangerVideo.style.position = 'relative';
        this.elements.strangerVideo.appendChild(playButton);
    }

    async startRealSearch() {
        console.log(`🔍 Searching for ${this.state.selectedHobby.name} fans...`);
        
        if (this.elements.loadingText) {
            this.elements.loadingText.textContent = 
                `🔍 Searching for ${this.state.selectedHobby.name} enthusiasts...`;
        }

        this.showView('loadingScreen');

        if (this.socket) {
            this.socket.emit('set-hobby-preference', this.state.selectedHobby.id);
            this.socket.emit('find-match');
        }
    }

    async handleRealMatchFound(matchData) {
        console.log('🎉 Match found!', matchData);
        
        this.state.currentStranger = {
            country: matchData.partner?.country || 'Unknown',
            flag: matchData.partner?.flag || '🌍',
            hobby: matchData.partner?.hobby || this.state.selectedHobby?.id,
            roomId: matchData.roomId
        };

        await this.initializePeerConnection();
        this.updateConnectionInfo();
        this.showView('chatScreen');
        this.showConnectionCelebration();
        
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
            
            if (pc.signalingState === 'have-local-offer') {
                await pc.setLocalDescription({ type: 'rollback' });
            }
            
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            
            if (pc.signalingState === 'have-remote-offer') {
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                
                this.socket.emit('answer', { answer });
                console.log('📤 Answer sent');
            }
            
        } catch (error) {
            console.error('❌ Failed to handle offer:', error);
        }
    }

    async handleAnswer(data) {
        try {
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
            } else {
                this.queuedIceCandidates.push(data.candidate);
            }
            
        } catch (error) {
            console.error('❌ ICE candidate failed:', error);
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
                console.error('❌ Queued ICE candidate failed:', error);
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
        console.log('➡️ Next stranger...');
        this.closePeerConnection();
        this.stopSessionTimer();
        this.socket?.emit('next-stranger');
    }

    handleMuteToggle() {
        const audioTracks = this.state.localStream?.getAudioTracks() || [];
        audioTracks.forEach(track => track.enabled = !track.enabled);
        this.state.isMuted = audioTracks.length ? !audioTracks[0].enabled : false;
        console.log(`🔊 Audio ${this.state.isMuted ? 'muted' : 'unmuted'}`);
    }

    handleReportUser() {
        this.showNotification('User reported', 'success');
        setTimeout(() => this.handleNextStranger(), 1000);
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
        
        this.iceConnectionReady = false;
        this.remoteVideoElement = null;
        this.videoAttachmentAttempted = false;
        this.state.remoteStream = null;
        this.queuedIceCandidates = [];
        
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
        const message = `🎉 Connected with someone who loves ${hobbyName} from ${country}!`;
        
        const celebration = document.createElement('div');
        celebration.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); display: flex; align-items: center;
            justify-content: center; z-index: 1500;
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

// Initialize
console.log('🚀 Starting Stranger Face with ICE-Sync + Autoplay Fix...');
window.strangerFaceApp = new StrangerFaceApp();

// Cleanup
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
