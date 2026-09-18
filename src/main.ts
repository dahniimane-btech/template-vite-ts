import { App } from './app/App';

document.addEventListener('DOMContentLoaded', () => {

    const root = document.getElementById('game-container');
    if (root) new App(root);

});