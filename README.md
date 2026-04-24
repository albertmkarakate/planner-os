# Demon Lord Orchestration System (DLOS)

DLOS is a local-first, hierarchical multi-agent system designed for autonomous command and control on Linux. Inspired by the OpenMAIC architecture, it prioritizes privacy, offline capability, and deep system integration.

## Architecture

The system uses a parent-child agent hierarchy:

1.  **Supreme Demon Lord (Orchestrator)**: Master planner.
2.  **Demon Lord of Reasoning**: Task decomposition and planning.
3.  **Demon Lord of Code**: Scripting and refactoring.
4.  **Demon Lord of System Control**: Linux shell and process management.
5.  **Demon Lord of Memory**: Persistent JSON/Vector storage.
6.  **Demon Lord of Models**: Local model routing (Ollama/vLLM).
7.  **Demon Lord of Tools**: Sandboxed tool execution layer.
8.  **Demon Lord of Autonomy**: Background triggers and watchers.

## Core Features

- **Offline-First**: Runs entirely on local hardware.
- **Root Orchestration**: Can manage Linux system state (requires proper permissions).
- **Persistent Memory**: Agents remember tasks and results across sessions.
- **Multi-Agent Bus**: Async message bus for real-time inter-agent communication.
- **Web Integration**: Optional React-based Web UI for remote command.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    pip install aiofiles rich pydantic ollama
    ```
2.  **Launch CLI**:
    ```bash
    python3 demonlord/main.py
    ```
3.  **Launch Web UI**:
    ```bash
    npm run dev
    ```

## Local LLM Support

DLOS prefers **Ollama**. Ensure it's running:
```bash
ollama serve
ollama pull qwen2.5
```

## Safety

DLOS includes basic safety guards to prevent destructive commands (e.g., recursive root deletion), but use with caution when granting system-level access.
