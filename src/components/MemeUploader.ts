import { StorageService} from '../services/supabase/storageService';

export class MemeUploader extends HTMLElement {
    private uploadInput: HTMLInputElement | null = null;
    private progressBar: HTMLProgressElement | null = null;
    private uploadButton: HTMLButtonElement | null = null;

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
                    display: block;
                    padding: 20px;
                    background: #f5f5f5;
                    border-radius: 8px;
                    margin: 20px 0;
                }

                .upload-container {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    align-items: center;
                }

                .file-input-container {
                    position: relative;
                    width: 100%;
                    max-width: 300px;
                }

                input[type="file"] {
                    display: none;
                }

                .custom-file-input {
                    display: inline-block;
                    padding: 12px 24px;
                    background: #4CAF50;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    text-align: center;
                    transition: background 0.3s;
                }

                .custom-file-input:hover {
                    background: #45a049;
                }

                progress {
                    width: 100%;
                    height: 20px;
                    border-radius: 10px;
                    display: none;
                }

                progress::-webkit-progress-bar {
                    background-color: #f0f0f0;
                    border-radius: 10px;
                }

                progress::-webkit-progress-value {
                    background-color: #4CAF50;
                    border-radius: 10px;
                }

                button {
                    padding: 12px 24px;
                    background: #2196F3;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                button:hover {
                    background: #1976D2;
                }

                button:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }

                .error-message {
                    color: #f44336;
                    margin-top: 10px;
                    display: none;
                }
            </style>

            <div class="upload-container">
                <div class="file-input-container">
                    <input type="file" id="memeInput" accept="image/*,video/*" multiple>
                    <label for="memeInput" class="custom-file-input">Select Memes</label>
                </div>
                <progress id="uploadProgress" value="0" max="100"></progress>
                <button id="uploadButton" disabled>Upload Memes</button>
                <div id="errorMessage" class="error-message"></div>
            </div>
        `;

        this.uploadInput = this.shadowRoot.querySelector('#memeInput');
        this.progressBar = this.shadowRoot.querySelector('#uploadProgress');
        this.uploadButton = this.shadowRoot.querySelector('#uploadButton');
    }

    private setupEventListeners() {
        if (!this.uploadInput || !this.uploadButton) return;

        this.uploadInput.addEventListener('change', () => {
            if (this.uploadButton) {
                this.uploadButton.disabled = !this.uploadInput?.files?.length;
            }
        });

        this.uploadButton.addEventListener('click', async () => {
            if (!this.uploadInput?.files?.length) return;

            const files = Array.from(this.uploadInput.files);
            await this.uploadFiles(files);
        });
    }

    private async uploadFiles(files: File[]) {
        if (!this.progressBar || !this.uploadButton) return;

        console.log('Starting upload of files:', files.map(f => f.name));
        this.progressBar.style.display = 'block';
        this.uploadButton.disabled = true;

        for (const file of files) {
            try {
                console.log('Uploading file:', file.name, 'Type:', file.type, 'Size:', file.size);
                const result = await StorageService.uploadMeme({
                    file,
                    onProgress: (progress) => {
                        console.log('Upload progress:', progress, '%');
                        if (this.progressBar) {
                            this.progressBar.value = progress;
                        }
                    }
                });

                console.log('Upload result:', result);
                if (result) {
                    console.log('Dispatching meme-uploaded event');
                    this.dispatchEvent(new CustomEvent('meme-uploaded', {
                        detail: result,
                        bubbles: true,
                        composed: true
                    }));
                } else {
                    console.error('Upload failed - no result returned');
                    this.showError('Error uploading file: ' + file.name);
                }
            } catch (error) {
                console.error('Error in uploadFiles:', error);
                this.showError('Error uploading file: ' + file.name);
            }
        }

        // Reset the form
        if (this.uploadInput) {
            this.uploadInput.value = '';
        }
        this.progressBar.style.display = 'none';
        this.progressBar.value = 0;
        this.uploadButton.disabled = true;
    }

    private showError(message: string) {
        const errorElement = this.shadowRoot?.querySelector('#errorMessage') as HTMLElement;
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }
}

customElements.define('meme-uploader', MemeUploader); 