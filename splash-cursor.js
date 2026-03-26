class Particle {
    constructor(x, y, dx, dy, color, size) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.color = color;
        this.size = size;
        this.life = 1;
        this.baseDecay = Math.random() * 0.02 + 0.015;
    }
    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.life -= this.baseDecay;
        this.size *= 0.95;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life})`;
        ctx.fill();
    }
}

class SplashCursor {
    constructor(container) {
        this.container = container;
        if (!this.container) return;

        if (getComputedStyle(this.container).position === 'static') {
            this.container.style.position = 'relative';
        }
        
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '0'; 
        
        // Ensure child elements of hero stay above canvas
        Array.from(this.container.children).forEach(child => {
            if (child !== this.canvas && getComputedStyle(child).zIndex === 'auto') {
                child.style.position = child.style.position === 'static' ? 'relative' : child.style.position;
                child.style.zIndex = '10';
            }
        });

        this.container.insertBefore(this.canvas, this.container.firstChild);
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.colors = [
            {r: 255, g: 138, b: 172}, // pink #ff8aac
            {r: 155, g: 143, b: 201}, // purple
            {r: 100, g: 100, b: 100}  // gray
        ];
        
        this.mouse = { x: -100, y: -100, dx: 0, dy: 0 };
        this.lastMouse = { x: -100, y: -100 };
        this.isHovering = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.container.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.container.addEventListener('mouseenter', () => this.isHovering = true);
        this.container.addEventListener('mouseleave', () => this.isHovering = false);
        this.container.addEventListener('click', (e) => this.onClick(e));
        
        this.animate();
    }
    
    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    updateMousePos(clientX, clientY) {
        const rect = this.container.getBoundingClientRect();
        this.lastMouse.x = this.mouse.x;
        this.lastMouse.y = this.mouse.y;
        this.mouse.x = clientX - rect.left;
        this.mouse.y = clientY - rect.top;
        this.mouse.dx = this.mouse.x - this.lastMouse.x;
        this.mouse.dy = this.mouse.y - this.lastMouse.y;
    }
    
    onMouseMove(e) {
        this.updateMousePos(e.clientX, e.clientY);
        if (Math.abs(this.mouse.dx) > 1 || Math.abs(this.mouse.dy) > 1) {
            this.addParticles(3);
        }
    }
    
    onTouchMove(e) {
        if(e.touches.length > 0) {
            this.updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
            this.addParticles(3);
        }
    }
    
    onClick(e) {
        this.updateMousePos(e.clientX, e.clientY);
        this.addParticles(20, true);
    }
    
    addParticles(count, isClick = false) {
        for(let i=0; i<count; i++) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const size = Math.random() * 6 + 3;
            let dx, dy;
            
            if (isClick) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 2;
                dx = Math.cos(angle) * speed;
                dy = Math.sin(angle) * speed;
            } else {
                dx = this.mouse.dx * 0.1 + (Math.random() - 0.5) * 2;
                dy = this.mouse.dy * 0.1 + (Math.random() - 0.5) * 2;
            }
            
            this.particles.push(new Particle(this.mouse.x, this.mouse.y, dx, dy, color, size));
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for(let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            p.draw(this.ctx);
            if(p.life <= 0 || p.size <= 0.5) {
                this.particles.splice(i, 1);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Only target the hero section as requested
    const hero = document.getElementById('hero');
    if (hero) {
        new SplashCursor(hero);
    }
});
