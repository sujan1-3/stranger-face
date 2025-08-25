/**
 * Stranger Face – WebRTC with Xirsys TURN (server-fetched), relay fallback,
 * VP8-first negotiation, attach-after-ICE, robust playback.
 */

class StrangerFaceApp {
  constructor() {
    this.state = {
      currentView: 'landing',
      selectedHobby: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      socket: null,
      sessionStartTime: null,
      isMuted: false
    };
    this.rtcConfig = { iceServers: [] }; // Will be filled from /ice
    this._remoteVideoEl = null;
    this.queuedIceCandidates = [];
    this.relayFallbackTimer = null;
    this.iceReady = false;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    this.cacheElements();
    await this.initializeSocket();
    this.setupEventListeners();
    this.showView('landing');
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
    this.socket = io('https://stranger-face-backend.onrender.com', {
      transports: ['websocket','polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    this.socket.on('waiting-for-match', () => this.updateSearchStatus('Searching...'));
    this.socket.on('match-found', d => this.handleRealMatchFound(d));
    this.socket.on('offer', d => this.handleOffer(d));
    this.socket.on('answer', d => this.handleAnswer(d));
    this.socket.on('ice-candidate', d => this.handleIceCandidate(d));
    this.socket.on('partner-disconnected', () => this.handlePartnerDisconnected());
  }

  setupEventListeners() {
    this.elements.getStartedBtn?.addEventListener('click', () => this.showView('hobbySelection'));
    this.elements.hobbyCards.forEach(card => {
      card.addEventListener('click', async () => {
        this.elements.hobbyCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.state.selectedHobby = { id: card.dataset.hobby, name: card.textContent?.trim() || card.dataset.hobby };
        const ok = await this.requestMediaAccess();
        if (!ok) return;
        setTimeout(() => this.startRealSearch(), 400);
      });
    });
    this.elements.nextBtn?.addEventListener('click', () => this.handleNextStranger());
    this.elements.muteBtn?.addEventListener('click', () => this.handleMuteToggle());
    this.elements.reportBtn?.addEventListener('click', () => this.handleReportUser());
  }

  showView(name) {
    ['landingPage','hobbySelection','loadingScreen','chatScreen'].forEach(k => {
      const el = this.elements[k];
      if (el) el.style.display = 'none';
    });
    const target = this.elements[name];
    if (target) target.style.display = 'flex';
    this.state.currentView = name;
  }

  async requestMediaAccess() {
    try {
      const constraints = {
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 48000 }
      };
      this.state.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      const v = document.createElement('video');
      v.autoplay = true; v.playsInline = true; v.muted = true;
      v.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;background:#000;';
      v.srcObject = this.state.localStream;
      this.elements.selfVideo.innerHTML = '';
      this.elements.selfVideo.appendChild(v);
      return true;
    } catch (e) {
      this.showNotification('Camera/mic permission required', 'error');
      return false;
    }
  }

  async fetchIceServers() {
    // Calls the backend /ice endpoint which uses your XIRSYS_IDENT/SECRET/CHANNEL
    const res = await fetch('/ice', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to get ICE servers');
    const data = await res.json();
    if (!Array.isArray(data.iceServers) || !data.iceServers.length) throw new Error('No ICE servers returned');
    this.rtcConfig.iceServers = data.iceServers;
  }

  async initializePeerConnection(forceRelay = false) {
    if (!this.rtcConfig.iceServers?.length) await this.fetchIceServers();
    const cfg = { ...this.rtcConfig, iceTransportPolicy: forceRelay ? 'relay' : 'all' };
    this.state.peerConnection = new RTCPeerConnection(cfg);
    const pc = this.state.peerConnection;

    // VP8-first via transceiver preferences
    try {
      const txs = pc.getTransceivers?.() || [];
      txs.forEach(t => {
        const isVideo = t.receiver?.track?.kind === 'video';
        if (isVideo && RTCRtpSender.getCapabilities) {
          const caps = RTCRtpSender.getCapabilities('video');
          if (caps?.codecs?.length && t.setCodecPreferences) {
            const vp8First = caps.codecs
              .filter(c => c.mimeType?.toLowerCase() === 'video/vp8')
              .concat(caps.codecs.filter(c => c.mimeType?.toLowerCase() !== 'video/vp8'));
            t.setCodecPreferences(vp8First);
          }
        }
      });
    } catch {}

    // Add local tracks
    this.state.localStream?.getTracks().forEach(tr => pc.addTrack(tr, this.state.localStream));

    // Remote
    this.iceReady = false;
    pc.oniceconnectionstatechange = () => {
      const s = pc.iceConnectionState;
      if (s === 'connected' || s === 'completed') {
        this.iceReady = true;
        if (this._remoteVideoEl && this._remoteVideoEl.paused) {
          this._remoteVideoEl.play().catch(()=>{});
        }
        // Cancel relay fallback if any
        if (this.relayFallbackTimer) clearTimeout(this.relayFallbackTimer);
      }
    };

    pc.ontrack = (ev) => {
      const [remoteStream] = ev.streams;
      this.state.remoteStream = remoteStream;
      if (!this._remoteVideoEl) {
        const el = document.createElement('video');
        el.autoplay = true; el.playsInline = true; el.controls = false; el.muted = false;
        el.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:15px;background:#000;';
        el.srcObject = remoteStream;
        this.elements.strangerVideo.innerHTML = '';
        this.elements.strangerVideo.appendChild(el);
        this._remoteVideoEl = el;

        const forcePlay = async () => {
          try {
            if (!this.iceReady) return;
            await el.play();
          } catch {
            try { el.muted = true; await el.play(); setTimeout(()=>{ el.muted = false; }, 1200); } catch {}
          }
        };
        el.onloadedmetadata = () => forcePlay();
        el.oncanplay = () => forcePlay();
      }
      // drain any queued ICE after remote desc
      this.processQueuedIceCandidates();
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) this.socket.emit('ice-candidate', { candidate: ev.candidate });
    };

    // Relay fallback: if no remote plays after 7s, re-init with relay
    if (this.relayFallbackTimer) clearTimeout(this.relayFallbackTimer);
    this.relayFallbackTimer = setTimeout(async () => {
      if (!this._remoteVideoEl || this._remoteVideoEl.readyState < 2) {
        // Rebuild with relay-only
        try {
          pc.close();
        } catch {}
        await this.initializePeerConnection(true);
        await this.createAndSendOffer();
      }
    }, 7000);
  }

  async startRealSearch() {
    if (this.elements.loadingText) {
      this.elements.loadingText.textContent = `Searching for ${this.state.selectedHobby?.name} fans…`;
    }
    this.showView('loadingScreen');
    this.socket.emit('set-hobby-preference', this.state.selectedHobby?.id);
    this.socket.emit('find-match');
  }

  async handleRealMatchFound(matchData) {
    await this.initializePeerConnection(false);
    this.updateConnectionInfo(matchData);
    this.showView('chatScreen');
    setTimeout(() => this.createAndSendOffer(), 400);
  }

  updateConnectionInfo(md) {
    if (this.elements.hobbyName && this.state.selectedHobby) {
      this.elements.hobbyName.textContent = this.state.selectedHobby.name;
    }
    if (this.elements.countryInfo) {
      this.elements.countryInfo.textContent = '🌍 Unknown';
    }
  }

  async createAndSendOffer() {
    const pc = this.state.peerConnection;
    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true, voiceActivityDetection: false });
    await pc.setLocalDescription(offer);

    // Tame initial sender bitrate to avoid stalls
    try {
      const vsender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
      if (vsender) {
        const params = vsender.getParameters() || {};
        params.encodings = params.encodings || [{}];
        params.encodings[0].maxBitrate = 800_000; // 800 kbps
        params.encodings[0].maxFramerate = 30;
        await vsender.setParameters(params);
      }
    } catch {}

    this.socket.emit('offer', { offer });
  }

