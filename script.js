class MultiPlatformStreamApp {
    constructor() {
        this.maxBoxes = 20;
        this.videoUrl = '';
        this.selectedCount = 0;
        this.selectedPlatform = '';
        
        this.platformConfig = {
            youtube: {
                name: 'YouTube',
                icon: '📺',
                regex: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/,
                embed: (url, index) => this.createYouTubeEmbed(url, index)
            },
            facebook: {
                name: 'Facebook',
                icon: '📘',
                regex: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+$/,
                embed: (url, index) => this.createFacebookEmbed(url, index)
            },
            tiktok: {
                name: 'TikTok',
                icon: '🎵',
                regex: /^(https?:\/\/)?(www\.)?tiktok\.com\/.+/,
                embed: (url, index) => this.createTikTokEmbed(url, index)
            },
            instagram: {
                name: 'Instagram',
                icon: '📷',
                regex: /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel)\/.+/,
                embed: (url, index) => this.createInstagramEmbed(url, index)
            },
            twitter: {
                name: 'Twitter/X',
                icon: '🐦',
                regex: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+/,
                embed: (url, index) => this.createTwitterEmbed(url, index)
            }
        };
        
        this.initializeElements();
        this.populateDropdown();
        this.attachEventListeners();
    }

    initializeElements() {
        // Input section elements
        this.inputSection = document.getElementById('inputSection');
        this.platformSelect = document.getElementById('platformSelect');
        this.videoUrlInput = document.getElementById('videoUrl');
        this.pasteBtn = document.getElementById('pasteBtn');
        this.boxCountSelect = document.getElementById('boxCount');
        this.streamBtn = document.getElementById('streamBtn');
        
        // Video section elements
        this.videoSection = document.getElementById('videoSection');
        this.videoGrid = document.getElementById('videoGrid');
        this.currentPlatform = document.getElementById('currentPlatform');
        this.currentBoxCount = document.getElementById('currentBoxCount');
        this.newStreamBtn = document.getElementById('newStreamBtn');
        this.exitBtn = document.getElementById('exitBtn');
    }

    populateDropdown() {
        // Clear existing options
        this.boxCountSelect.innerHTML = '<option value="">Choose number of boxes</option>';
        
        // Add options from 1 to maxBoxes
        for (let i = 1; i <= this.maxBoxes; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} box${i > 1 ? 'es' : ''}`;
            this.boxCountSelect.appendChild(option);
        }
    }

    attachEventListeners() {
        // Platform selection
        this.platformSelect.addEventListener('change', () => this.handlePlatformChange());
        
        // Paste button
        this.pasteBtn.addEventListener('click', () => this.handlePaste());
        
        // Stream button
        this.streamBtn.addEventListener('click', () => this.handleStream());
        
        // Navigation buttons
        this.newStreamBtn.addEventListener('click', () => this.showInputSection());
        this.exitBtn.addEventListener('click', () => this.showInputSection());
        
        // Input validation
        this.videoUrlInput.addEventListener('input', () => this.validateInput());
        this.boxCountSelect.addEventListener('change', () => this.validateInput());
    }

    handlePlatformChange() {
        this.selectedPlatform = this.platformSelect.value;
        this.validateInput();
        
        // Update placeholder based on platform
        if (this.selectedPlatform) {
            const platform = this.platformConfig[this.selectedPlatform];
            this.videoUrlInput.placeholder = `Paste ${platform.name} URL here...`;
        } else {
            this.videoUrlInput.placeholder = 'Paste video URL here...';
        }
    }

    async handlePaste() {
        try {
            const text = await navigator.clipboard.readText();
            this.videoUrlInput.value = text;
            this.videoUrlInput.focus();
            
            // Auto-detect platform from pasted URL
            this.autoDetectPlatform(text);
            
            // Add visual feedback
            this.pasteBtn.innerHTML = '<i class="fas fa-check"></i> Pasted!';
            this.pasteBtn.style.background = '#16a34a';
            
            setTimeout(() => {
                this.pasteBtn.innerHTML = '<i class="fas fa-paste"></i> Paste';
                this.pasteBtn.style.background = '';
            }, 2000);
            
            this.validateInput();
        } catch (err) {
            console.error('Failed to read clipboard contents:', err);
            alert('Unable to paste. Please paste manually.');
        }
    }

    autoDetectPlatform(url) {
        for (const [platform, config] of Object.entries(this.platformConfig)) {
            if (config.regex.test(url)) {
                this.platformSelect.value = platform;
                this.selectedPlatform = platform;
                this.videoUrlInput.placeholder = `Paste ${config.name} URL here...`;
                break;
            }
        }
    }

    validateInput() {
        const url = this.videoUrlInput.value.trim();
        const count = parseInt(this.boxCountSelect.value);
        const platform = this.platformSelect.value;
        
        const isValidPlatform = !!platform;
        const isValidUrl = url && this.isValidUrlForPlatform(url, platform);
        const isValidCount = count > 0 && count <= this.maxBoxes;
        
        this.streamBtn.disabled = !(isValidPlatform && isValidUrl && isValidCount);
        
        return isValidPlatform && isValidUrl && isValidCount;
    }

    isValidUrlForPlatform(url, platform) {
        if (!platform || !url) return false;
        const config = this.platformConfig[platform];
        return config ? config.regex.test(url) : false;
    }

    handleStream() {
        if (!this.validateInput()) {
            alert('Please select a platform, enter a valid URL, and select number of boxes.');
            return;
        }

        this.videoUrl = this.videoUrlInput.value.trim();
        this.selectedCount = parseInt(this.boxCountSelect.value);
        this.selectedPlatform = this.platformSelect.value;
        
        this.showVideoSection();
        this.generateVideoBoxes();
    }

    showVideoSection() {
        // Update stream info
        const platform = this.platformConfig[this.selectedPlatform];
        this.currentPlatform.textContent = `${platform.icon} ${platform.name}`;
        this.currentBoxCount.textContent = `${this.selectedCount} box${this.selectedCount > 1 ? 'es' : ''}`;
        
        this.inputSection.classList.remove('active');
        this.videoSection.classList.add('active');
    }

    showInputSection() {
        this.videoSection.classList.remove('active');
        this.inputSection.classList.add('active');
        this.clearVideoGrid();
        this.resetForm();
    }

    generateVideoBoxes() {
        this.clearVideoGrid();
        
        const platform = this.platformConfig[this.selectedPlatform];
        if (!platform) {
            alert('Invalid platform selected.');
            this.showInputSection();
            return;
        }

        for (let i = 0; i < this.selectedCount; i++) {
            const videoBox = platform.embed(this.videoUrl, i);
            this.videoGrid.appendChild(videoBox);
        }

        // Load platform-specific embed scripts
        this.loadEmbedScripts();
    }

    loadEmbedScripts() {
        // Load TikTok script
        if (this.selectedPlatform === 'tiktok' && !window.tiktokScriptLoaded) {
            const script = document.createElement('script');
            script.src = 'https://www.tiktok.com/embed.js';
            script.async = true;
            document.head.appendChild(script);
            window.tiktokScriptLoaded = true;
        }

        // Load Instagram script
        if (this.selectedPlatform === 'instagram' && !window.instagramScriptLoaded) {
            const script = document.createElement('script');
            script.src = 'https://www.instagram.com/embed.js';
            script.async = true;
            document.head.appendChild(script);
            window.instagramScriptLoaded = true;
        }

        // Load Twitter script
        if (this.selectedPlatform === 'twitter' && !window.twitterScriptLoaded) {
            const script = document.createElement('script');
            script.src = 'https://platform.twitter.com/widgets.js';
            script.async = true;
            document.head.appendChild(script);
            window.twitterScriptLoaded = true;
        }
    }

    // Platform-specific embed creators
    createYouTubeEmbed(url, index) {
        const videoId = this.getYouTubeVideoId(url);
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }

        const videoBox = document.createElement('div');
        videoBox.className = 'video-box youtube-embed';
        
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&enablejsapi=1`;
        iframe.allow = 'autoplay; encrypted-media';
        iframe.allowFullscreen = true;
        iframe.title = `YouTube Video ${index + 1}`;
        
        videoBox.appendChild(iframe);
        return videoBox;
    }

    createFacebookEmbed(url, index) {
        const videoBox = document.createElement('div');
        videoBox.className = 'video-box facebook-embed';
        
        // Facebook has very strict embedding rules - use their official embed
        const container = document.createElement('div');
        container.className = 'fb-video';
        container.setAttribute('data-href', url);
        container.setAttribute('data-width', '100%');
        container.setAttribute('data-show-text', 'false');
        container.setAttribute('data-lazy', 'true');
        
        videoBox.appendChild(container);
        
        // Add fallback message
        const fallback = document.createElement('div');
        fallback.className = 'embed-fallback';
        fallback.innerHTML = `
            <p>🎥 Facebook Video</p>
            <a href="${url}" target="_blank" class="fallback-link">
                Watch on Facebook
            </a>
        `;
        videoBox.appendChild(fallback);
        
        return videoBox;
    }

    createTikTokEmbed(url, index) {
        const videoBox = document.createElement('div');
        videoBox.className = 'video-box tiktok-embed';
        
        // TikTok official embed
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'tiktok-embed';
        blockquote.setAttribute('cite', url);
        blockquote.setAttribute('data-video-id', `tiktok-${index}`);
        blockquote.style.width = '100%';
        blockquote.style.maxWidth = '100%';
        
        const section = document.createElement('section');
        blockquote.appendChild(section);
        
        videoBox.appendChild(blockquote);
        
        // Add fallback
        const fallback = document.createElement('div');
        fallback.className = 'embed-fallback';
        fallback.innerHTML = `
            <p>🎵 TikTok Video</p>
            <a href="${url}" target="_blank" class="fallback-link">
                Watch on TikTok
            </a>
        `;
        videoBox.appendChild(fallback);
        
        return videoBox;
    }

    createInstagramEmbed(url, index) {
        const videoBox = document.createElement('div');
        videoBox.className = 'video-box instagram-embed';
        
        // Instagram official embed
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'instagram-media';
        blockquote.setAttribute('data-instgrm-permalink', url);
        blockquote.setAttribute('data-instgrm-version', '14');
        blockquote.style.width = '100%';
        blockquote.style.maxWidth = '100%';
        
        videoBox.appendChild(blockquote);
        
        // Add fallback
        const fallback = document.createElement('div');
        fallback.className = 'embed-fallback';
        fallback.innerHTML = `
            <p>📷 Instagram Post</p>
            <a href="${url}" target="_blank" class="fallback-link">
                View on Instagram
            </a>
        `;
        videoBox.appendChild(fallback);
        
        return videoBox;
    }

    createTwitterEmbed(url, index) {
        const videoBox = document.createElement('div');
        videoBox.className = 'video-box twitter-embed';
        
        // Twitter official embed
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'twitter-tweet';
        
        const link = document.createElement('a');
        link.href = url;
        blockquote.appendChild(link);
        
        videoBox.appendChild(blockquote);
        
        // Add fallback
        const fallback = document.createElement('div');
        fallback.className = 'embed-fallback';
        fallback.innerHTML = `
            <p>🐦 Twitter Post</p>
            <a href="${url}" target="_blank" class="fallback-link">
                View on Twitter
            </a>
        `;
        videoBox.appendChild(fallback);
        
        return videoBox;
    }

    getYouTubeVideoId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    clearVideoGrid() {
        this.videoGrid.innerHTML = '';
    }

    resetForm() {
        this.platformSelect.value = '';
        this.videoUrlInput.value = '';
        this.videoUrlInput.placeholder = 'Paste video URL here...';
        this.boxCountSelect.value = '';
        this.streamBtn.disabled = true;
        this.videoUrl = '';
        this.selectedCount = 0;
        this.selectedPlatform = '';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MultiPlatformStreamApp();
});
