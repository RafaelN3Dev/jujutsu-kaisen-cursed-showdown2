export class Player {
    constructor({ position, velocity, color, name, domain }) {
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.name = name;
        this.domainName = domain || "DOMÍNIO SIMPLES";
        this.width = 65;
        this.height = 165;
        this.health = 1000;
        this.energy = 0;
        this.maxEnergy = 100;
        this.gravity = 0.8;
        this.onGround = false;
        this.facing = name.includes('Sukuna') ? -1 : 1;

        this.attackBox = {
            position: { x: this.position.x, y: this.position.y },
            width: 140,
            height: 70
        };
        this.isAttacking = false;
        this.lastAttackType = 'light';
        this.frameCounter = 0;
        this.isHit = false;

        this.isJackpot = false;
        this.isRikaManifested = false;
    }

    draw(ctx) {
        ctx.save();
        this.frameCounter++;
        const breathe = Math.sin(this.frameCounter * 0.1) * 3;
        const currentY = this.position.y + breathe;

        if (this.energy > 80 || this.isJackpot || this.isRikaManifested) {
            ctx.shadowBlur = 40;
            ctx.shadowColor = this.color;
        }

        this.drawCharacterDetails(ctx, currentY);

        if (this.isAttacking) {
            this.drawAttackEffect(ctx, currentY);
        }

        if (this.isHit) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillRect(this.position.x, currentY, this.width, this.height);
        }

        ctx.restore();
    }

    drawCharacterDetails(ctx, y) {
        const x = this.position.x;
        const w = this.width;

        ctx.fillStyle = this.name.includes('Yuta') ? '#e6e6e6' : '#0a0a0f';
        ctx.fillRect(x, y + 35, w, this.height - 35);

        ctx.fillStyle = '#ffe0bd';

        if (this.name.includes('Gojo')) {
            ctx.fillRect(x + 5, y, w - 10, 45);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x - 2, y - 10, w + 4, 15);
            ctx.fillStyle = '#000';
            ctx.fillRect(x, y + 18, w, 14);
        } else if (this.name.includes('Sukuna')) {
            ctx.fillStyle = '#ffd1d1';
            ctx.fillRect(x + 5, y, w - 10, 45);
            ctx.fillStyle = '#ff79c6';
            ctx.fillRect(x, y - 5, w, 15);
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 8, y + 25, 48, 3);
        } else if (this.name.includes('Itadori')) {
            ctx.fillRect(x + 5, y, w - 10, 40);
            ctx.fillStyle = '#f32121';
            ctx.fillRect(x, y + 35, w, 15);
            ctx.fillStyle = '#ff5e57';
            ctx.fillRect(x + 5, y - 8, w - 10, 10);
        } else if (this.name.includes('Choso')) {
            ctx.fillRect(x + 5, y, w - 10, 40);
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 5, y + 20, w - 10, 4);
            ctx.fillStyle = '#222';
            ctx.fillRect(x - 5, y - 5, 20, 20); ctx.fillRect(x + w - 15, y - 5, 20, 20);
        } else {
            ctx.fillRect(x + 5, y, w - 10, 40);
            ctx.fillStyle = this.color;
            ctx.fillRect(x, y - 8, w, 12);
        }
    }

    drawAttackEffect(ctx, y) {
        ctx.save();
        const attackX = this.facing === 1 ? this.position.x + this.width : this.position.x - this.attackBox.width;

        if (this.lastAttackType === 'special') {
            this.drawSpecialMove(ctx, attackX, y);
        } else if (this.lastAttackType === 'ultimate') {
            this.drawUltimateMove(ctx);
        } else {
            ctx.fillStyle = 'white';
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.ellipse(attackX + this.attackBox.width / 2, y + 80, 40, 70, this.facing === 1 ? 0.3 : -0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawSpecialMove(ctx, x, y) {
        ctx.shadowBlur = 50;
        ctx.shadowColor = this.color;

        if (this.name.includes('Gojo')) {
            ctx.fillStyle = '#00d2ff'; ctx.beginPath();
            ctx.arc(x + (this.facing === 1 ? 50 : 350), y + 80, 65, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.name.includes('Sukuna')) {
            ctx.strokeStyle = '#ff3333'; ctx.lineWidth = 4;
            for (let i = 0; i < 7; i++) {
                ctx.beginPath();
                ctx.moveTo(x, y - 20 + (i * 40));
                ctx.lineTo(x + 450, y + 10 + (i * 40));
                ctx.stroke();
            }
        } else if (this.name.includes('Choso')) {
            ctx.fillStyle = '#641e16';
            ctx.fillRect(x, y + 75, 500, 15);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(x, y + 50, 350, 40);
        }
    }

    drawUltimateMove(ctx) {
        ctx.globalAlpha = 0.7; ctx.fillStyle = '#000';
        ctx.fillRect(-1000, -1000, 5000, 5000); ctx.globalAlpha = 1;

        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 100; ctx.shadowColor = this.color;
        ctx.font = '900 80px Outfit'; ctx.textAlign = 'center';
        ctx.fillText(this.domainName, 640, 350);

        if (this.name.includes('Hakari') && !this.isJackpot) {
            this.isJackpot = true; setTimeout(() => { this.isJackpot = false; }, 15000);
        } else if (this.name.includes('Yuta') && !this.isRikaManifested) {
            this.isRikaManifested = true; setTimeout(() => { this.isRikaManifested = false; }, 10000);
        }

        ctx.strokeStyle = this.color; ctx.lineWidth = 15;
        ctx.beginPath(); ctx.arc(640, 360, (this.frameCounter * 12) % 900, 0, Math.PI * 2); ctx.stroke();
    }

    update(ctx) {
        this.draw(ctx);
        if (this.isJackpot) {
            this.health = Math.min(1000, this.health + 4);
            this.energy = 100;
        }
        if (this.velocity.x > 0) this.facing = 1;
        else if (this.velocity.x < 0) this.facing = -1;

        this.attackBox.position.x = this.facing === 1 ? this.position.x + this.width : this.position.x - this.attackBox.width;
        this.attackBox.position.y = this.position.y + 50;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y >= 720 - 50) {
            this.velocity.y = 0;
            this.position.y = 720 - 50 - this.height;
            this.onGround = true;
        } else {
            this.velocity.y += this.gravity;
            this.onGround = false;
        }

        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > 1280) this.position.x = 1280 - this.width;
    }

    attack(type) {
        this.lastAttackType = type;
        this.isAttacking = true;
        this.attackBox.width = (type === 'special' || type === 'ultimate') ? 500 : 160;
        setTimeout(() => { this.isAttacking = false; }, 250);
    }

    getHit(damage) {
        this.health -= damage;
        this.isHit = true;
        this.position.x -= this.facing * 40;
        setTimeout(() => { this.isHit = false; }, 150);
    }
}
