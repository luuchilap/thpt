import { useEffect, useRef } from 'react';

export default function ParticleTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e) => {
      // Giảm tối đa lượng bụi: Chỉ 5% cơ hội tạo ra 1 hạt mỗi khi di chuyển chuột (rất thưa thớt)
      if (Math.random() > 0.05) return;
      
      particles.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 2, // bay nhẹ sang 2 bên
        vy: (Math.random() - 0.5) * 2 - 0.5, // nảy nhẹ lên
        life: 1, // opacity 1 to 0
        size: Math.random() * 1.5 + 1 // nhỏ hơn một chút (1px - 2.5px)
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Iterate backwards so splicing doesn't skip items
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity pulling down
        p.life -= 0.02; // decay speed
        
        if (p.life <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          // Highlight color: #facc15 -> rgb(250, 204, 21)
          ctx.fillStyle = `rgba(250, 204, 21, ${p.life})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
}
