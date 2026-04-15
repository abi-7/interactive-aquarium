export class FoodPellet {
  constructor(x, y, state) {
    this.state = state;
    this.x    = x;
    this.y    = y;
    this.vy   = 0.4 + Math.random() * 0.3;
    this.vx   = (Math.random()-0.5) * 0.5;
    this.r    = 3 + Math.random() * 2;
    this.life = 1;
    this.eaten= false;
    this.t    = Math.random()*Math.PI*2;
  }

  update(dt = 1) {
    const { H } = this.state;
    this.t  += 0.04 * dt;
    this.vy += 0.015 * dt;
    this.y  += this.vy * dt;
    this.x  += (this.vx + Math.sin(this.t)*0.2) * dt;
    if (this.y > H * 0.92) this.life -= 0.02 * dt;
  }

  draw() {
    const { ctx } = this.state;
    ctx.globalAlpha = this.life;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    const g = ctx.createRadialGradient(this.x-this.r*0.3, this.y-this.r*0.3, 0, this.x, this.y, this.r);
    g.addColorStop(0, '#ffe8a0');
    g.addColorStop(1, '#c8860a');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
