const messagesArea = document.getElementById('messagesArea');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const stopBtn = document.getElementById('stopBtn');
const newChatBtn = document.getElementById('newChatBtn');
const modelBadge = document.getElementById('modelBadge');

let chatHistory = [];
let currentController = null;

stopBtn.addEventListener('click', () => {
    if (currentController) {
        currentController.abort();
    }
});

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if(this.value.trim().length > 0) {
        sendBtn.disabled = false;
    } else {
        sendBtn.disabled = true;
    }
});

userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);
newChatBtn.addEventListener('click', () => {
    chatHistory = [];
    messagesArea.innerHTML = `
        <div class="message bot">
            <div class="avatar">
                <img src="logo.png" alt="AuraBox" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">
            </div>
            <div class="message-content">
                <p>New session started. How can I help you?</p>
            </div>
        </div>
    `;
});

function appendMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    
    // Use a different avatar for 'system' messages like execution output
    let avatarSvg = `<img src="logo.png" alt="AuraBox" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`;
    if (role === 'user') {
        avatarSvg = `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
    } else if (role === 'system') {
        avatarSvg = `<svg viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>`;
    }

    const contentHtml = marked.parse(content);

    msgDiv.innerHTML = `
        <div class="avatar">${avatarSvg}</div>
        <div class="message-content">${contentHtml}</div>
    `;
    
    messagesArea.appendChild(msgDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    return msgDiv.querySelector('.message-content');
}

function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Reset UI
    userInput.value = '';
    userInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Add user message
    appendMessage('user', text);
    chatHistory.push({ role: 'user', content: text });

    // Trigger AI response
    generateAIResponse();
}

async function generateAIResponse() {
    const botContentDiv = appendMessage('bot', '<span class="typing">...</span>');
    let botResponse = '';
    
    currentController = new AbortController();
    sendBtn.style.display = 'none';
    stopBtn.style.display = 'flex';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chatHistory }),
            signal: currentController.signal
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        botContentDiv.innerHTML = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (let line of lines) {
                if (line.trim() !== '') {
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.message && parsed.message.content) {
                            botResponse += parsed.message.content;
                            botContentDiv.innerHTML = marked.parse(botResponse);
                            messagesArea.scrollTop = messagesArea.scrollHeight;
                        }
                    } catch(e) {
                        // Incomplete JSON chunk, skip and wait for next
                    }
                }
            }
        }
        
        chatHistory.push({ role: 'assistant', content: botResponse });

        // Agentic Code Execution Check
        const execMatch = botResponse.match(/\`\`\`(?:javascript|js)\s+execute\n([\s\S]*?)\`\`\`/i);
        if (execMatch) {
            const codeToRun = execMatch[1];
            appendMessage('system', `*⚙️ Agent is executing code in Sandbox...*`);
            
            try {
                const execRes = await fetch('/api/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: codeToRun })
                });
                const execData = await execRes.json();
                
                const outputMsg = `**Execution Output:**\n\`\`\`text\n${execData.output}\n\`\`\``;
                appendMessage('system', outputMsg);
                
                // Add the result to the chat history so the AI knows what happened
                chatHistory.push({ role: 'user', content: `Execution result:\n${execData.output}\nPlease analyze this result or continue the task.` });
                
                // Automatically let the AI respond to the execution output
                setTimeout(() => {
                    generateAIResponse();
                }, 1000);
            } catch (err) {
                appendMessage('system', `*Execution failed: ${err.message}*`);
            }
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            botContentDiv.innerHTML += `<br/><br/><span style="color:#ef4444; font-size: 0.85em;">[Generation stopped]</span>`;
            chatHistory.push({ role: 'assistant', content: botResponse });
        } else {
            botContentDiv.innerHTML = `<p style="color: #ef4444;">Error: Could not reach the local AI engine. Ensure Ollama is running and the backend is connected.</p>`;
            console.error(error);
        }
    } finally {
        sendBtn.style.display = 'flex';
        stopBtn.style.display = 'none';
        currentController = null;
    }
}

// Fetch model info on load
setTimeout(() => {
    modelBadge.textContent = "Model: Local Agent";
}, 1000);
