/**
 * Stranger Face - REAL WebRTC Video Chat Application
 * Complete production-ready implementation with FORCED video playback
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

        // WebRTC configuration with STUN servers
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' }
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

        // Queued ICE candidates
        this.queuedIceCandidates = [];

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
            console.log('🔌 Connecting to backend server...');
            
            // Connect to your Render backend
            this.socket = io('https://stranger-face-backend.onrender.com', {
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            this.socket.on('connect', () => {
                console.log('✅ Connected to real backend server!');
                this.showNotification('Connected to server', 'success');
            });

            this.socket.on('disconnect', (reason) => {
                console.log('❌ Disconnected from server:', reason);
                this.showNotification('Disconnected from server', 'error');
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Connection error:', error);
                this.showNotification('Failed to connect to server', 'error');
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

            this.socket.on('error', (error) => {
                console.error('❌ Socket error:', error);
                this.showNotification(error.message || 'An error occurred', 'error');
            });

        } catch (error) {
            console.error('❌ Socket connection failed:', error);
            this.showNotification('Failed to connect to server', 'error');
        }
    }

    // Safe WebRTC setRemoteDescription helper
    async safeSetRemoteDescription(pc, description) {
        const desc = new RTCSessionDescription(description);
        
        if (desc.type === 'answer') {
            if (pc.signalingState === 'stable') {
                console.log('⚠️ Ignoring answer - connection already stable');
                return;
            }
            if (pc.signalingState === 'have-local-offer') {
                await pc.setRemoteDescription(desc);
                console.log('✅ Remote answer set successfully');
            } else {
                console.log('⚠️ Unexpected state for answer:', pc.signalingState);
            }
        } else if (desc.type === 'offer') {
            if (pc.signalingState === 'stable') {
                await pc.setRemoteDescription(desc);
                console.log('✅ Remote offer set successfully');
            } else if (pc.signalingState === 'have-local-offer') {
                console.log('🔄 Rolling back local offer...');
                await pc.setLocalDescription({ type: 'rollback' });
                await pc.setRemoteDescription(desc);
                console.log('✅ Remote offer set after rollback');
            } else {
                await pc.setRemoteDescription(desc);
                console.log('✅ Remote offer set');
            }
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
        this.elements.sessionTime = document.getElementById('sessionTime');
        this.elements.emojiButtons = document.querySelectorAll('.emoji-btn');
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

        // Emoji reactions
        this.elements.emojiButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.dataset.emoji;
                this.sendEmojiReaction(emoji);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.state.currentView === 'chatScreen') {
                switch(e.key) {
                    case ' ': // Space = Next stranger
                        e.preventDefault();
                        this.handleNextStranger();
                        break;
                    case 'm': // M = Mute toggle
                        this.handleMuteToggle();
                        break;
                    case 'Escape': // Esc = Back to landing
                        this.handleBackToLanding();
                        break;
                }
            }
        });
    }

    // Request real camera and microphone access
    async requestMediaAccess() {
        try {
            console.log('🎥 Requesting camera and microphone access...');
            
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
            
            // Show local video in self video element
            const selfVideoElement = this.createVideoElement(true);
            selfVideoElement.srcObject = this.state.localStream;
            selfVideoElement.muted = true; // Prevent echo
            
            // Replace placeholder with real video
            const selfVideoContainer = this.elements.selfVideo;
            selfVideoContainer.innerHTML = '';
            selfVideoContainer.appendChild(selfVideoElement);
            
            console.log('✅ Camera and microphone access granted!');
            this.showNotification('Camera and microphone ready!', 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Media access denied:', error);
            
            let errorMessage = 'Camera and microphone access is required for video chat.';
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Permission denied. Please enable camera and microphone access and refresh the page.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No camera or microphone found. Please check your devices.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Camera or microphone is already in use by another application.';
            }
            
            this.showNotification(errorMessage, 'error');
            return false;
        }
    }

    // Create video element with enhanced properties
    createVideoElement(isLocal = false) {
        const video = document.createElement('video');
        video.autoplay = true;
        video.playsInline = true;
        video.controls = false;
        video.muted = isLocal; // Only mute local video to prevent echo
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.borderRadius = isLocal ? '50%' : '15px';
        video.style.backgroundColor = '#000';
        
        // Add enhanced event listeners
        video.addEventListener('loadedmetadata', () => {
            console.log(`📹 Video ${isLocal ? 'local' : 'remote'} metadata loaded`);
            console.log(`📹 Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
        });
        
        video.addEventListener('loadeddata', () => {
            console.log(`📹 Video ${isLocal ? 'local' : 'remote'} data loaded`);
        });
        
        video.addEventListener('canplay', () => {
            console.log(`📹 Video ${isLocal ? 'local' : 'remote'} can play`);
        });
        
        video.addEventListener('playing', () => {
            console.log(`📹 Video ${isLocal ? 'local' : 'remote'} is playing`);
        });
        
        video.addEventListener('error', (e) => {
            console.error(`❌ Video ${isLocal ? 'local' : 'remote'} error:`, e);
        });
        
        return video;
    }

    // Initialize WebRTC peer connection (FIXED FOR IMMEDIATE VIDEO PLAYBACK)
    async initializePeerConnection() {
        try {
            console.log('🔗 Initializing peer connection...');
            
            this.state.peerConnection = new RTCPeerConnection(this.rtcConfig);
            const pc = this.state.peerConnection;
            
            // Track if we've already created remote video element
            let remoteVideoCreated = false;
            let remoteVideoElement = null;
            
            // CRITICAL: Set up ontrack handler with immediate playback
            pc.ontrack = (event) => {
                console.log('📥 REMOTE STREAM RECEIVED!');
                console.log('📥 Track kind:', event.track.kind);
                console.log('📥 Track enabled:', event.track.enabled);
                console.log('📥 Track readyState:', event.track.readyState);
                
                const [remoteStream] = event.streams;
                
                // Only create remote video element once
                if (!remoteVideoCreated) {
                    console.log('📥 Creating remote video element for the first time');
                    this.state.remoteStream = remoteStream;
                    
                    // Create video element with enhanced settings
                    remoteVideoElement = document.createElement('video');
                    remoteVideoElement.autoplay = true;
                    remoteVideoElement.playsInline = true;
                    remoteVideoElement.controls = false;
                    remoteVideoElement.muted = false; // Allow audio
                    remoteVideoElement.style.width = '100%';
                    remoteVideoElement.style.height = '100%';
                    remoteVideoElement.style.objectFit = 'cover';
                    remoteVideoElement.style.borderRadius = '15px';
                    remoteVideoElement.style.backgroundColor = '#000';
                    
                    // Set the stream immediately
                    remoteVideoElement.srcObject = remoteStream;
                    
                    // CRITICAL: Force immediate playback with multiple attempts
                    const forcePlay = async () => {
                        try {
                            console.log('🎥 Attempting to play remote video...');
                            await remoteVideoElement.play();
                            console.log('✅ Remote video started playing successfully!');
                        } catch (error) {
                            console.log('⚠️ First play attempt failed, trying muted:', error.message);
                            try {
                                remoteVideoElement.muted = true;
                                await remoteVideoElement.play();
                                console.log('✅ Remote video playing (muted)');
                                
                                // Try to unmute after 1 second
                                setTimeout(() => {
                                    remoteVideoElement.muted = false;
                                    console.log('🔊 Unmuted remote video');
                                }, 1000);
                            } catch (error2) {
                                console.error('❌ Failed to play remote video even muted:', error2);
                            }
                        }
                    };
                    
                    // Enhanced event handlers
                    remoteVideoElement.onloadstart = () => {
                        console.log('🎥 Remote video load started');
                    };
                    
                    remoteVideoElement.onloadeddata = () => {
                        console.log('🎥 Remote video data loaded');
                        console.log('🎥 Video dimensions:', remoteVideoElement.videoWidth, 'x', remoteVideoElement.videoHeight);
                    };
                    
                    remoteVideoElement.onloadedmetadata = () => {
                        console.log('🎥 Remote video metadata loaded');
                        console.log('🎥 Video dimensions:', remoteVideoElement.videoWidth, 'x', remoteVideoElement.videoHeight);
                        
                        // Force play when metadata loads
                        forcePlay();
                    };
                    
                    remoteVideoElement.oncanplay = () => {
                        console.log('🎥 Remote video can play');
                        console.log('🎥 Current dimensions:', remoteVideoElement.videoWidth, 'x', remoteVideoElement.videoHeight);
                        
                        // Try to play again if not already playing
                        if (remoteVideoElement.paused) {
                            forcePlay();
                        }
                    };
                    
                    remoteVideoElement.onplaying = () => {
                        console.log('✅ Remote video is now playing!');
                        console.log('🎥 Final dimensions:', remoteVideoElement.videoWidth, 'x', remoteVideoElement.videoHeight);
                        
                        // Show success notification
                        this.showNotification('Remote video connected and playing!', 'success');
                    };
                    
                    remoteVideoElement.onerror = (e) => {
                        console.error('❌ Remote video error:', e);
                    };
                    
                    remoteVideoElement.onstalled = () => {
                        console.log('⚠️ Remote video stalled');
                    };
                    
                    remoteVideoElement.onwaiting = () => {
                        console.log('⏳ Remote video waiting for data');
                    };
                    
                    // Replace placeholder with actual video
                    const strangerVideoContainer = this.elements.strangerVideo;
                    if (strangerVideoContainer) {
                        strangerVideoContainer.innerHTML = '';
                        strangerVideoContainer.appendChild(remoteVideoElement);
                        console.log('✅ Remote video element attached to container');
                    } else {
                        console.error('❌ Stranger video container not found!');
                    }
                    
                    // Try to play immediately after attaching
                    setTimeout(() => {
                        forcePlay();
                    }, 100);
                    
                    // Update connection status
                    const statusElement = document.querySelector('.connection-status');
                    if (statusElement) {
                        statusElement.textContent = '🟢 Connected';
                        statusElement.style.color = '#00ff41';
                    }
                    
                    remoteVideoCreated = true;
                } else {
                    console.log('📥 Additional track received:', event.track.kind, '- updating existing video element');
                    
                    // Update the existing video element's stream
                    if (remoteVideoElement && remoteVideoElement.srcObject !== remoteStream) {
                        remoteVideoElement.srcObject = remoteStream;
                        console.log('🔄 Updated remote video element with new stream');
                        
                        // Try to play the updated stream
                        setTimeout(() => {
                            if (remoteVideoElement.paused) {
                                remoteVideoElement.play().catch(e => {
                                    console.log('⚠️ Failed to play updated stream:', e.message);
                                });
                            }
                        }, 100);
                    }
                }
                
                // Process any queued ICE candidates
                this.processQueuedIceCandidates();
            };

            // Add local stream tracks to peer connection
            if (this.state.localStream) {
                console.log('📤 Adding local tracks to peer connection...');
                this.state.localStream.getTracks().forEach(track => {
                    console.log('📤 Adding track:', track.kind, track.enabled);
                    const sender = pc.addTrack(track, this.state.localStream);
                    console.log('📤 Track added, sender:', sender);
                });
            } else {
                console.error('❌ No local stream available to add tracks!');
            }

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate && this.socket && this.socket.connected) {
                    console.log('🧊 Sending ICE candidate');
                    this.socket.emit('ice-candidate', {
                        candidate: event.candidate
                    });
                } else if (!event.candidate) {
                    console.log('🧊 ICE gathering completed');
                }
            };

            // Handle connection state changes
            pc.onconnectionstatechange = () => {
                const state = pc.connectionState;
                console.log('🔗 Connection state changed:', state);
                
                switch (state) {
                    case 'connecting':
                        this.showNotification('Connecting to peer...', 'info');
                        break;
                    case 'connected':
                        console.log('🎉 WebRTC connection fully established!');
                        this.showNotification('Video chat fully connected!', 'success');
                        this.startSessionTimer();
                        
                        // Extra attempt to play video when fully connected
                        if (remoteVideoElement && remoteVideoElement.paused) {
                            setTimeout(() => {
                                remoteVideoElement.play().catch(e => {
                                    console.log('⚠️ Final play attempt failed:', e.message);
                                });
                            }, 500);
                        }
                        break;
                    case 'disconnected':
                        this.showNotification('Peer disconnected', 'info');
                        break;
                    case 'failed':
                        this.showNotification('Connection failed', 'error');
                        this.handleConnectionFailed();
                        break;
                }
            };

            // Handle signaling state changes
            pc.onsignalingstatechange = () => {
                console.log('📡 Signaling state changed:', pc.signalingState);
            };

            // Handle ICE connection state changes
            pc.oniceconnectionstatechange = () => {
                console.log('🧊 ICE connection state:', pc.iceConnectionState);
                
                if (pc.iceConnectionState === 'connected') {
                    console.log('✅ ICE connection established!');
                } else if (pc.iceConnectionState === 'failed') {
                    console.log('❌ ICE connection failed');
                }
            };

            console.log('✅ Peer connection initialized with forced video playback');
            
        } catch (error) {
            console.error('❌ Failed to initialize peer connection:', error);
            this.showNotification('Failed to initialize video connection', 'error');
        }
    }

    // Process queued ICE candidates
    async processQueuedIceCandidates() {
        if (this.queuedIceCandidates && this.queuedIceCandidates.length > 0) {
            console.log(`🧊 Processing ${this.queuedIceCandidates.length} queued ICE candidates`);
            
            for (const candidate of this.queuedIceCandidates) {
                try {
                    await this.state.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    console.log('🧊 Queued ICE candidate added');
                } catch (error) {
                    console.error('❌ Failed to add queued ICE candidate:', error);
                }
            }
            
            this.queuedIceCandidates = [];
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

        // Show animation feedback
        card.style.transform = 'scale(1.1)';
        setTimeout(() => {
            card.style.transform = '';
        }, 300);

        // Request camera access before starting search
        const mediaGranted = await this.requestMediaAccess();
        if (!mediaGranted) {
            // Reset selection if camera access denied
            card.classList.remove('selected');
            this.state.selectedHobby = null;
            return;
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
            console.log('📤 Sending hobby preference to backend');
            this.socket.emit('set-hobby-preference', this.state.selectedHobby.id);
            this.socket.emit('find-match');
        } else {
            console.error('❌ Socket not connected');
            this.showNotification('Connection to server lost. Please refresh and try again.', 'error');
            setTimeout(() => {
                this.showView('hobbySelection');
            }, 3000);
        }
    }

    // Handle real match found from backend
    async handleRealMatchFound(matchData) {
        console.log('🎉 REAL match found!', matchData);
        
        this.state.currentStranger = {
            country: matchData.partner.country || 'Unknown',
            countryCode: matchData.partner.countryCode || 'XX',
            flag: matchData.partner.flag || '🌍',
            hobby: matchData.partner.hobby || this.state.selectedHobby.id,
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
        setTimeout(() => {
            this.createAndSendOffer();
        }, 1000);
    }

    // Create and send WebRTC offer
    async createAndSendOffer() {
        try {
            console.log('📞 Creating and sending offer...');
            
            const offer = await this.state.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            
            await this.state.peerConnection.setLocalDescription(offer);
            
            console.log('📤 Sending offer to peer');
            this.socket.emit('offer', {
                offer: offer,
                roomId: this.state.currentStranger.roomId
            });
            
        } catch (error) {
            console.error('❌ Failed to create offer:', error);
            this.showNotification('Failed to establish connection', 'error');
        }
    }

    // Handle incoming WebRTC offer (COMPLETELY FIXED)
    async handleOffer(data) {
        try {
            console.log('📞 Handling incoming offer...');
            console.log('📡 Current signaling state:', this.state.peerConnection?.signalingState || 'no connection');
            
            if (!this.state.peerConnection) {
                await this.initializePeerConnection();
            }

            const pc = this.state.peerConnection;
            
            // CRITICAL: Check and handle signaling state properly
            console.log('📡 Signaling state before handling offer:', pc.signalingState);
            
            // Safe set remote description
            await this.safeSetRemoteDescription(pc, data.offer);
            
            // CRITICAL: Only create answer if we're in the right state
            console.log('📡 Signaling state before createAnswer:', pc.signalingState);
            
            if (pc.signalingState === 'have-remote-offer') {
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                
                console.log('📤 Sending answer to peer');
                this.socket.emit('answer', {
                    answer: answer
                });
                
                console.log('✅ Answer created and sent successfully');
            } else {
                console.log('❌ Cannot create answer - signaling state is:', pc.signalingState);
            }
            
        } catch (error) {
            console.error('❌ Failed to handle offer:', error);
            this.showNotification('Failed to respond to connection', 'error');
        }
    }

    // Handle incoming WebRTC answer (COMPLETELY FIXED)
    async handleAnswer(data) {
        try {
            console.log('✅ Handling incoming answer...');
            console.log('📡 Current signaling state:', this.state.peerConnection?.signalingState);
            
            const pc = this.state.peerConnection;
            if (!pc) {
                console.log('❌ No peer connection available');
                return;
            }
            
            // Safe set remote description
            await this.safeSetRemoteDescription(pc, data.answer);
            
        } catch (error) {
            console.error('❌ Failed to handle answer:', error);
        }
    }

    // Handle incoming ICE candidate (FIXED)
    async handleIceCandidate(data) {
        try {
            const pc = this.state.peerConnection;
            if (!pc) {
                console.log('❌ No peer connection for ICE candidate');
                return;
            }
            
            // Check if remote description is set before adding ICE candidate
            if (pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                console.log('🧊 ICE candidate added successfully');
            } else {
                console.log('⏳ Queueing ICE candidate - no remote description yet');
                // Queue ICE candidate for later
                this.queuedIceCandidates.push(data.candidate);
            }
            
        } catch (error) {
            console.error('❌ Failed to add ICE candidate:', error);
        }
    }

    // Update connection info display
    updateConnectionInfo() {
        if (this.elements.hobbyName && this.state.selectedHobby) {
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
        
        // Stop session timer
        this.stopSessionTimer();
        
        // Request new match
        if (this.socket && this.socket.connected) {
            this.socket.emit('next-stranger');
            this.startRealSearch();
        } else {
            this.showNotification('Connection lost. Please refresh and try again.', 'error');
        }
    }

    // Handle mute toggle
    handleMuteToggle() {
        if (!this.state.localStream) {
            this.showNotification('No audio stream available', 'error');
            return;
        }

        const audioTracks = this.state.localStream.getAudioTracks();
        if (audioTracks.length === 0) {
            this.showNotification('No audio track available', 'error');
            return;
        }

        // Toggle all audio tracks
        audioTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
        
        this.state.isMuted = !audioTracks[0].enabled;
        
        // Update UI
        const muteBtn = this.elements.muteBtn;
        const icon = muteBtn.querySelector('.btn-icon');
        const text = muteBtn.querySelector('.btn-text');
        
        if (this.state.isMuted) {
            icon.textContent = '🔇';
            text.textContent = 'Unmute';
            muteBtn.style.background = 'rgba(255, 68, 68, 0.2)';
            this.showNotification('Microphone muted', 'info');
        } else {
            icon.textContent = '🔊';
            text.textContent = 'Mute';
            muteBtn.style.background = '';
            this.showNotification('Microphone unmuted', 'info');
        }
        
        console.log(`🔊 Audio ${this.state.isMuted ? 'muted' : 'unmuted'}`);
    }

    // Handle report user
    handleReportUser() {
        console.log('⚠️ Reporting user...');
        
        if (this.socket && this.state.currentStranger) {
            this.socket.emit('report-user', {
                reportedUser: this.state.currentStranger.roomId,
                reason: 'inappropriate_behavior',
                timestamp: new Date().toISOString()
            });
            
            this.showNotification('User reported. Thank you for keeping our community safe.', 'success');
            
            // Automatically find next stranger after reporting
            setTimeout(() => {
                this.handleNextStranger();
            }, 2000);
        } else {
            this.showNotification('Unable to report user. No active connection.', 'error');
        }
    }

    // Handle partner disconnected
    handlePartnerDisconnected() {
        this.showNotification('Partner disconnected. Finding new match...', 'info');
        this.closePeerConnection();
        this.stopSessionTimer();
        
        // Automatically start new search
        setTimeout(() => {
            this.startRealSearch();
        }, 1000);
    }

    // Handle connection failed
    handleConnectionFailed() {
        this.showNotification('Connection failed. Trying to reconnect...', 'error');
        this.closePeerConnection();
        
        // Try again after a short delay
        setTimeout(() => {
            this.startRealSearch();
        }, 3000);
    }

    // Handle back to landing
    handleBackToLanding() {
        this.closePeerConnection();
        this.stopSessionTimer();
        
        if (this.state.localStream) {
            this.state.localStream.getTracks().forEach(track => track.stop());
            this.state.localStream = null;
        }
        
        this.state.selectedHobby = null;
        this.state.currentStranger = null;
        
        // Reset hobby selection
        this.elements.hobbyCards.forEach(c => c.classList.remove('selected'));
        
        this.showView('landing');
    }

    // Session timer functions
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

    // Send emoji reaction
    sendEmojiReaction(emoji) {
        console.log(`💫 Sending emoji reaction: ${emoji}`);
        
        // Create floating emoji
        this.createFloatingEmoji(emoji);
        
        // Send to other user via socket
        if (this.socket && this.state.currentStranger) {
            this.socket.emit('emoji-reaction', { 
                emoji, 
                roomId: this.state.currentStranger.roomId,
                timestamp: Date.now() 
            });
        }
    }

    // Create floating emoji animation
    createFloatingEmoji(emoji) {
        const container = document.getElementById('emojiReactions');
        if (!container) return;

        const emojiElement = document.createElement('div');
        emojiElement.className = 'floating-emoji';
        emojiElement.textContent = emoji;
        emojiElement.style.cssText = `
            position: absolute;
            font-size: 2rem;
            pointer-events: none;
            z-index: 1000;
            animation: emoji-float 3s ease-out forwards;
            left: ${Math.random() * window.innerWidth}px;
            bottom: 10%;
        `;
        
        container.appendChild(emojiElement);
        
        // Remove after animation
        setTimeout(() => {
            if (container.contains(emojiElement)) {
                container.removeChild(emojiElement);
            }
        }, 3000);
    }

    // Close peer connection
    closePeerConnection() {
        if (this.state.peerConnection) {
            console.log('🔒 Closing peer connection');
            this.state.peerConnection.close();
            this.state.peerConnection = null;
        }
        
        if (this.state.remoteStream) {
            this.state.remoteStream.getTracks().forEach(track => track.stop());
            this.state.remoteStream = null;
        }

        // Clear queued ICE candidates
        this.queuedIceCandidates = [];

        // Reset video containers
        if (this.elements.strangerVideo) {
            this.elements.strangerVideo.innerHTML = `
                <div class="video-placeholder">
                    <div class="placeholder-icon">🎥</div>
                    <div class="placeholder-text">Connecting to stranger...</div>
                </div>
            `;
        }

        // Reset connection status
        const statusElement = document.querySelector('.connection-status');
        if (statusElement) {
            statusElement.textContent = '🟡 Connecting...';
            statusElement.style.color = '#ffff00';
        }
    }

    // Show connection celebration
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
                 border-radius: 20px; padding: 3rem; text-align: center; max-width: 500px;
                 backdrop-filter: blur(20px);">
                <div style="font-size: 1.5rem; color: white; margin-bottom: 1rem; line-height: 1.4;">
                    ${message}
                </div>
                <div style="font-size: 2rem; animation: bounce-emoji 1s ease-in-out infinite;">
                    🎉✨🚀💫🌸
                </div>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            if (document.body.contains(celebration)) {
                celebration.style.animation = 'fadeOut 0.5s ease-out';
                setTimeout(() => {
                    if (document.body.contains(celebration)) {
                        document.body.removeChild(celebration);
                    }
                }, 500);
            }
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
            backdrop-filter: blur(10px);
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    // Cleanup on page unload
    cleanup() {
        console.log('🧹 Cleaning up resources...');
        
        if (this.state.localStream) {
            this.state.localStream.getTracks().forEach(track => {
                track.stop();
                console.log('🛑 Stopped track:', track.kind);
            });
        }
        
        this.closePeerConnection();
        this.stopSessionTimer();
        
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

// Add required CSS animations
const style = document.createElement('style');
style.textContent = `
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

@keyframes emoji-float {
    0% {
        transform: translateY(0) scale(0.8);
        opacity: 1;
    }
    50% {
        transform: translateY(-200px) scale(1.2);
        opacity: 1;
    }
    100% {
        transform: translateY(-400px) scale(0.6);
        opacity: 0;
    }
}

@keyframes bounce-emoji {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

/* Force main content visibility */
.landing-container {
    display: flex !important;
    opacity: 1 !important;
    z-index: 1000 !important;
    position: relative !important;
    min-height: 100vh !important;
    justify-content: center !important;
    align-items: center !important;
}

.hero-section {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    z-index: 1001 !important;
}

.main-title {
    display: block !important;
    opacity: 1 !important;
}
`;
document.head.appendChild(style);

// Initialize the real application
console.log('🚀 Starting Stranger Face...');
window.strangerFaceApp = new StrangerFaceApp();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.strangerFaceApp) {
        window.strangerFaceApp.cleanup();
    }
});

// Handle visibility change (when user switches tabs)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('👁️ Page hidden');
    } else {
        console.log('👁️ Page visible');
    }
});
