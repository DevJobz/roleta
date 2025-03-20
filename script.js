// Elementos da roleta e controles
const roleta = document.getElementById('roleta');
const seta = document.getElementById('seta');
const botaoGirar = document.getElementById('girar');
const contador = document.getElementById('contador');

const somGiro = document.getElementById('somGiro');
const somGanho = document.getElementById('somGanho');

const efeitoConfetes = document.getElementById('efeito-confetes');
const efeitoPerdeu = document.getElementById('efeito-perdeu');

const modalResultado = document.getElementById('modal-resultado');
const modalTexto = document.getElementById('modal-texto');

// Elementos dos modais de telefone e cheat
const modalPhone = document.getElementById('modal-phone');
const phoneInput = document.getElementById('phoneInput');
const confirmPhone = document.getElementById('confirmPhone');

const modalCheat = document.getElementById('modal-cheat');
const cheatSelect = document.getElementById('cheatSelect');
const confirmCheat = document.getElementById('confirmCheat');
const closeCheat = document.getElementById('closeCheat');

// Elementos das estatísticas
const statCopoEl = document.getElementById('stat-copo');
const statChaveiroEl = document.getElementById('stat-chaveiro');
const statAgendaEl = document.getElementById('stat-agenda');
const statTodosEl = document.getElementById('stat-todos');
const statPerdeuEl = document.getElementById('stat-perdeu');

// Arrays definindo as cores e resultados das fatias
const sliceColors = [
    'red', // slice 0
    'blue', // slice 1
    'red', // slice 2
    'purple', // slice 3
    'red', // slice 4
    'green', // slice 5
    'red', // slice 6
    'gold', // slice 7
];

const sliceResults = [
    'perdeu', // slice 0
    'copo', // slice 1
    'perdeu', // slice 2
    'chaveiro', // slice 3
    'perdeu', // slice 4
    'agenda', // slice 5
    'perdeu', // slice 6
    'todos os brindes', // slice 7
];

let girosRealizados = 0;
let anguloAtual = 0; // Guarda o ângulo final do giro anterior
let isSpinning = false;

// Variáveis de controle para telefone e cheat
let phoneVerified = false;
let usedPhones = []; // Armazena todos os telefones já utilizados
let cheatMode = 'Normal'; // valores: Normal, Copo, Chaveiro, Agenda, Todos, Perder

// Estatísticas dos resultados
let statCopo = 0;
let statChaveiro = 0;
let statAgenda = 0;
let statTodos = 0;
let statPerdeu = 0;

// Ao clicar no botão de girar, se o telefone não foi confirmado, exibe o modal
botaoGirar.addEventListener('click', () => {
    if (!phoneVerified) {
        modalPhone.style.display = 'block';
    } else {
        girarRoleta();
    }
});

// Validação do telefone no modal
confirmPhone.addEventListener('click', () => {
    const phoneValue = phoneInput.value.trim();
    if (phoneValue === '') {
        alert('Por favor, insira um número de telefone válido.');
        return;
    }
    if (usedPhones.includes(phoneValue)) {
        alert(
            'Esse telefone já foi utilizado. Por favor, insira um número diferente.'
        );
        return;
    }
    // Se válido, armazena o número e permite o giro
    usedPhones.push(phoneValue);
    phoneVerified = true;
    modalPhone.style.display = 'none';
    // Chama a função de giro após a validação do telefone
    girarRoleta();
});

// Evento para abrir o modal de macetes ao clicar na seta (se não estiver girando)
seta.addEventListener('click', () => {
    if (!isSpinning) {
        modalCheat.style.display = 'block';
    }
});

// Botão de confirmação do cheat
confirmCheat.addEventListener('click', () => {
    cheatMode = cheatSelect.value;
    modalCheat.style.display = 'none';
});

// Botão de fechar do modal de cheat
closeCheat.addEventListener('click', () => {
    modalCheat.style.display = 'none';
});

