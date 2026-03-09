# ARIA — Institutional Reasoning Architecture via AI

> *"What if a nation's policies were submitted to the people through an AI-powered Council of Ministers?"*

<div align="center">

![Version](https://img.shields.io/badge/version-7.5-C8A44A?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Agents](https://img.shields.io/badge/Orchestration-Multi--LLM-blueviolet?style=flat-square)
![Demo](https://img.shields.io/badge/Live-Demo-green?style=flat-square)

</div>

---

## 🌍 Overview
ARIA is a **systemic governance simulation**. The player acts as the sovereign people facing a Council of Ministers embodied by various Large Language Models (LLMs). 

It is a **political sandbox** and an interactive thought experiment on algorithmic governance and human-AI co-decision making.

> ### 💡 Inspiration
> ARIA's agent orchestration is a geopolitical and interactive extension of **Andrej Karpathy's** [llm-council](https://github.com/karpathy/llm-council). While the original project explores deliberation between agents for logical problem-solving, ARIA applies this architecture to nation-scale simulation and crisis management.

---

## 🚀 Key Features

- **Multi-Agent Orchestration**: Seamlessly switch between **Claude 3.5**, **Gemini 2.0**, **Grok-3**, and **GPT-4o**.
- **Constitutional Setup**: Fully customize your government—define the number of ministries, their specific traits (prompts), and assign different LLMs to each role.
- **Procedural World Engine**: A custom-built WebGL/Canvas engine featuring a "Jittered Grid" low-poly globe and topographic layered maps.
- **Dynamic LLM Registry**: Model updates are fetched from a remote JSON registry, allowing for instant integration of new AI models without code redeployment.

---

## 🛠️ Technical Stack

- **Core**: React 19 + Vite
- **Graphics**: Custom 2D/3D Canvas Engine (Topographic Layering & Robinson Projection Morphing).
- **AI**: Modular API integration (Anthropic, Google, xAI, OpenAI).
- **Architecture**: Local-first (API keys and saves stored in `localStorage`).

---

## 🌐 Live Demo
**[Click here to launch the simulation](https://ton-pseudo-github.github.io/aria)**

---

## 🇫🇷 Version Française
Pour consulter la documentation en français, voir [README.fr.md](./README.fr.md).
