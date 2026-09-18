import { App } from './app/App';

document.addEventListener('DOMContentLoaded', () => {

    const root = document.getElementById('app-root');
    if (root) new App(root);

});