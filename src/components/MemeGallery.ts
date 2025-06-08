import { StorageService, MemeMetadata } from '../services/supabase/storageService';

export class MemeGallery extends HTMLElement {
    private memes: MemeMetadata[] = [];
    private sortOrder: 'date' | 'random' = 'date';
    private gridContainer: HTMLDivElement | null = null;
    private sortButton: HTMLButtonElement | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.loadMemes();
        this.setupEventListeners();
    }

    private render() {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    padding: 20px;
                }

                .gallery-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .sort-button {
                    padding: 8px 16px;
                    background: #2196F3;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .sort-button:hover {
                    background: #1976D2;
                }

                .grid-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 20px;
                    padding: 20px 0;
                }

                .meme-card {
                    position: relative;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    transition: transform 0.3s;
                    cursor: pointer;
                    aspect-ratio: 1;
                }

                .meme-card:hover {
                    transform: scale(1.02);
                }

                .meme-card img,
                .meme-card video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .meme-card video {
                    background: #000;
                }

                .loading {
                    text-align: center;
                    padding: 20px;
                    font-size: 1.2em;
                    color: #666;
                }

                .error {
                    color: #f44336;
                    text-align: center;
                    padding: 20px;
                }
            </style>

            <div class="gallery-header">
                <h2>Meme Gallery</h2>
                <button class="sort-button" id="sortButton">Sort by Date</button>
            </div>
            <div class="grid-container" id="gridContainer">
                <div class="loading">Loading memes...</div>
            </div>
        `;

        this.gridContainer = this.shadowRoot.querySelector('#gridContainer');
        this.sortButton = this.shadowRoot.querySelector('#sortButton');
    }

    private setupEventListeners() {
        if (!this.sortButton) return;

        this.sortButton.addEventListener('click', () => {
            this.sortOrder = this.sortOrder === 'date' ? 'random' : 'date';
            this.sortButton!.textContent = `Sort by ${this.sortOrder === 'date' ? 'Random' : 'Date'}`;
            this.renderMemes();
        });

        // Listen for new meme uploads
        this.addEventListener('meme-uploaded', () => {
            this.loadMemes();
        });
    }

    private async loadMemes() {
        if (!this.gridContainer) return;

        try {
            this.memes = await StorageService.getMemes();
            this.renderMemes();
        } catch (error) {
            console.log(error);
            this.gridContainer.innerHTML = `
                <div class="error">
                    Error loading memes. Please try again later.
                </div>
            `;
        }
    }

    private renderMemes() {
        if (!this.gridContainer) return;

        const sortedMemes = [...this.memes];
        if (this.sortOrder === 'random') {
            sortedMemes.sort(() => Math.random() - 0.5);
        }

        this.gridContainer.innerHTML = sortedMemes.map(meme => `
            <div class="meme-card" data-id="${meme.id}">
                ${meme.type.startsWith('video/') 
                    ? `<video src="${meme.url}" muted loop playsinline></video>`
                    : `<img src="${meme.url}" alt="${meme.name}">`
                }
            </div>
        `).join('');

        // Add click handlers for each meme
        this.gridContainer.querySelectorAll('.meme-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                const meme = this.memes.find(m => m.id === id);
                if (meme) {
                    this.dispatchEvent(new CustomEvent('meme-selected', {
                        detail: meme,
                        bubbles: true,
                        composed: true
                    }));
                }
            });
        });

        // Start playing videos
        this.gridContainer.querySelectorAll('video').forEach(video => {
            video.play().catch(() => {
                // Auto-play might be blocked by the browser
                console.log('Video autoplay was blocked');
            });
        });
    }
}

customElements.define('meme-gallery', MemeGallery); 