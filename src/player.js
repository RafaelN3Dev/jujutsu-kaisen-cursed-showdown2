export class Player {
    constructor({ position, velocity, color, name, domain, spritePath }) {
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.name = name;
        this.domainName = domain || "DOMÍNIO SIMPLES";
        this.width = 80;
        this.height = 180;
        this.health = 1000;
        this.energy = 0;
        this.maxEnergy = 100;
        this.gravity = 0.8;
        this.onGround = false;
        this.facing = name.includes('Sukuna') ? -1 : 1;

        // Sprite System
        this.image = new Image();
        this.image.src = spritePath || `assets/characters/${name.toLowerCase().split(' ')[0]}.png`;
        this.spritesLoaded = false;
        this.image.onload = () => { this.spritesLoaded = true; };

        this.frameCurrent = 0;
        this.framesMax = 4; // Padrão para Idle
        this.framesElapsed = 0;
        this.framesHold = 10; // Velocidade da animação

        this.attackBox = {
            position: { x: this.position.x, y: this.position.y },
            width: 180,
            height: 80
        };
        this.isAttacking = false;
        this.lastAttackType = 'light';
        this.frameCounter = 0;
        this.isHit = false;

        this.isJackpot = false;
        this.isRikaManifested = false;
    }

    animateFrames() {
        this.framesElapsed++;
        if (this.framesElapsed % this.framesHold === 0) {
            if (this.frameCurrent < this.framesMax - 1) {
                this.frameCurrent++;
            } else {
                this.frameCurrent = 0;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        this.frameCounter++;
        const breathe = Math.sin(this.frameCounter * 0.1) * 3;
        const currentY = this.position.y;

        if (this.energy > 80 || this.isJackpot || this.isRikaManifested) {
            ctx.shadowBlur = 40;
            ctx.shadowColor = this.color;
        }

        if (this.spritesLoaded) {
            ctx.translate(this.position.x + this.width / 2, currentY + this.height / 2);
            if (this.facing === -1) ctx.scale(-1, 1);

            // Se a imagem for larga, tratamos como Sprite Sheet, se não, como arte única
            const isSpriteSheet = this.image.width > this.image.height;

            if (isSpriteSheet) {
                const spriteW = this.image.width / 4;
                const spriteH = this.image.height / 4;
                let spriteRow = 0; // 0: Idle, 1: Run, 2: Attack
                if (this.isAttacking) spriteRow = 2;
                else if (this.velocity.x !== 0) spriteRow = 1;

                ctx.drawImage(
                    this.image,
                    this.frameCurrent * spriteW,
                    spriteRow * spriteH,
                    spriteW,
                    spriteH,
                    -this.width / 2,
                    -this.height / 2,
                    this.width,
                    this.height
                );
            } else {
                // Desenha a imagem inteira (Arte da Internet)
                ctx.drawImage(
                    this.image,
                    -this.width / 2,
                    -this.height / 2,
                    this.width,
                    this.height
                );
            }
        } else {
            // Fallback para desenho vetorial premium se a imagem falhar
            this.drawCharacterDetails(ctx, currentY + breathe);
        }

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
        const h = this.height;

        // Base Body
        ctx.fillStyle = '#0a0a0f'; // Dark baseline
        ctx.fillRect(x, y + 40, w, h - 40);

        // Character Specifics
        if (this.name.includes('Gojo')) {
            // White Hair (Detailed)
            ctx.fillStyle = '#fff';
            ctx.fillRect(x - 5, y - 10, w + 10, 25);
            ctx.beginPath();
            ctx.moveTo(x, y + 15); ctx.lineTo(x + w / 2, y - 25); ctx.lineTo(x + w, y + 15); ctx.fill();
            // Blindfold (Premium)
            ctx.fillStyle = '#111';
            ctx.fillRect(x, y + 20, w, 15);
            ctx.strokeStyle = '#00d2ff'; ctx.lineWidth = 2; ctx.strokeRect(x, y + 20, w, 15);
            // Infinity Aura
            ctx.shadowBlur = 30; ctx.shadowColor = '#00d2ff';
        } else if (this.name.includes('Sukuna')) {
            // Pink spiked hair
            ctx.fillStyle = '#ff79c6';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath(); ctx.moveTo(x + i * 25, y + 10); ctx.lineTo(x + 12 + i * 25, y - 20); ctx.lineTo(x + 25 + i * 25, y + 10); ctx.fill();
            }
            // Tattoos
            ctx.fillStyle = '#ffd1d1'; ctx.fillRect(x + 5, y, w - 10, 45); // Face
            ctx.fillStyle = '#000'; ctx.fillRect(x + 10, y + 25, 15, 2); ctx.fillRect(x + w - 25, y + 25, 15, 2); // Lines
            // Malicious Aura
            ctx.shadowBlur = 30; ctx.shadowColor = '#f32121';
        } else if (this.name.includes('Toji')) {
            ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x, y + 35, w, h - 35); // Black tight shirt
            ctx.fillStyle = '#f0f0f0'; ctx.fillRect(x, y + h * 0.6, w, h * 0.4); // White pants
            ctx.fillStyle = '#ffe0bd'; ctx.fillRect(x + 5, y, w - 10, 40); // Face
            ctx.fillStyle = '#000'; ctx.fillRect(x - 2, y - 8, w + 4, 12); // Hair
            // Inverted Spear silhouette on back
            ctx.fillStyle = '#999'; ctx.fillRect(x + w - 5, y + 50, 5, 80);
        } else if (this.name.includes('Geto')) {
            ctx.fillStyle = '#000'; ctx.fillRect(x, y - 5, w, 15); // Hair bun
            ctx.fillStyle = '#ffe0bd'; ctx.fillRect(x + 5, y, w - 10, 45); // Face
            ctx.fillStyle = '#f1c40f'; ctx.fillRect(x, y + 45, w, h - 45); // Yellow monk robe
            ctx.fillStyle = '#000'; ctx.fillRect(x + w / 2 - 5, y + 45, 10, h - 45); // Black stripe
        } else if (this.name.includes('Dabura')) {
            ctx.fillStyle = '#fff'; ctx.fillRect(x, y + 35, w, h - 35); // White robe
            ctx.fillStyle = '#fffa65'; ctx.fillRect(x, y + 35, w, 10); // Gold collar
            ctx.fillStyle = '#ffe0bd'; ctx.fillRect(x + 5, y, w - 10, 45); // Face
            ctx.fillStyle = '#fff'; ctx.fillRect(x - 5, y - 10, w + 10, 15); // Long white hair
            ctx.shadowBlur = 20; ctx.shadowColor = '#fffa65';
        } else if (this.name.includes('Itadori')) {
            ctx.fillStyle = '#0a0a20'; ctx.fillRect(x, y + 40, w, h - 40);
            ctx.fillStyle = '#f32121'; ctx.fillRect(x, y + 35, w, 15); // Red hoodie collar
            ctx.fillStyle = '#ff5e57'; ctx.fillRect(x + 5, y - 5, w - 10, 15); // Spiky pinkish hair
        } else if (this.name.includes('Megumi')) {
            ctx.fillStyle = '#0a0a0f'; ctx.fillRect(x, y + 40, w, h - 40);
            ctx.fillStyle = '#000';
            for (let i = 0; i < 4; i++) {
                ctx.beginPath(); ctx.moveTo(x + i * 20, y + 5); ctx.lineTo(x + i * 20 - 10, y - 20); ctx.lineTo(x + i * 20 + 15, y + 5); ctx.fill();
            }
        } else if (this.name.includes('Nanami')) {
            ctx.fillStyle = '#f1c40f'; ctx.fillRect(x, y + 40, w, h - 40); // Beige suit
            ctx.fillStyle = '#fff'; ctx.fillRect(x + w / 2 - 10, y + 40, 20, 30); // White shirt
            ctx.fillStyle = '#333'; ctx.fillRect(x + 10, y + 18, w - 20, 8); // Goggles
        } else if (this.name.includes('Todo')) {
            ctx.fillStyle = '#ffe0bd'; ctx.fillRect(x, y + 40, w, h - 40); // Topless
            ctx.fillStyle = '#000'; ctx.fillRect(x + 5, y - 8, w - 10, 15); // Hair
            ctx.fillStyle = '#555'; ctx.fillRect(x + 15, y + 5, 4, 30); // Scar
        } else if (this.name.includes('Maki')) {
            ctx.fillStyle = '#004a11'; ctx.fillRect(x + w - 5, y - 5, 10, 30); // Ponytail
            ctx.fillStyle = '#9b59b6'; ctx.fillRect(x + 5, y + 18, w - 10, 6); // Purple glasses
        } else {
            ctx.fillStyle = this.color; ctx.fillRect(x, y - 10, w, 20); // Fallback hair/head
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
        } else if (this.name.includes('Toji')) {
            // Nuvem Itinerante (Playful Cloud)
            ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 15;
            ctx.beginPath();
            ctx.moveTo(this.position.x + this.width / 2, y + 80);
            ctx.lineTo(x + (this.facing === 1 ? 400 : -400), y + 80);
            ctx.stroke();
            // Efeitos de impacto
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x + (this.facing === 1 ? 150 : 300), y + 80, 30, 0, Math.PI * 2);
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
            ctx.fillRect(x, y + 75, 500, 15); // Sangue Per Furante
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20;
        } else if (this.name.includes('Junpei')) {
            ctx.fillStyle = '#8e44ad';
            ctx.beginPath();
            ctx.arc(x + 100, y + 80, 50, 0, Math.PI * 2);
            ctx.fill(); // Água-viva Venenosa
        } else if (this.name.includes('Geto')) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x + 150, y + 80, 80, 0, Math.PI * 2);
            ctx.fill(); // Uzumaki Spiral
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 5;
            ctx.stroke();
        } else if (this.name.includes('Nanami')) {
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 10;
            ctx.strokeRect(x, y + 60, 200, 40); // Ratio Technique
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Arial';
            ctx.fillText("7:3", x + 80, y + 85);
        } else if (this.name.includes('Dabura')) {
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#fffa65';
            ctx.fillRect(x + (this.facing === 1 ? 50 : 250), y - 200, 40, 1000); // Pilar de Luz
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

        if (this.name.includes('Toji')) {
            // Lança Invertida do Céu
            ctx.strokeStyle = '#95a5a6'; ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.moveTo(200, 360); ctx.lineTo(1080, 360); ctx.stroke();
            ctx.fillStyle = '#ff0000'; ctx.font = '700 30px Outfit';
            ctx.fillText("QUEBRA DE TÉCNICA", 640, 420);
        } else if (this.name.includes('Dabura')) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(640, 360, 300, 0, Math.PI * 2);
            ctx.fill(); // Darkness Reversal Hole
            ctx.strokeStyle = '#fffa65';
            ctx.lineWidth = 10;
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.fillText("REVERSO: ESCURIDÃO", 640, 420);
        } else if (this.name.includes('Geto')) {
            ctx.fillStyle = '#000';
            ctx.font = '40px Outfit';
            ctx.fillText("LIBERAÇÃO DE MALDIÇÕES", 640, 420);
            // Draw multiple "curse" circles
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(200 + i * 200, 360 + Math.sin(this.frameCounter * 0.1 + i) * 50, 50, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.name.includes('Hakari') && !this.isJackpot) {
            this.isJackpot = true; setTimeout(() => { this.isJackpot = false; }, 15000);
        } else if (this.name.includes('Yuta') && !this.isRikaManifested) {
            this.isRikaManifested = true; setTimeout(() => { this.isRikaManifested = false; }, 10000);
        }

        ctx.strokeStyle = this.color; ctx.lineWidth = 15;
        ctx.beginPath(); ctx.arc(640, 360, (this.frameCounter * 12) % 900, 0, Math.PI * 2); ctx.stroke();
    }

    update(ctx) {
        this.animateFrames();
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
