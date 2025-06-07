import { AppDispatcher, Action } from './Dispatcher';
import { NavigationActionsType} from './Actions';

export type State = {
    currentPath: string;
    users: []
};

type Listener = (state: State) => void;


class Store {
    private _myState: State = {
        currentPath: " ",
        users: []
    }
    // Los componentes
    private _listeners: Listener[] = [];

    constructor() {
        AppDispatcher.register(this._handleActions.bind(this)); // Bind the context of this method to the Store instance
    }

    getState() {
        return this._myState;
    }

    _handleActions(action: Action): void {
        switch (action.type) {
            case NavigationActionsType.NAVIGATE:
                this._myState = {
                    ...this._myState,
                    currentPath: action.payload
                }
                window.history.pushState({}, '', action.payload);
                this._emitChange();
                this.persist();
                break;
            case NavigationActionsType.UPDATE_PATH:
                this._myState = {
                    ...this._myState,
                    currentPath: action.payload
                }
                this._emitChange();
                this.persist();
                break;
            
        }

        // Persistir el estado en localStorage
        this.persist();
    }

    private _emitChange(): void {
        const state = this.getState();
        for (const listener of this._listeners) {
            listener(state);
        }
    }

    // Permite a los componentes suscribirse al store
    subscribe(listener: Listener): void {
        this._listeners.push(listener);
        listener(this.getState()); // Emitir estado actual al suscribirse
    }

    // Permite quitar la suscripción
    unsubscribe(listener: Listener): void {
        this._listeners = this._listeners.filter(l => l !== listener);
    }

    persist(): void {
        localStorage.setItem('flux:state', JSON.stringify(this._myState));
    }

    load(): void {
        const persistedState = localStorage.getItem('flux:state');
        if (persistedState) {
            this._myState = JSON.parse(persistedState);
            this._emitChange(); // Emitir el nuevo estado
        }
    }

}

export const store = new Store();