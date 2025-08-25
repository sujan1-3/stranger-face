# Now I need to provide the CSS and JS files from the latest version. Let me get the exact content.
# I'll provide the CSS file first - this is a large file with all the cyberpunk styling

frontend_style_css_part1 = '''/* Cyberpunk Anime Stranger Face Styles */
:root {
    /* Cyberpunk Color Palette */
    --neon-blue: #00FFFF;
    --neon-pink: #FF1493;
    --neon-purple: #8A2BE2;
    --neon-green: #00FF41;
    --cyber-dark: #0A0A0F;
    --cyber-gray: #1A1A2E;
    --glass-white: rgba(255, 255, 255, 0.1);
    --glass-border: rgba(255, 255, 255, 0.2);
    
    /* Hobby Colors */
    --hobby-singing: #FF69B4;
    --hobby-dancing: #FF6B35;
    --hobby-music: #8B5CF6;
    --hobby-coding: #00D4AA;
    --hobby-gaming: #3B82F6;
    --hobby-art: #F59E0B;
    --hobby-books: #10B981;
    --hobby-travel: #06B6D4;
    
    /* Animation Timings */
    --fast: 0.2s;
    --normal: 0.3s;
    --slow: 0.5s;
    --bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
    --smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%, #16213E 100%);
    color: white;
    overflow-x: hidden;
    min-height: 100vh;
    position: relative;
}

/* Particle Background System */
.particles-universe {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
}

.particle-layer {
    position: absolute;
    width: 100%;
    height: 100%;
}

.particle {
    position: absolute;
    background: radial-gradient(circle, var(--neon-blue) 0%, transparent 70%);
    border-radius: 50%;
    animation: float 20s linear infinite;
}

.layer-1 .particle {
    width: 4px;
    height: 4px;
    animation-duration: 25s;
}

.layer-2 .particle {
    width: 6px;
    height: 6px;
    animation-duration: 30s;
    background: radial-gradient(circle, var(--neon-pink) 0%, transparent 70%);
}

.layer-3 .particle {
    width: 8px;
    height: 8px;
    animation-duration: 35s;
    background: radial-gradient(circle, var(--neon-purple) 0%, transparent 70%);
}

.layer-1 .particle:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
.layer-1 .particle:nth-child(2) { top: 50%; left: 80%; animation-delay: 5s; }
.layer-1 .particle:nth-child(3) { top: 80%; left: 30%; animation-delay: 10s; }
.layer-1 .particle:nth-child(4) { top: 30%; left: 60%; animation-delay: 15s; }
.layer-1 .particle:nth-child(5) { top: 70%; left: 90%; animation-delay: 20s; }

.layer-2 .particle:nth-child(1) { top: 40%; left: 20%; animation-delay: 3s; }
.layer-2 .particle:nth-child(2) { top: 10%; left: 70%; animation-delay: 8s; }
.layer-2 .particle:nth-child(3) { top: 60%; left: 50%; animation-delay: 13s; }
.layer-2 .particle:nth-child(4) { top: 90%; left: 80%; animation-delay: 18s; }

.layer-3 .particle:nth-child(1) { top: 25%; left: 40%; animation-delay: 2s; }
.layer-3 .particle:nth-child(2) { top: 75%; left: 15%; animation-delay: 7s; }
.layer-3 .particle:nth-child(3) { top: 45%; left: 85%; animation-delay: 12s; }

.floating-orbs {
    position: absolute;
    width: 100%;
    height: 100%;
}

.orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(1px);
    animation: orbit 40s linear infinite;
}

.orb-1 {
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, var(--neon-blue) 0%, transparent 70%);
    top: 20%;
    left: 10%;
    animation-duration: 45s;
}

.orb-2 {
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, var(--neon-pink) 0%, transparent 70%);
    top: 60%;
    right: 15%;
    animation-duration: 35s;
    animation-direction: reverse;
}

.orb-3 {
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, var(--neon-purple) 0%, transparent 70%);
    bottom: 20%;
    left: 50%;
    animation-duration: 50s;
}

/* Animations */
@keyframes float {
    0%, 100% {
        transform: translateY(0px) translateX(0px);
        opacity: 0.7;
    }
    25% {
        transform: translateY(-20px) translateX(10px);
        opacity: 1;
    }
    50% {
        transform: translateY(0px) translateX(-10px);
        opacity: 0.8;
    }
    75% {
        transform: translateY(15px) translateX(5px);
        opacity: 0.9;
    }
}

@keyframes orbit {
    0% {
        transform: rotate(0deg) translateX(50px) rotate(0deg);
    }
    100% {
        transform: rotate(360deg) translateX(50px) rotate(-360deg);
    }
}

@keyframes glow-pulse {
    0%, 100% {
        box-shadow: 0 0 20px var(--neon-blue);
        transform: scale(1);
    }
    50% {
        box-shadow: 0 0 40px var(--neon-blue), 0 0 60px var(--neon-blue);
        transform: scale(1.05);
    }
}

@keyframes text-glow {
    0%, 100% {
        text-shadow: 0 0 10px var(--neon-blue), 0 0 20px var(--neon-blue);
    }
    50% {
        text-shadow: 0 0 20px var(--neon-pink), 0 0 30px var(--neon-pink), 0 0 40px var(--neon-pink);
    }
}

@keyframes bounce-emoji {
    0%, 100% { transform: translateY(0px); }
    25% { transform: translateY(-5px); }
    75% { transform: translateY(-2px); }
}

/* Landing Page Styles */
.landing-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    padding: 2rem;
    position: relative;
    z-index: 1;
}

.hero-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3rem;
    max-width: 800px;
    width: 100%;
}

.logo-3d-container {
    position: relative;
    margin-bottom: 2rem;
}

.logo-3d-wrapper {
    position: relative;
    display: inline-block;
}

.logo-glow-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    border: 2px solid transparent;
    border-radius: 50%;
    background: conic-gradient(var(--neon-blue), var(--neon-pink), var(--neon-purple), var(--neon-blue));
    animation: spin 10s linear infinite;
    opacity: 0.3;
}

.main-title {
    font-family: 'Orbitron', monospace;
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 900;
    background: linear-gradient(45deg, var(--neon-blue), var(--neon-pink), var(--neon-purple));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: text-glow 3s ease-in-out infinite;
    letter-spacing: 0.1em;
    margin: 0;
    position: relative;
    z-index: 2;
}

.title-part {
    display: inline-block;
    animation: float 3s ease-in-out infinite;
}

.title-part:nth-child(1) { animation-delay: 0s; }
.title-part:nth-child(2) { animation-delay: 0.2s; }
.title-part:nth-child(3) { animation-delay: 0.4s; }
.title-part:nth-child(4) { animation-delay: 0.6s; }

.tagline-container {
    margin: 2rem 0;
}

.main-tagline {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    font-weight: 300;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.4;
    margin-bottom: 0;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.emoji-bounce {
    display: inline-block;
    animation: bounce-emoji 2s ease-in-out infinite;
}

.start-button-container {
    position: relative;
    margin-top: 2rem;
}

.get-started-btn {
    position: relative;
    background: linear-gradient(45deg, var(--neon-blue), var(--neon-purple));
    border: none;
    border-radius: 50px;
    padding: 1.5rem 3rem;
    font-size: 1.3rem;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all var(--normal) var(--bounce);
    overflow: hidden;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
}

.get-started-btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 40px rgba(0, 255, 255, 0.5);
}

.btn-glow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transform: translateX(-100%);
    transition: transform 0.8s;
}

.get-started-btn:hover .btn-glow {
    transform: translateX(100%);
}

.btn-text {
    position: relative;
    z-index: 2;
}

.btn-ripple {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.get-started-btn:active .btn-ripple {
    width: 300px;
    height: 300px;
}'''

save_file('frontend-style-part1.css', frontend_style_css_part1)