  async handleOffer(data) {
    const pc = this.state.peerConnection || await this.initializePeerConnection(false);
    if (pc.signalingState === 'have-local-offer') await pc.setLocalDescription({ type: 'rollback' });
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.socket.emit('answer', { answer });
  }

  async handleAnswer(data) {
    const pc = this.state.peerConnection;
    if (!pc) return;
    if (pc.signalingState !== 'stable') {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    } // else duplicate/late answer; safe to ignore
  }

  async handleIceCandidate(data) {
    const pc = this.state.peerConnection;
    if (!pc) return;
    if (pc.remoteDescription) {
      try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch {}
    } else {
      this.queuedIceCandidates.push(data.candidate);
    }
  }

  async processQueuedIceCandidates() {
    const pc = this.state.peerConnection;
    while (pc && pc.remoteDescription && this.queuedIceCandidates.length) {
      const c = this.queuedIceCandidates.shift();
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
    }
  }

  handlePartnerDisconnected() {
    this.showNotification('Partner disconnected', 'info');
    this.closePeerConnection();
    setTimeout(() => this.startRealSearch(), 800);
  }

  handleNextStranger() {
    this.closePeerConnection();
    this.socket.emit('next-stranger');
  }

  handleMuteToggle() {
    const tracks = this.state.localStream?.getAudioTracks() || [];
    tracks.forEach(t => t.enabled = !t.enabled);
    this.state.isMuted = tracks.length ? !tracks[0].enabled : this.state.isMuted;
  }

  handleReportUser() {
    this.showNotification('User reported', 'success');
    this.handleNextStranger();
  }

  closePeerConnection() {
    try { if (this.state.peerConnection) this.state.peerConnection.close(); } catch {}
    this.state.peerConnection = null;
    this._remoteVideoEl = null;
    this.state.remoteStream = null;
    this.queuedIceCandidates = [];
    if (this.relayFallbackTimer) clearTimeout(this.relayFallbackTimer);
    if (this.elements.strangerVideo) {
      this.elements.strangerVideo.innerHTML = `
        <div class="video-placeholder">
          <div class="placeholder-icon">🎥</div>
          <div class="placeholder-text">Connecting…</div>
        </div>`;
    }
  }

  updateSearchStatus(msg) {
    if (this.elements.loadingText) this.elements.loadingText.textContent = msg;
  }

  showNotification(message, type = 'info') {
    console.log(`[${type}] ${message}`);
  }
}

// Boot
window.strangerFaceApp = new StrangerFaceApp();
