import { Player } from './player.js';
import { CombatSystem } from './combat.js';
import { CharactersRegistry } from './data.js';

class Engine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = 1280;
        this.canvas.height = 720;

        this.background = new Image();
        this.background.src = 'assets/stages/jujutsu_high.png';

        this.isStarted = false;
        this.timeRemaining = 99;
        this.timerInterval = null;

        this.p1 = null;
        this.p2 = null;

        this.selection = {
            p1: null,
            p2: null,
            picking: 1
        };

        this.keys = {
            a: { pressed: false },
            d: { pressed: false },
            w: { pressed: false },
            ArrowLeft: { pressed: false },
            ArrowRight: { pressed: false },
            ArrowUp: { pressed: false }
        };

        this.renderCharGrid();
        this.setupMenuHandlers();
        this.init();
        this.animate();
    }

    renderCharGrid() {
        const grid = document.getElementById('char-grid');
        if (!grid) return;

        grid.innerHTML = '';
        Object.keys(CharactersRegistry).forEach(key => {
            const char = CharactersRegistry[key];
            const card = document.createElement('div');
            card.className = 'char-card';
            card.style.setProperty('--char-color', char.color);
            card.innerHTML = `
                <div class="avatar-block"></div>
                <span>${char.name}</span>
            `;

            card.addEventListener('click', () => this.handleCharClick(key));
            grid.appendChild(card);
        });
    }

    handleCharClick(key) {
        if (this.selection.picking === 1) {
            this.selection.p1 = key;
            this.selection.picking = 2;
            document.getElementById('selection-status').innerText = "JOGADOR 2: Escolha seu personagem";
        } else if (this.selection.picking === 2) {
            this.selection.p2 = key;
            document.getElementById('selection-status').innerText = "PERSONAGENS SELECIONADOS";
            document.getElementById('confirm-selection').disabled = false;
        }
        this.updateSelectionVisuals();
    }

    updateSelectionVisuals() {
        const cards = document.querySelectorAll('.char-card');
        const keys = Object.keys(CharactersRegistry);

        cards.forEach((card, index) => {
            const key = keys[index];
            card.classList.remove('selected-p1', 'selected-p2');
            if (key === this.selection.p1) card.classList.add('selected-p1');
            if (key === this.selection.p2) card.classList.add('selected-p2');
        });
    }

    setupMenuHandlers() {
        document.getElementById('start-game').addEventListener('click', () => {
            if (!this.selection.p1) this.selection.p1 = 'gojo';
            if (!this.selection.p2) this.selection.p2 = 'sukuna';
            this.startGame();
        });

        document.getElementById('open-chars').addEventListener('click', () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('char-selection').classList.remove('hidden');
        });

        document.getElementById('confirm-selection').addEventListener('click', () => {
            document.getElementById('char-selection').classList.add('hidden');
            this.startGame();
        });

        document.getElementById('restart-game').addEventListener('click', () => {
            document.getElementById('game-over').classList.add('hidden');
            this.startGame();
        });
    }

    startGame() {
        const char1Data = CharactersRegistry[this.selection.p1 || 'gojo'];
        const char2Data = CharactersRegistry[this.selection.p2 || 'sukuna'];

        this.timeRemaining = 99; // Reset timer

        this.p1 = new Player({
            position: { x: 200, y: 0 },
            velocity: { x: 0, y: 0 },
            color: char1Data.color,
            name: char1Data.name,
            domain: char1Data.domain
        });

        this.p2 = new Player({
            position: { x: 900, y: 0 },
            velocity: { x: 0, y: 0 },
            color: char2Data.color,
            name: char2Data.name,
            domain: char2Data.domain
        });

        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('char-selection').classList.add('hidden');

        this.updateHUDNames();
        this.updateHUD(); // Reset bars
        this.isStarted = true;
        this.startTimer();
    }

    updateHUDNames() {
        document.querySelector('.p1 .name').innerText = this.p1.name;
        document.querySelector('.p2 .name').innerText = this.p2.name;
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        const timerElement = document.querySelector('.timer');
        timerElement.innerText = this.timeRemaining;

        this.timerInterval = setInterval(() => {
            if (!this.isStarted) return;
            this.timeRemaining--;
            timerElement.innerText = this.timeRemaining;

            if (this.timeRemaining <= 0) {
                this.endGame('TEMPO ESGOTADO', 'EMPATE');
            }
        }, 1000);
    }

    endGame(reason, winner) {
        this.isStarted = false;
        clearInterval(this.timerInterval);

        const gameOverScreen = document.getElementById('game-over');
        document.getElementById('winner-text').innerText = winner;
        document.getElementById('game-over-reason').innerText = reason;
        gameOverScreen.classList.remove('hidden');
    }

    init() {
        window.addEventListener('keydown', (event) => {
            if (this.keys[event.key]) this.keys[event.key].pressed = true;

            if (!this.isStarted) return;

            // NOVOS CONTROLES P1 (1, 2, 3, 4)
            if (event.key === '1') this.p1.attack('light');
            if (event.key === '2') this.p1.attack('heavy');
            if (event.key === '3') this.p1.attack('special');
            if (event.key === '4') this.p1.attack('ultimate');

            // NOVOS CONTROLES P2 (U, I, O, P)
            const key = event.key.toLowerCase();
            if (key === 'u') this.p2.attack('light');
            if (key === 'i') this.p2.attack('heavy');
            if (key === 'o') this.p2.attack('special');
            if (key === 'p') this.p2.attack('ultimate');
        });

        window.addEventListener('keyup', (event) => {
            if (this.keys[event.key]) this.keys[event.key].pressed = false;
        });
    }

    drawBackground() {
        // Céu Noturno Jujutsu (HD Gradient)
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grad.addColorStop(0, '#000000');
        grad.addColorStop(0.4, '#0a0a20');
        grad.addColorStop(1, '#1a0515');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Luas / Brilho de energia no fundo
        this.ctx.fillStyle = 'rgba(100, 100, 255, 0.05)';
        this.ctx.beginPath();
        this.ctx.arc(1000, 150, 100, 0, Math.PI * 2);
        this.ctx.fill();

        if (this.background.complete && this.background.naturalWidth !== 0) {
            this.ctx.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
        }

        // Chão de Pedra Refletiva
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.fillRect(0, 720 - 50, this.canvas.width, 50);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.strokeRect(0, 720 - 50, this.canvas.width, 1);
    }

    updateHUD() {
        const p1h = document.getElementById('p1-health');
        const p2h = document.getElementById('p2-health');
        const p1e = document.getElementById('p1-energy');
        const p2e = document.getElementById('p2-energy');

        if (p1h) p1h.style.width = (this.p1.health / 10) + '%';
        if (p2h) p2h.style.width = (this.p2.health / 10) + '%';
        if (p1e) p1e.style.width = this.p1.energy + '%';
        if (p2e) p2e.style.width = this.p2.energy + '%';
    }

    animate() {
        window.requestAnimationFrame(() => this.animate());

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();

        if (this.p1 && this.p2) {
            if (this.isStarted) {
                // Ganho passivo lento de energia
                this.p1.energy = Math.min(100, this.p1.energy + 0.03);
                this.p2.energy = Math.min(100, this.p2.energy + 0.03);
                this.updateHUD();
            }

            this.p1.update(this.ctx);
            this.p2.update(this.ctx);

            if (this.isStarted) {
                // Movimentação P1 (W,A,D)
                this.p1.velocity.x = 0;
                if (this.keys.a.pressed) this.p1.velocity.x = -8;
                else if (this.keys.d.pressed) this.p1.velocity.x = 8;
                if (this.keys.w.pressed && this.p1.onGround) this.p1.velocity.y = -20;

                // Movimentação P2 (Setas)
                this.p2.velocity.x = 0;
                if (this.keys['ArrowLeft'].pressed) this.p2.velocity.x = -8;
                else if (this.keys['ArrowRight'].pressed) this.p2.velocity.x = 8;
                if (this.keys['ArrowUp'].pressed && this.p2.onGround) this.p2.velocity.y = -20;

                // Colisão P1 -> P2
                if (this.p1.isAttacking && this.rectangularCollision(this.p1, this.p2)) {
                    const dmg = CombatSystem.calculateDamage(this.p1, this.p2, this.p1.lastAttackType);
                    if (dmg > 0) {
                        this.p1.isAttacking = false;
                        this.p1.energy = Math.min(100, this.p1.energy + 5);
                    }
                    this.updateHUD();
                }

                // Colisão P2 -> P1
                if (this.p2.isAttacking && this.rectangularCollision(this.p2, this.p1)) {
                    const dmg = CombatSystem.calculateDamage(this.p2, this.p1, this.p2.lastAttackType);
                    if (dmg > 0) {
                        this.p2.isAttacking = false;
                        this.p2.energy = Math.min(100, this.p2.energy + 5);
                    }
                    this.updateHUD();
                }

                if (this.p1.health <= 0) this.endGame('NOCAUTE', `${this.p2.name} VENCEU!`);
                if (this.p2.health <= 0) this.endGame('NOCAUTE', `${this.p1.name} VENCEU!`);
            }
        }
    }

    rectangularCollision(r1, r2) {
        return (
            r1.attackBox.position.x + r1.attackBox.width >= r2.position.x &&
            r1.attackBox.position.x <= r2.position.x + r2.width &&
            r1.attackBox.position.y + r1.attackBox.height >= r2.position.y &&
            r1.attackBox.position.y <= r2.position.y + r2.height
        );
    }
}

new Engine();
