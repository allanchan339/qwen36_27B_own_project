**Title**: Qwen 3.6‑27B‑FP8: The Missing Driver Fix and a 180K‑Token Stress Test (Follow‑Up)

**TL;DR**: After [my deep‑dive on Qwen 3.5 tool‑calling](https://www.reddit.com/r/vLLM/comments/1skks8n/), I took the same `enhanced.jinja` setup and ran **Qwen 3.6‑27B‑FP8** through an unsupervised, agentic build. The catch? Upgrading to **NVIDIA Studio Driver 595.79** introduced NCCL deadlocks that required extra config overrides to fix. Once resolved, the model ran for **180 000 tokens** without a single malformed tool call, and the finished project is [here](https://github.com/allanchan339/qwen36_27B_own_project).

---

## 1. What Came Before (Recap of the Qwen 3.5 Post)

Last month I spent weeks debugging Qwen 3.5‑27B and 35B‑A3B on a mixed‑GPU rig (RTX 4090 + RTX 3090). The fixes that made agentic work possible:

* **`qwen3.5‑enhanced.jinja`** – a custom interleaved‑thinking template that closes `</thinking>` *before* tool calls, hiding historical reasoning while keeping the current block visible.
* **`qwen3_xml` parser** – the C‑based XML parser that handles `<`, `>`, `&` and nested JSON without corruption, unlike the regex‑based `qwen3_coder` that can break on complex arguments.
* **`VLLM_TEST_FORCE_FP8_MARLIN=1`** – forces the 4090 (SM89) to use W8A16 instead of native W8A8, preventing precision drift between the two GPUs.
* **NCCL tuning** (`P2P_DISABLE`, `IB_DISABLE`, `Ring`) – essential for stability on PCIe/SYS topologies.

With that stack, Qwen 3.5‑27B ran a **1h 9m continuous agentic session** at 138K tokens, building a complete FastAPI + React app without any tool‑calling failures.

---

## 2. Qwen 3.6‑27B – The Upgrade Path

A few weeks later I swapped the model to `Qwen/Qwen3.6-27B‑FP8` while keeping the same `enhanced.jinja` template, the same parser, and the same NCCL flags. Everything worked fine on **driver 591.86** — so I upgraded to **Studio Driver 595.79**, expecting better performance. Instead, everything broke:

* Random **NCCL deadlocks** – the server would freeze hard mid‑generation, requiring a restart.
* These deadlocks looked exactly like tool‑calling failures, but the logs pointed to NCCL timeouts, not parser errors.

---

## 3. The Real Culprit: Driver 595.79 Broke Things

Here's the twist: I was on **591.86** and things were mostly working. I upgraded to **Studio Driver 595.79** expecting improvements — instead, it introduced **NCCL deadlocks** that froze the server mid‑generation.

The new driver appears to tighten NCCL behaviour on mixed‑GPU PCIe topologies, breaking vLLM's custom all‑reduce path. The fix wasn't rolling back the driver — it was enforcing the right overrides:

1. **New NCCL env vars**:
   ```bash
   export NCCL_SHM_DISABLE=0          
   export NCCL_P2P_LEVEL=LOC          # restrict P2P to local GPUs only
   export VLLM_RPC_TIMEOUT=180        # prevent premature RPC timeouts
   export VLLM_WORKER_MULTIPROC_METHOD=spawn  # more robust worker lifecycle
   ```
2. **`--disable-custom-all-reduce`** – forces vLLM to use native NCCL all‑reduce instead of its custom implementation, which is on PCIe‑only topologies.

Without these overrides on 595.79, you'll get random deadlocks that masquerade as tool‑calling failures.

---

## 4. The 180K‑Token Agentic Run

With the driver + NCCL fixes in place, I gave Qwen 3.6‑27B full ownership of a folder and a $10 000 token budget. No hand‑holding.

| Prompt | Wall Time | Accumulated Tokens |
|--------|-----------|--------------------|
| “Welcome to life, you are Qwen 3.6‑27B. Full leadership. What project do you want to build?” | 0s | 0k |
| “Don't ask me – you have full leadership. $10k token budget.” *(model used a Question tool to clarify, then proceeded)* | 31s | 14.0k |
| “Did you check if this is bug‑free? It's your own project.” | 17m 13s | 63.3k |
| “Deliver the first possible functional upgrade. Do it nicely.” | 11m 35s | 126.7k |
| *(session ended naturally)* | 10m 46s | **180.0k** |

**Result**: The model chose to build a modern web app (React + Vite + TypeScript, with a FastAPI backend), iterated on it after critical feedback, and delivered a polished upgrade – all without a single malformed tool call. The finished code is on [GitHub](https://github.com/allanchan339/qwen36_27B_own_project).

---

## 5. The Recipe (Copy‑Paste Ready)

```bash
#!/bin/bash
# -------------------------------------------------
# Qwen 3.6‑27B‑FP8 – Agentic‑Ready vLLM Launch Script
# Tested: 180K tokens, zero tool‑calling failures
# Driver: NVIDIA Studio 595.79
# -------------------------------------------------

# ---- Safe, Speed‑Focused Env Vars ----
export CUDA_DEVICE_ORDER=PCI_BUS_ID
export CUDA_VISIBLE_DEVICES=0,1
export NCCL_CUMEM_ENABLE=0
export VLLM_ENABLE_CUDAGRAPH_GC=1
export VLLM_USE_FLASHINFER_SAMPLER=1

export OMP_NUM_THREADS=8

# ---- NCCL Tuning for SYS/PCIe Topology ----
export NCCL_P2P_DISABLE=1
export NCCL_IB_DISABLE=1
export NCCL_SHM_DISABLE=0          # NEW for driver 595.79
export NCCL_ALGO=Ring
export NCCL_P2P_LEVEL=LOC          # NEW for driver 595.79

# ---- vLLM Stability (Driver‑Dependent) ----
export VLLM_RPC_TIMEOUT=180                  # NEW
export VLLM_WORKER_MULTIPROC_METHOD=spawn    # NEW

# ---- FP8 & Memory ----
export VLLM_MEMORY_PROFILER_ESTIMATE_CUDAGRAPHS=1
export VLLM_TEST_FORCE_FP8_MARLIN=1
export VLLM_SLEEP_WHEN_IDLE=1

# Clean stale FlashInfer cache
rm -rf ~/.cache/flashinfer

# Activate environment
source /home/cychan/vLLM/.venv/bin/activate

vllm serve Qwen/Qwen3.6-27B-FP8 \
  --served-model-name Qwen3.5-27B \
  --chat-template qwen3.5-enhanced.jinja \
  --default-chat-template-kwargs '{"preserve_thinking": false}' \
  --attention-backend FLASHINFER \
  --trust-remote-code \
  --tensor-parallel-size 2 \
  --max-model-len 219520 \
  --gpu-memory-utilization 0.91 \
  --enable-auto-tool-choice \
  --enable-chunked-prefill \
  --enable-prefix-caching \
  --max-num-batched-tokens 12288 \
  --max-num-seqs 4 \
  --kv-cache-dtype fp8 \
  --tool-call-parser qwen3_xml \
  --reasoning-parser qwen3 \
  --no-use-tqdm-on-load \
  --host 0.0.0.0 \
  --port 8000 \
  --language-model-only \
  --disable-custom-all-reduce            # CRITICAL for driver 595.79

#  --speculative-config '{"method":"qwen3_next_mtp","num_speculative_tokens":5}' \
#  Current hardware does not support 80B‑A3B as speculator
```

---

## 6. Key Takeaways

1. **The original Qwen 3.5 fixes still stand** – `enhanced.jinja` is just as important for Qwen 3.6 on smaller models, and `VLLM_TEST_FORCE_FP8_MARLIN=1` remains non‑optional on mixed‑GPU setups.
2. **The NVIDIA driver upgrade can break things** – going from 591.86 to 595.79 introduced NCCL deadlocks on my mixed‑GPU setup. The fix requires new NCCL env vars and `--disable-custom-all-reduce`. If you're on 595.79 without these overrides, you'll hit random deadlocks that masquerade as tool‑calling failures.
3. **Qwen 3.6‑27B is a worthy upgrade** – with this stack, it's just as reliable as 3.5‑27B for agentic work, while offering faster TTFT and slightly sharper reasoning.
4. **180K tokens is the new normal** – the system handled a 10‑minute uninterrupted agentic session with zero tool‑calling errors, demonstrating production‑grade stability on consumer hardware.

---

**Bottom line**: The `enhanced.jinja` template and mixed‑GPU NCCL tuning that made Qwen 3.5 viable carry forward to Qwen 3.6. The new driver (595.79) actually broke things, but with the right overrides it works perfectly. Full recipe above – go build.

*Links*: [Original Qwen 3.5 deep‑dive](https://www.reddit.com/r/vLLM/comments/1skks8n/) · [Qwen 3.6‑27B project repo](https://github.com/allanchan339/qwen36_27B_own_project) · [vLLM config repo](https://github.com/allanchan339/vLLM-Qwen3.5-27B)