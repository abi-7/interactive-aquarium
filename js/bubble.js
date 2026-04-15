export class Bubble {
  constructor(x, y, state) {
    this.state = state;
    this.x = x ?? Math.random() * state.W;
    this.y = y ?? state.H + 10;
    this.r  = 2 + Math.random()*4.5;
    this.vy = -(0.45 + Math.random()*0.55);
    this.vx = (Math.random()-0.5)*0.25;
    this.t  = Math.random()*Math.PI*2;
    this.a  = 0.25 + Math.random()*0.3;
    this.life = 1;
  }

  update() {
    const { H } = this.state;
    this.y += this.vy;
    this.x += this.vx + Math.sin(this.t)*0.28;
    this.t  += 0.038;
    if (this.y < H*0.08) this.life -= 0.06;
  }

  draw() {
    const { ctx } = this.state;
    ctx.globalAlpha = this.a * this.life;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(180,235,255,0.9)';
    ctx.lineWidth   = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.x-this.r*0.3, this.y-this.r*0.3, this.r*0.28, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
