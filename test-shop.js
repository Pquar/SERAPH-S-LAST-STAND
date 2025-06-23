// test-shop.js - Arquivo de teste para a loja

// Aguardar o carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Testando sistema de loja...');
    
    // Aguardar um pouco para garantir que o jogo inicializou
    setTimeout(() => {
        if (window.game && window.game.player) {
            console.log('Game inicializado!');
            
            // Dar alguns Soul Orbs para teste
            window.game.player.soulOrbs = 1000;
            console.log(`Player tem ${window.game.player.soulOrbs} Soul Orbs`);
            
            // Testar se o equipmentManager existe
            if (window.game.equipmentManager) {
                console.log('EquipmentManager encontrado!');
                
                const equipment = window.game.equipmentManager.getAllEquipment();
                console.log('Equipamentos disponíveis:', equipment);
                
                // Listar alguns equipamentos
                console.log('Chapéus disponíveis:');
                Object.values(equipment.hats).forEach(hat => {
                    console.log(`- ${hat.name}: ${hat.cost} Soul Orbs (${hat.description})`);
                });
                
                console.log('Cajados disponíveis:');
                Object.values(equipment.staffs).forEach(staff => {
                    console.log(`- ${staff.name}: ${staff.cost} Soul Orbs (${staff.description})`);
                });
            } else {
                console.error('EquipmentManager não encontrado!');
            }
            
            // Dar alguns equipamentos para teste
            window.game.player.ownedEquipment.hats.push('wizardHat');
            window.game.player.ownedEquipment.staffs.push('wizardStaff');
            
            console.log('Equipamentos do player:', window.game.player.ownedEquipment);
            console.log('Sistema de loja pronto para testes!');
            console.log('Use: window.game.showShop() para abrir a loja');
            
        } else {
            console.error('Game não inicializado ou player não encontrado');
        }
    }, 2000);
});

// Função helper para testar a loja
window.testShop = () => {
    if (window.game) {
        window.game.showShop();
    } else {
        console.error('Game não encontrado');
    }
};

// Função helper para dar Soul Orbs
window.giveSoulOrbs = (amount = 1000) => {
    if (window.game && window.game.player) {
        window.game.player.soulOrbs += amount;
        console.log(`Adicionados ${amount} Soul Orbs. Total: ${window.game.player.soulOrbs}`);
    }
};

// Função helper para dar equipamentos
window.giveEquipment = (type, itemId) => {
    if (window.game && window.game.player) {
        if (!window.game.player.ownedEquipment[type].includes(itemId)) {
            window.game.player.ownedEquipment[type].push(itemId);
            console.log(`Equipamento ${itemId} adicionado ao tipo ${type}`);
        } else {
            console.log(`Player já possui ${itemId}`);
        }
    }
};

console.log('Funções de teste carregadas:');
console.log('- testShop() - Abrir loja');
console.log('- giveSoulOrbs(amount) - Dar Soul Orbs');
console.log('- giveEquipment(type, itemId) - Dar equipamento');
