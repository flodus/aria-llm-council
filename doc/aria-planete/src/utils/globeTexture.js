// ==================== src/utils/globeTexture.js ====================
import { WORLD_DATA } from '../data/world';
import * as THREE from 'three';

export function createGlobeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Océan
    ctx.fillStyle = '#1a3f6a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner chaque continent
    WORLD_DATA.continents.forEach(continent => {
        ctx.fillStyle = continent.color;
        ctx.beginPath();

        continent.path.forEach((point, i) => {
            const x = point[0] * canvas.width;
            const y = point[1] * canvas.height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

            ctx.closePath();
            ctx.fill();

            // Contour noir
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.stroke();
    });

    return new THREE.CanvasTexture(canvas);
}
