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
                embed: (url) => this.createYouTubeEmbed(url)
            },
            facebook: {
                name: 'Facebook',
                icon: '📘',
                regex: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+$/,
                embed: (url) => this.createFacebookEmbed(url)
            },
            tiktok: {
                name: 'TikTok',
                icon: '🎵',
                regex: /^(https?:\/\/)?(www\.)?tiktok\.com\/.+/,
                embed: (url) => this.createTikTokEmbed(url)
            },
            instagram: {
                name: 'Instagram',
                icon: '📷',
                regex: /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel)\/.+/,
                embed: (url) => this.createInstagramEmbed(url)
            },
            twitter: {
                name: 'Twitter/X',
                icon: '🐦',
                regex: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+/,
                embed: (url) => this.createTwitterEmbed(url)
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
        
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=1&mute=1`;
        iframe.allow = 'autoplay; encrypted-media';
        iframe.allowFullscreen = true;
        iframe.title = `Facebook Video ${index + 1}`;
        
        videoBox.appendChild(iframe);
        return videoBox;
    }

    createTikTokEmbed(url, index) {
        const videoBox = document.createElement('div');
        videoBox.className = 'video-box tiktok-embed';
        
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'tiktok-embed';
        blockquote.setAttribute('cite', url);
        blockquote.setAttribute('data-video-id', `tiktok-${index}`);
        
        const section = document.createElement('section');
        blockquote.appendChild(section);
        
        videoBox.appendChild(blockquote);
        
        // Load TikTok embed script if not already loaded
        if (!window.tiktokEmbedLoaded) {
            const script = document.createElement('script');
            script.src = 'https://www.tiktok.com/embed.js';
            script.async = true;
            document.head.appendChild(script);
            window.tiktokEmbedLoaded = true;
        }
        
        return videoBox;
    }

    createInstagramEmbed(url, index) {
        const videoBox = document.createElement('div');
        videoBox.className = 'video-box instagram-embed';
        
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'instagram-media';
        blockquote.setAttribute('data-instgrm-permalink', url);
        blockquote.setAttribute('data-instgrm-version', '14');
        
        videoBox.appendChild(blockquote);
        
        // Load Instagram embed script if not already loaded
        if (!window.instagramEmbedLoaded) {
            const script = document.createElement('script');
            script.src = 'https://www.instagram.com/embed.js';
            script.async = true;
            document.head.appendChild(script);
            window.instagramEmbedLoaded = true;
        }
        
        return videoBox;
    }

    createTwitterEmbed(url, index) {
        const videoBox = document.createElement('div');
        videoBox.className = 'video-box twitter-embed';
        
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'twitter-tweet';
        
        const link = document.createElement('a');
        link.href = url;
        blockquote.appendChild(link);
        
        videoBox.appendChild(blockquote);
        
        // Load Twitter embed script if not already loaded
        if (!window.twitterEmbedLoaded) {
            const script = document.createElement('script');
            script.src = 'https://platform.twitter.com/widgets.js';
            script.async = true;
            script.charset = 'utf-8';
            document.head.appendChild(script);
            window.twitterEmbedLoaded = true;
        }
        
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
