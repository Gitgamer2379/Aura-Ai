// Variável que guardará a chave durante o uso
let API_KEY = localStorage.getItem('aura_api_key');

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const configBtn = document.getElementById('config-btn');

// Função para verificar se a chave existe
function checkApiKey() {
    if (!API_KEY) {
        const key = prompt("Por favor, insira sua API KEY do Google Gemini para ativar a Aura AI:");
        if (key) {
            localStorage.setItem('aura_api_key', key);
            API_KEY = key;
            location.reload(); // Recarrega para aplicar
        }
    }
}

// Chamar a verificação ao abrir o site
checkApiKey();

// Botão para trocar a chave
configBtn.addEventListener('click', () => {
    localStorage.removeItem('aura_api_key');
    location.reload();
});

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role);
    msgDiv.innerHTML = text.replace(/\n/g, '<br>');
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function fetchAuraResponse(prompt) {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Você é a Aura AI, uma assistente virtual avançada e poliglota. 
                               Responda sempre de forma prestativa e no idioma do usuário. 
                               Mensagem: ${prompt}`
                    }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            if (data.error.status === "UNAUTHENTICATED") {
                localStorage.removeItem('aura_api_key');
                return "Erro: Sua Chave de API parece inválida. Clique em 'Alterar Chave' e cole a correta.";
            }
            return "Aura encontrou um erro: " + data.error.message;
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return "Erro de conexão. Verifique sua chave ou internet.";
    }
}

sendBtn.addEventListener('click', async () => {
    const text = userInput.value.trim();
    if (!text || !API_KEY) return;

    appendMessage('user', text);
    userInput.value = '';
    
    const thinkingDiv = document.createElement('div');
    thinkingDiv.classList.add('message', 'ai');
    thinkingDiv.innerText = "Aura está processando...";
    chatBox.appendChild(thinkingDiv);

    const aiResponse = await fetchAuraResponse(text);
    
    chatBox.removeChild(thinkingDiv);
    appendMessage('ai', aiResponse);
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
});
