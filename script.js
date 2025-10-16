class VideoStreamApp {
    constructor() {
        this.maxBoxes = 20;
        this.videoUrl = '';
        this.selectedCount = 0;
        
        this.initializeElements();
        this.populateDropdown();
        this.attachEventListeners();
    }

    initializeElements() {
        // Input section elements
        this.inputSection = document.getElementById('inputSection');
        this.videoUrlInput = document.getElementById('videoUrl');
        this.pasteBtn = document.getElementById('pasteBtn');
        this.boxCountSelect = document.getElementById('boxCount');
        this.streamBtn = document.getElementById('streamBtn');
        
        // Video section elements
        this.videoSection = document.getElementById('videoSection');
        this.videoGrid = document.getElementById('videoGrid');
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

    async handlePaste() {
        try {
            const text = await navigator.clipboard.readText();
            this.videoUrlInput.value = text;
            this.videoUrlInput.focus();
            
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

    validateInput() {
        const url = this.videoUrlInput.value.trim();
        const count = parseInt(this.boxCountSelect.value);
        
        const isValidUrl = this.isValidYouTubeUrl(url);
        const isValidCount = count > 0 && count <= this.maxBoxes;
        
        this.streamBtn.disabled = !(isValidUrl && isValidCount);
        
        return isValidUrl && isValidCount;
    }

    isValidYouTubeUrl(url) {
        // Basic YouTube URL validation
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return youtubeRegex.test(url);
    }

    getVideoId(url) {
        // Extract video ID from various YouTube URL formats
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    handleStream() {
        if (!this.validateInput()) {
            alert('Please enter a valid YouTube URL and select number of boxes.');
            return;
        }

        this.videoUrl = this.videoUrlInput.value.trim();
        this.selectedCount = parseInt(this.boxCountSelect.value);
        
        this.showVideoSection();
        this.generateVideoBoxes();
    }

    showVideoSection() {
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
        
        const videoId = this.getVideoId(this.videoUrl);
        if (!videoId) {
            alert('Invalid YouTube URL. Please check the link and try again.');
            this.showInputSection();
            return;
        }

        for (let i = 0; i < this.selectedCount; i++) {
            const videoBox = this.createVideoBox(videoId, i);
            this.videoGrid.appendChild(videoBox);
        }
    }

    createVideoBox(videoId, index) {
        const videoBox = document.createElement('div');
        videoBox.className = 'video-box';
        
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&enablejsapi=1`;
        iframe.allow = 'autoplay; encrypted-media';
        iframe.allowFullscreen = true;
        iframe.title = `YouTube Video ${index + 1}`;
        
        videoBox.appendChild(iframe);
        return videoBox;
    }

    clearVideoGrid() {
        this.videoGrid.innerHTML = '';
    }

    resetForm() {
        this.videoUrlInput.value = '';
        this.boxCountSelect.value = '';
        this.streamBtn.disabled = true;
        this.videoUrl = '';
        this.selectedCount = 0;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VideoStreamApp();
});