// Função de giro da roleta
function girarRoleta() {
    // Reinicia a verificação de telefone para evitar reuso no mesmo giro
    phoneVerified = true; // Já validado neste giro
    botaoGirar.style.pointerEvents = 'none';
    isSpinning = true;

    // Inicia o som de giro
    if (somGiro) {
        somGiro.currentTime = 0;
        somGiro
            .play()
            .catch((err) =>
                console.warn('Falha ao reproduzir som de giro:', err)
            );
    }

    // Reinicia o giro removendo a transição e mantendo o ângulo atual
    roleta.style.transition = 'none';
    roleta.style.transform = `rotate(${anguloAtual}deg)`;

    requestAnimationFrame(() => {
        const voltasExtra = 4;
        let anguloDestino = 0;

        // Se algum macete estiver ativo, forçamos o ângulo final
        if (cheatMode !== 'Normal') {
            let targetIndex;
            if (cheatMode === 'Perder') {
                // Escolhe aleatoriamente um dos índices das fatias "perdeu" (0, 2, 4 ou 6)
                const allowed = [0, 2, 4, 6];
                targetIndex =
                    allowed[Math.floor(Math.random() * allowed.length)];
            } else if (cheatMode === 'Copo') {
                targetIndex = 1;
            } else if (cheatMode === 'Chaveiro') {
                targetIndex = 3;
            } else if (cheatMode === 'Agenda') {
                targetIndex = 5;
            } else if (cheatMode === 'Todos') {
                targetIndex = 7;
            }
            // Calcula o ângulo central da fatia desejada:
            // Os centros das fatias são: 22.5, 67.5, 112.5, ... , 337.5
            const targetAngle = 337.5 - targetIndex * 45;
            anguloDestino = voltasExtra * 360 + targetAngle;
        } else {
            // Modo normal: ângulo aleatório
            const anguloAleatorio = Math.floor(Math.random() * 360);
            anguloDestino = voltasExtra * 360 + anguloAleatorio;
        }

        // Aplica a transição para o giro
        roleta.style.transition = 'transform 10s cubic-bezier(0.4, 0, 0.2, 1)';
        roleta.style.transform = `rotate(${anguloDestino}deg)`;

        // Atualiza a cor da seta durante o giro
        animateArrowColor();

        // Ao final do giro (10s)
        setTimeout(() => {
            isSpinning = false;
            // Atualiza o ângulo atual (0 a 360)
            anguloAtual = anguloDestino % 360;

            // Calcula o índice da fatia com base no ângulo final
            let indice = Math.round((360 - (22.5 + anguloAtual)) / 45) % 8;
            seta.style.borderTopColor = sliceColors[indice];

            const premio = sliceResults[indice];

            // Atualiza estatísticas conforme o resultado
            if (premio === 'copo') {
                statCopo++;
                statCopoEl.textContent = statCopo;
            } else if (premio === 'chaveiro') {
                statChaveiro++;
                statChaveiroEl.textContent = statChaveiro;
            } else if (premio === 'agenda') {
                statAgenda++;
                statAgendaEl.textContent = statAgenda;
            } else if (premio === 'todos os brindes') {
                statTodos++;
                statTodosEl.textContent = statTodos;
            } else if (premio === 'perdeu') {
                statPerdeu++;
                statPerdeuEl.textContent = statPerdeu;
            }

            if (premio !== 'perdeu') {
                if (somGanho) {
                    somGanho.currentTime = 0;
                    somGanho
                        .play()
                        .catch((err) =>
                            console.warn(
                                'Falha ao reproduzir som de ganho:',
                                err
                            )
                        );
                }
                efeitoConfetes.style.opacity = '1';
                modalTexto.textContent = `Você ganhou: ${premio}`;
                modalResultado.style.display = 'block';

                setTimeout(() => {
                    efeitoConfetes.style.opacity = '0';
                    modalResultado.style.display = 'none';
                }, 2000);
            } else {
                if (somGiro) {
                    somGiro.pause();
                    somGiro.currentTime = 0;
                }
                efeitoPerdeu.style.opacity = '1';
                setTimeout(() => {
                    efeitoPerdeu.style.opacity = '0';
                }, 1500);
            }

            girosRealizados++;
            contador.textContent = girosRealizados;

            // Após o giro, reseta a verificação de telefone para o próximo usuário
            phoneVerified = false;
            phoneInput.value = '';
            botaoGirar.style.pointerEvents = 'auto';
        }, 10000);
    });
}

// Atualiza a cor da seta durante o giro
function animateArrowColor() {
    const currentAngle = getCurrentRotation(roleta);
    let indice = Math.round((360 - (-65.6 + currentAngle)) / 45) % 8;
    seta.style.borderTopColor = sliceColors[indice];

    if (isSpinning) {
        requestAnimationFrame(animateArrowColor);
    }
}

// Função para ler o ângulo atual de rotação de um elemento
function getCurrentRotation(element) {
    const style = window.getComputedStyle(element);
    const transform = style.transform || style.webkitTransform;
    if (transform === 'none') return 0;
    const values = transform.split('(')[1].split(')')[0].split(',');
    const a = parseFloat(values[0]);
    const b = parseFloat(values[1]);
    let angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    if (angle < 0) angle += 360;
    return angle;
}
