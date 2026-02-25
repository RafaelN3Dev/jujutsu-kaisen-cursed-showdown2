export const CombatSystem = {
    calculateDamage: (attacker, defender, attackType) => {
        let damage = 0;
        let energyCost = 0;

        switch (attackType) {
            case 'light':
                damage = 15;
                energyCost = 0;
                break;
            case 'heavy':
                damage = 35;
                energyCost = 0;
                break;
            case 'special':
                damage = 80;
                energyCost = 30;
                break;
            case 'special2':
                damage = 120;
                energyCost = 50;
                break;
            case 'ultimate':
                damage = 250;
                energyCost = 100;
                break;
        }

        // Verifica se o atacante tem energia gasta (se for especial)
        if (attacker.energy >= energyCost) {
            attacker.energy -= energyCost;

            // Bônus da Rika (Dano Dobrado)
            if (attacker.isRikaManifested) {
                damage *= 2;
            }

            defender.getHit(damage);
            return damage;
        }

        return 0;
    }
};
