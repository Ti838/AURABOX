<div align="center">
  <img src="frontend/logo.png" alt="AuraBox Logo" width="120" height="120">
  
  # AuraBox 📦✨
  **The Fully Local, Intelligent AI Agent & Model**

  [![Local Inference](https://img.shields.io/badge/Inference-Local%20(Ollama)-blue.svg?style=for-the-badge&logo=ollama)](https://ollama.com/)
  [![Custom Model](https://img.shields.io/badge/Model-ti838%2Faurabox-orange.svg?style=for-the-badge)](#)
  [![Sandboxed Execution](https://img.shields.io/badge/Code%20Execution-Sandboxed-brightgreen.svg?style=for-the-badge)](#)
</div>

<br/>

**AuraBox** is a two-part open-source project: 
1. **A Custom AI Model:** A highly intelligent, offline agent model trained to provide exceptionally accurate code and securely execute logic locally.
2. **A Premium Sandbox UI:** A dark-mode, glassmorphism web interface that allows the model to run custom JavaScript code dynamically in a secure Node.js sandbox.

Your data never leaves your machine. Everything runs 100% locally.

---

## 🚀 Quick Start: Use the AuraBox Model Directly

You don't need to install any code to talk to AuraBox! You can download the custom AI model directly into your terminal using Ollama.

**1. Install Ollama:** Get it from [ollama.com](https://ollama.com/)
**2. Run AuraBox globally:**
```bash
ollama run ti838/aurabox
```
*(This will download the custom AuraBox AI onto your computer. You can chat with it offline forever!)*

---

## 💻 Quick Start: Install the AuraBox Web UI

If you want the full premium web interface with **Agentic Code Execution**, follow these steps to run the full application:

### Prerequisites
1. **Node.js** (v16 or higher)
2. **Ollama** installed on your system.

### 1. Download the Custom Model
Pull the AuraBox model into your local Ollama registry:
```bash
ollama pull ti838/aurabox
```

### 2. Setup the Repository
Clone this repository and install the backend dependencies:
```bash
git clone https://github.com/Ti838/AURABOX.git
cd AURABOX
npm install
```

### 3. Configure the Environment
Copy the example environment file and ensure the settings match:
```bash
cp backend/.env.example backend/.env
```
Inside `backend/.env`, ensure the model name is correct:
```env
OLLAMA_URL=http://localhost:11434
MODEL_NAME=ti838/aurabox
PORT=5000
```

### 4. Run the AuraBox Server
Start the local Node.js proxy server:
```bash
npm start
```
Open your browser and navigate to: **`http://localhost:5000`**

---

## 🛠️ How the Agent Sandbox Works

AuraBox is not just a chatbot; it's an **Agent**. If you ask it to "Calculate the first 50 Fibonacci numbers" or "Write a function to reverse a string and test it", the AI knows how to output code wrapped in a specific markdown block:

\`\`\`javascript execute
console.log("Hello from the Sandbox!");
\`\`\`

The Vanilla JS frontend detects this block, alerts the user, and sends the code to the Express.js backend's `/api/execute` endpoint. The server securely runs the code in an isolated `vm.Script` context (with a 5-second timeout), captures the `console.log` output, and feeds it back into the chat so the AI can read its own execution results!

---

## 🏗️ Building the Model Yourself

If you want to modify the AuraBox personality, we have included the `Modelfile`. 

You can edit the `Modelfile` and compile your own custom version of the AI:
```bash
ollama create my-custom-agent -f Modelfile
```

---

## 📄 License & Credits

This project was built to bring enterprise-level local sandboxed AI capabilities to everyone. 
Licensed under the MIT License - see the LICENSE file for details.
