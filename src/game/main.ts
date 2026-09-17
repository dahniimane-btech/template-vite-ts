import { AUTO, Game, Scale } from 'phaser';
import { Game as BottleGame } from './scenes/Game';

export default function StartGame(parent: string) {
    return new Game({
        type: AUTO,
        parent,
        width: 1000,
        height: 370,
        transparent: true,
        antialias: true,
        scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH },
        scene: [BottleGame],
    });
}
