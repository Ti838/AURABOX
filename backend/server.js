const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL_NAME = process.env.MODEL_NAME || 'llama3';

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
        // System prompt to give it that "Sandbox AI" personality
        const systemMessage = {
            role: "system",
            content: "You are AuraBox, a highly capable, local, and secure AI assistant. You operate in a sandboxed environment. Your responses should be concise, helpful, and formatted using markdown. If you need to perform an action, you can write JavaScript code within a markdown block labeled ```javascript execute\n// code\n```. You are running on local hardware."
        };

        const payload = {
            model: MODEL_NAME,
            messages: [systemMessage, ...messages],
            stream: true // We can stream responses for a premium feel
        };

        const response = await axios.post(`${OLLAMA_URL}/api/chat`, payload, {
            responseType: 'stream'
        });

        response.data.pipe(res);
    } catch (error) {
        console.error('Error communicating with Ollama:', error.message);
        res.status(500).json({ error: 'Failed to communicate with local AI backend. Is Ollama running?' });
    }
});

const vm = require('vm');

app.post('/api/execute', (req, res) => {
    const { code } = req.body;
    let output = '';
    
    // Create a secure-ish sandbox with a custom console
    const sandbox = {
        console: {
            log: (...args) => { output += args.join(' ') + '\n'; },
            error: (...args) => { output += 'ERROR: ' + args.join(' ') + '\n'; },
            warn: (...args) => { output += 'WARN: ' + args.join(' ') + '\n'; }
        },
        Math: Math,
        Date: Date,
        setTimeout: setTimeout
    };

    try {
        const script = new vm.Script(code);
        const context = vm.createContext(sandbox);
        // 5 second execution timeout to prevent infinite loops
        script.runInContext(context, { timeout: 5000 }); 
        res.json({ success: true, output: output || 'Code executed successfully with no console output.' });
    } catch (error) {
        res.json({ success: false, output: error.toString() });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`AuraBox Server is running on http://localhost:${PORT}`);
    console.log(`Using model: ${MODEL_NAME}`);
});
