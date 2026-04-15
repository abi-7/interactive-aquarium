import { lighten, darken } from './utils.js';

// [bodyCol, finCol, accentCol, tailCol, sizeScale, type]
export const SPECIES = [
  ['#ff6b35','#ff9f1c','#fff','#e85d04',1.0,'clown'],
  ['#4ecdc4','#2b9eb3','#e0ffff','#1a7a8a',0.9,'tang'],
  ['#ffd60a','#ffb703','#fff','#e09a00',0.78,'yellow'],
  ['#c77dff','#7b2fff','#fff','#5a0fa0',0.88,'purple'],
  ['#ff6b9d','#c9184a','#fff','#a4133c',0.72,'pink'],
  ['#52b788','#2d6a4f','#fff','#1b4332',0.95,'green'],
  ['#f4a261','#e76f51','#fff','#e63946',0.82,'orange'],
  ['#74c0fc','#4dabf7','#fff','#1c7ed6',1.05,'blue'],
  ['#ffb347','#ff8c00','#fff','#cc5500',0.65,'tiny'],
  ['#b5e48c','#76c442','#fff','#52b788',0.88,'lime'],
];

export class Fish {
  constructor(i, state) {
    this.state = state;
    const sp = SPECIES[i % SPECIES.length];
    [this.bc, this.fc, this.ac, this.tc, this.sc, this.type] = sp;
    this.bcLight = lighten(this.bc, 0.45);
    this.bcDark  = darken(this.bc, 0.45);
    this.depth = 0.55 + Math.random()*0.45;
    this.sz    = (26 + this.sc*18) * this.depth;
    this.x     = Math.random() * state.W;
    this.y     = state.H*0.12 + Math.random()*state.H*0.72;
    this.vx    = (Math.random()-0.5)*1.4;
    this.vy    = (Math.random()-0.5)*0.5;
    this.angle = 0;
    this.wob   = Math.random()*Math.PI*2;
    this.wSpd  = 0.055 + Math.random()*0.035;
    this.fear  = 0;
    this.fvx   = 0; this.fvy = 0;
    this.facingLeft = Math.random() < 0.5;
  }

  update(dt = 1) {
    const { handSeen, handX, handY, handVX, handVY, W, H } = this.state;
    this.wob += this.wSpd * dt;

    // Repulsion from hand
    if (handSeen) {
      const dx = this.x - handX;
      const dy = this.y - handY;
      const d2 = dx*dx + dy*dy;
      const R  = 300;
      if (d2 < R*R) {
        const d   = Math.sqrt(d2) || 1;
        const inf = Math.pow(1 - d/R, 1.5);
        this.fear = Math.min(1, this.fear + inf*0.55*dt);
        const str = inf * 22;
        this.fvx += (dx/d)*str*dt + handVX*inf*1.2;
        this.fvy += (dy/d)*str*dt + handVY*inf*1.2;
      }
    }

    this.fear *= Math.pow(0.91, dt);
    this.fvx  *= Math.pow(0.82, dt);
    this.fvy  *= Math.pow(0.82, dt);

    this.vx += (Math.random()-0.5)*0.07*dt;
    this.vy += (Math.random()-0.5)*0.05*dt;
    this.vy += (H*0.5 - this.y)*0.00009*dt;

    const topSpeed = this.fear > 0.15 ? 14 : 2.5;
    const fx = this.vx + this.fvx;
    const fy = this.vy + this.fvy;
    const spd = Math.sqrt(fx*fx + fy*fy);
    if (spd > topSpeed) {
      this.vx = (fx/spd)*topSpeed - this.fvx;
      this.vy = (fy/spd)*topSpeed - this.fvy;
    }

    this.x += fx * dt; this.y += fy * dt;

    const m = 70;
    if (this.x < m)     this.vx += 0.5*dt;
    if (this.x > W - m) this.vx -= 0.5*dt;
    if (this.y < H*0.06) this.vy += 0.35*dt;
    if (this.y > H*0.93) this.vy -= 0.35*dt;

    const ta = Math.atan2(fy, fx);
    // Clamp to -70°..+70° so fish never flip upside down
    const MAX_TILT = Math.PI * 0.38;
    let da = ta - this.angle;
    while (da >  Math.PI) da -= 2*Math.PI;
    while (da < -Math.PI) da += 2*Math.PI;
    this.angle += da * 0.13;
    this.angle = Math.max(-MAX_TILT, Math.min(MAX_TILT, this.angle));
    // Track facing direction separately so we flip sprite, not rotate it
    if (Math.abs(fx) > 0.1) this.facingLeft = fx < 0;
  }

