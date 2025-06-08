import '../components/MemeUploader';
import '../components/MemeGallery';
import '../components/MemeViewer';
import { MemeMetadata} from '../services/supabase/storageService';

class Root extends HTMLElement {
    private memeViewer: HTMLElement | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        this.render();
        this.setupEventListeners();
    
    }

    private showError(message: string) {
        if (!this.shadowRoot) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #f44336;
            color: white;
            padding: 15px 30px;
            border-radius: 4px;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        errorDiv.textContent = message;
        this.shadowRoot.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    render() {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                h1 {
                    text-align: center;
                    color: #333;
                    margin-bottom: 30px;
                }

                meme-uploader {
                    margin-bottom: 40px;
                }

                meme-gallery {
                    margin-top: 20px;
                }
            </style>

            <h1>MemeWall</h1>
            <meme-uploader></meme-uploader>
            <meme-gallery></meme-gallery>
            <meme-viewer></meme-viewer>
        `;  

        this.memeViewer = this.shadowRoot.querySelector('meme-viewer');
    }

    private setupEventListeners() {
        if (!this.memeViewer) return;

        // Listen for meme selection from the gallery
        this.addEventListener('meme-selected', ((event: CustomEvent<MemeMetadata>) => {
            if (this.memeViewer && 'show' in this.memeViewer && typeof (this.memeViewer as { show: (meme: MemeMetadata) => void }).show === 'function') {
                (this.memeViewer as { show: (meme: MemeMetadata) => void }).show(event.detail);
            }
        }) as EventListener);
    }
}

export default Root;