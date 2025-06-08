import { MemeMetadata } from '../services/supabase/storageService';

export class MemeViewer extends HTMLElement {
    private meme: MemeMetadata | null = null;
    private modal: HTMLDivElement | null = null;
    private closeButton: HTMLButtonElement | null = null;
    private mediaContainer: HTMLDivElement | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    private render() {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: none;
                }

                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .modal.active {
                    opacity: 1;
                }

                .modal-content {
                    position: relative;
                    max-width: 90vw;
                    max-height: 90vh;
                    background: #fff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }

                .media-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .media-container img,
                .media-container video {
                    max-width: 100%;
                    max-height: 90vh;
                    object-fit: contain;
                }

                .close-button {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.5);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    font-size: 20px;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: background 0.3s;
                    z-index: 1;
                }

                .close-button:hover {
                    background: rgba(0, 0, 0, 0.8);
                }

                .meme-info {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 10px;
                    font-size: 14px;
                }

                .meme-name {
                    margin: 0;
                    font-weight: bold;
                }

                .meme-date {
                    margin: 5px 0 0;
                    opacity: 0.8;
                    font-size: 12px;
                }
            </style>

            <div class="modal" id="modal">
                <div class="modal-content">
                    <button class="close-button" id="closeButton">&times;</button>
                    <div class="media-container" id="mediaContainer"></div>
                    <div class="meme-info">
                        <h3 class="meme-name"></h3>
                        <p class="meme-date"></p>
                    </div>
                </div>
            </div>
        `;

        this.modal = this.shadowRoot.querySelector('#modal');
        this.closeButton = this.shadowRoot.querySelector('#closeButton');
        this.mediaContainer = this.shadowRoot.querySelector('#mediaContainer');
    }

    private setupEventListeners() {
        if (!this.closeButton || !this.modal) return;

        this.closeButton.addEventListener('click', () => {
            this.hide();
        });

        this.modal.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.hide();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modal?.classList.contains('active')) {
                this.hide();
            }
        });
    }

    public show(meme: MemeMetadata) {
        if (!this.modal || !this.mediaContainer) return;

        this.meme = meme;
        this.style.display = 'block';

        // Update content
        const mediaElement = meme.type.startsWith('video/')
            ? `<video src="${meme.url}" controls autoplay loop></video>`
            : `<img src="${meme.url}" alt="${meme.name}">`;

        this.mediaContainer.innerHTML = mediaElement;

        // Update info
        const nameElement = this.shadowRoot?.querySelector('.meme-name');
        const dateElement = this.shadowRoot?.querySelector('.meme-date');

        if (nameElement) {
            nameElement.textContent = meme.name;
        }
        if (dateElement) {
            dateElement.textContent = new Date(meme.created_at).toLocaleDateString();
        }

        // Show modal with animation
        requestAnimationFrame(() => {
            this.modal?.classList.add('active');
        });
    }

    private hide() {
        if (!this.modal) return;

        this.modal.classList.remove('active');
        setTimeout(() => {
            this.style.display = 'none';
            this.meme = null;
            if (this.mediaContainer) {
                this.mediaContainer.innerHTML = '';
            }
        }, 300);
    }
}

customElements.define('meme-viewer', MemeViewer); 