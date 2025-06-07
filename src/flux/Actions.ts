import { AppDispatcher } from './Dispatcher';

export const NavigationActionsType = {
    NAVIGATE: 'NAVIGATE',
    UPDATE_PATH: 'UPDATE_PATH'
} as const;


export const NavigationActions = {
    navigate: (path: string) => {
        AppDispatcher.dispatch({
            type: NavigationActionsType.NAVIGATE,
            payload: path
        });
    },
    updatePath: (path: string) => {
        AppDispatcher.dispatch({
            type: NavigationActionsType.UPDATE_PATH,
            payload: path
        });
    }
}