  draw() {
    const { ctx } = this.state;
    const s   = this.sz;
    const tw  = Math.sin(this.wob) * (this.fear > 0.3 ? 0.38 : 0.22);
    const scared = this.fear > 0.3;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.facingLeft ? -this.angle : this.angle);
    if (this.facingLeft) ctx.scale(-1, 1);

    // Tail
    ctx.beginPath();
    ctx.moveTo(-s*0.53, 0);
    ctx.lineTo(-s*1.05, -s*0.42 + tw*s*0.7);
    ctx.quadraticCurveTo(-s*0.75, tw*s*0.3, -s*0.53, 0);
    ctx.lineTo(-s*1.05,  s*0.42 + tw*s*0.7);
    ctx.quadraticCurveTo(-s*0.75, tw*s*0.3, -s*0.53, 0);
    ctx.closePath();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = this.tc;
    ctx.fill();

    // Pectoral fin
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.ellipse(s*0.05, s*0.28, s*0.26, s*0.1, 0.55, 0, Math.PI*2);
    ctx.fillStyle = this.fc;
    ctx.fill();

    // Body
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.ellipse(s*0.06, 0, s*0.58, s*0.38, 0, 0, Math.PI*2);
    ctx.fillStyle = this.bc;
    ctx.fill();

    // Body highlight
    ctx.beginPath();
    ctx.ellipse(s*0.0, -s*0.08, s*0.32, s*0.18, -0.2, 0, Math.PI*2);
    ctx.fillStyle = this.bcLight;
    ctx.globalAlpha = 0.45;
    ctx.fill();

    // Belly
    ctx.beginPath();
    ctx.ellipse(s*0.1, s*0.14, s*0.28, s*0.15, 0.2, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();

    // Clownfish stripes
    if (this.type === 'clown') {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(-s*0.08, 0, s*0.065, s*0.36, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse( s*0.3,  0, s*0.05,  s*0.3,  0, 0, Math.PI*2); ctx.fill();
    }

    // Dorsal fin
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(s*0.28, -s*0.34);
    ctx.bezierCurveTo(s*0.18, -s*0.7, -s*0.1, -s*0.68, -s*0.22, -s*0.35);
    ctx.quadraticCurveTo(0, -s*0.28, s*0.28, -s*0.34);
    ctx.closePath();
    ctx.fillStyle = this.fc;
    ctx.fill();

    // Eye
    ctx.globalAlpha = 1;
    const ex = s*0.36, ey = -s*0.06, er = s*0.13;
    ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI*2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex+er*0.08, ey+er*0.08, er*0.65, 0, Math.PI*2);
    ctx.fillStyle = scared ? '#300' : '#1a1a2e'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex+er*0.1, ey+er*0.1, er*0.35, 0, Math.PI*2);
    ctx.fillStyle = '#000'; ctx.fill();
    ctx.beginPath(); ctx.arc(ex-er*0.1, ey-er*0.15, er*0.26, 0, Math.PI*2);
    ctx.fillStyle = '#fff'; ctx.fill();

    // Mouth
    if (scared) {
      ctx.beginPath();
      ctx.arc(ex-er*0.5, ey+er*1.05, er*0.18, 0, Math.PI*2);
      ctx.fillStyle = this.bcDark; ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(ex-er*0.45, ey+er*0.85, er*0.26, 0.1, Math.PI-0.1);
      ctx.strokeStyle = this.bcDark;
      ctx.lineWidth = s*0.03; ctx.lineCap = 'round';
      ctx.globalAlpha = 0.75; ctx.stroke();
    }

    // Fear glow
    if (this.fear > 0.3) {
      ctx.globalAlpha = (this.fear-0.3)*0.55;
      ctx.beginPath();
      ctx.ellipse(s*0.06, 0, s*0.62, s*0.42, 0, 0, Math.PI*2);
      ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 2.5; ctx.stroke();
    }

    ctx.restore();
  }
}
