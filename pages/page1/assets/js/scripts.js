document.addEventListener('DOMContentLoaded', function() {
    const arcadeBg = document.getElementById('arcade-bg');

    // Create flickering effect
    setInterval(function() {
        // Random flicker effect
        if (Math.random() > 0.97) {
            arcadeBg.style.opacity = (Math.random() * 0.4 + 0.6).toString();
            setTimeout(function() {
                arcadeBg.style.opacity = '1';
            }, 100);
        }
    }, 200);

    // Create floating pixel particles
    for (let i = 0; i < 50; i++) {
        createPixel();
    }

    function createPixel() {
        const pixel = document.createElement('div');
        pixel.className = 'pixel';

        // Random position
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;

        // Random size (small)
        const size = Math.random() * 15 + 1;

        // Random color (blue/cyan variations)
        const colors = ['#00f2ff', '#0cf', '#0af', '#08f', '#06f'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Apply styles
        pixel.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            left: ${posX}px;
            top: ${posY}px;
            opacity: ${Math.random() * 0.5 + 0.3};
            box-shadow: 0 0 ${size * 2}px ${color};
            animation: float ${Math.random() * 10 + 15}s linear infinite;
        `;

        arcadeBg.appendChild(pixel);
    }
});