const anglePicker = document.querySelector('.angle_picker');
const angleIndicator = document.querySelector('.angle_indicator');
const angleText = document.getElementById('angleText');

let angle = 0;

anglePicker.addEventListener('mousedown', (e) => {
    const rect = anglePicker.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    function rotateIndicator(event) {
        const dx = event.clientX - centerX;
        const dy = event.clientY - centerY;
        angle = Math.atan2(dy, dx) * (180 / Math.PI);  // <-- removed 'let'
            
        // Normalize to [0, 360)
        angle = (angle + 360) % 360;
        angle = Math.floor(angle);
        
        angleText.innerHTML = angle.toFixed(2);  // Display with two decimal places
        angleIndicator.style.transform = `rotate(${angle}deg)`;
    }

    rotateIndicator(e);  // Set initial angle on mousedown

    document.addEventListener('mousemove', rotateIndicator);

    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', rotateIndicator);

        const angleEvent = new CustomEvent('angleChanged', {
            detail: { angle: angle }
        });
        document.dispatchEvent(angleEvent);
    });
});