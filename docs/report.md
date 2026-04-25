**TL;DR**: After [my deep‑dive on Qwen 3.5 tool‑calling](https://www.reddit.com/r/Vllm/comments/1skks8n/qwen_35_27b35ba3b_tool_calling_issues_why_it/) and [trail on Qwen 3.6-35B-A3B](https://www.reddit.com/r/LocalLLM/comments/1sqpsut/qwen_3635ba3b_reddit_asked_so_i_tested_if_the_35/), I took the same `enhanced.jinja` setup and ran **Qwen 3.6‑27B‑FP8** through an unsupervised, agentic build. The catch? Upgrading to **NVIDIA Studio Driver 595.79** introduced NCCL deadlocks that required extra config overrides to fix. Once resolved, the model ran for **180 000 tokens** without a single malformed tool call, and the finished project is [here](https://github.com/allanchan339/qwen36_27B_own_project).

**Important**: The `qwen3.5-enhanced.jinja` template **requires** `preserve_thinking=false` as it is new feature in Qwen 3.6. If you accidentally set it to `true`, the `qwen3.5-enhanced.jinja` will break and tool calls will fail. All examples below assume that flag is correctly set.

# 1. What Came Before (Recap of the Qwen 3.5 Post)

Last time I spent weeks debugging Qwen 3.5‑27B and 35B‑A3B on a mixed‑GPU rig (RTX 4090 + RTX 3090). The fixes that made agentic work possible:

- **`qwen3.5‑enhanced.jinja`** – a custom interleaved‑thinking template that **treats any unclosed `<thinking>` block as plain content**, not as reasoning content. This way the harness sees the tool call directly, even when the model forgets to close the thinking tag – a pattern known as “CoT leakage.” **The template must have `preserve_thinking=false`** (the default) or it will not function.
- **Streaming‑parser dependency** – the jinja fix relies on the parser processing tokens as they stream, detecting `<tool_calling>` even when the surrounding `<thinking>` tag is still open. On **Qwen 3.5‑27B**, the `qwen3_xml` parser works perfectly for this and is generally more robust. However, on Qwen 3.6, only the `qwen3_coder` parser triggers correctly with the unclosed thinking block; `qwen3_xml` fails to fire the tool call (more on this below).
- **`VLLM_TEST_FORCE_FP8_MARLIN=1`** – forces the 4090 (SM89) to use W8A16 instead of native W8A8, preventing precision drift between the two GPUs.
- **NCCL tuning** (`P2P_DISABLE`, `IB_DISABLE`, `Ring`) – essential for stability on PCIe topologies.

With that stack, Qwen 3.5‑27B ran a **1h 9m continuous agentic session** at 138K tokens, building a complete FastAPI + React app without any tool‑calling failures.

# 2. Qwen 3.6‑27B – The Upgrade Path

A few weeks later I swapped the model to `Qwen/Qwen3.6-27B‑FP8` while keeping the same `enhanced.jinja` template (with `preserve_thinking=false`). **The parser had to change**: despite `qwen3_xml` being the more robust choice on 3.5, on 3.6 it did not trigger tool calls when `<thinking>` remained unclosed (the exact scenario the template relies on). So I switched to **`qwen3_coder`** – a parser that, while less sophisticated with special characters, processes streams aggressively to catch the tool call inside an unclosed thinking block. (After bug fix introduced in [this post](https://www.reddit.com/r/Vllm/comments/1suasv2/comment/oi02krw/?context=1). I may switch back to `qwen3_xml` for vLLM 0.20.1 for above.) Everything worked fine on **driver 591.86** — so I upgraded to **Studio Driver 595.79**, expecting better performance. Instead, everything broke:

- Random **NCCL deadlocks** – the server would freeze hard mid‑generation, requiring a restart.
- These deadlocks looked exactly like tool‑calling failures, but the logs pointed to NCCL timeouts, not parser errors.

# 3. Why `qwen3_coder` Over `qwen3_xml`: The "Bug + Bug = Feature" Effect

The switch to `qwen3_coder` isn't just a workaround – it's a perfect case of two "bugs" combining into a feature.

* **The model's bug (CoT leakage)**: Qwen 3.6 sometimes fails to close its `<thinking>` tag before outputting a `<tool_call>`. The `enhanced.jinja` template deliberately ignores this unclosed block and leaves the tool call as plain content, preserving the intent.
* **The parser's "bug" (aggressive streaming)**: `qwen3_coder` is designed to process code‑related outputs and is much more aggressive in detecting tool‑call patterns mid‑stream, even when the surrounding XML is malformed. It doesn't require a fully‑closed `<thinking>` context; it just sees `<tool_call>` and fires. In contrast, `qwen3_xml` is a proper XML parser that expects a well‑formed document, so an unclosed `<thinking>` tag scuppers its ability to find the nested `<tool_call>`.

When the model's "leakage" meets the parser's "roughness", you get **more resilient tool‑call extraction** – the exact outcome you want. Neither the model bug nor the parser's intolerance to XML imperfections is ideal on its own, but together they become a production‑grade feature. This is why I stick with `qwen3_coder` for Qwen 3.6 and why `qwen3_xml` – despite being more robust with special characters – simply cannot handle the unclosed‑thinking scenario on this model.

Dear vLLM dev, please let me know if my verdict is correct.

# 4. The Real Culprit: Driver 595.79 Broke Things

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

# 5. The 180K‑Token Agentic Run

With the driver + NCCL fixes in place, I gave Qwen 3.6‑27B full ownership of a folder and a $10 000 token budget. No hand‑holding.

| Prompt | Wall Time | Accumulated Tokens |
|--------|-----------|--------------------|
| “Welcome to life, you are Qwen 3.6‑27B. Full leadership. What project do you want to build?” | 0s | 0k |
| “Don't ask me – you have full leadership. $10k token budget.” *(model used a Question tool to clarify, then proceeded)* | 31s | 14.0k |
| “Did you check if this is bug‑free? It's your own project.” | 17m 13s | 63.3k |
| “Deliver the first possible functional upgrade. Do it nicely.” | 11m 35s | 126.7k |
| *(session ended naturally)* | 10m 46s | **180.0k** |

**Result**: The model chose to build a modern web app (React + Vite + TypeScript, with a FastAPI backend), iterated on it after critical feedback, and delivered a polished upgrade – all without a single malformed tool call. The finished code is on [GitHub](https://github.com/allanchan339/qwen36_27B_own_project).

# 6. The Recipe (Copy‑Paste Ready)

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
  --default-chat-template-kwargs '{"preserve_thinking": false}' \   # MANDATORY: the enhanced jinja will break if this is true
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
  --tool-call-parser qwen3_coder \          # REQUIRED for Qwen 3.6 with enhanced.jinja; for Qwen 3.5 27B, qwen3_xml also works (see https://www.reddit.com/r/Vllm/comments/1suasv2/)
  --reasoning-parser qwen3 \
  --no-use-tqdm-on-load \
  --host 0.0.0.0 \
  --port 8000 \
  --language-model-only \
  --disable-custom-all-reduce            # CRITICAL for driver 595.79

```

# 7. Key Takeaways

1. **Parser choice depends on the model** – The enhanced jinja template relies on a streaming parser to catch tool calls inside unclosed `<thinking>` blocks. On **Qwen 3.5‑27B**, the `qwen3_xml` parser works fine and is generally more robust (see [this detailed post](https://www.reddit.com/r/Vllm/comments/1skks8n/qwen_35_27b35ba3b_tool_calling_issues_why_it/)). On **Qwen 3.6**, `qwen3_xml` fails to trigger the tool call in that exact scenario, so I use `qwen3_coder` instead.
2. **`preserve_thinking` must be `false`** – The enhanced jinja template **will not work** with `preserve_thinking=true`. This is a new feature in Qwen 3.6 where `qwen3.5-enhanced.jinja` is not compatible.
3. **The NVIDIA driver upgrade can break things** – going from 591.86 to 595.79 introduced NCCL deadlocks on my mixed‑GPU setup. The fix requires new NCCL env vars and `--disable-custom-all-reduce`. If you're on 595.79 without these overrides, you'll hit random deadlocks that masquerade as tool‑calling failures.
4. **The original Qwen 3.5 fixes still stand** – `VLLM_TEST_FORCE_FP8_MARLIN=1` remains non‑optional on mixed‑GPU setups to avoid precision drift, and the same NCCL tuning (updated for the new driver) is mandatory.
5. **Qwen 3.6‑27B is not just an incremental step** – it's a dense 27B model that beats the old MoE flagship Qwen 3.5‑397B‑A17B on core agentic‑coding benchmarks (SWE‑bench Verified 77.2 vs 76.2, Pro 53.5 vs 50.9, SkillsBench 48.2 vs 30.0), making it a generational upgrade rather than a refinement.
6. **180K tokens is the new normal** – the system handled a 10‑minute uninterrupted agentic session with zero tool‑calling errors, demonstrating production‑grade stability on consumer hardware.

**Bottom line**: The `enhanced.jinja` template works on both Qwen 3.5 and 3.6, **provided `preserve_thinking=false`** and you choose the right parser for the model. Combined with the new driver workarounds, the stack yields a rock‑solid 180K‑token agentic run. Full recipe in [Original Qwen 3.5 deep‑dive](https://www.reddit.com/r/Vllm/comments/1skks8n/qwen_35_27b35ba3b_tool_calling_issues_why_it/) – go build.

*Links*:  
- [Original Qwen 3.5 deep‑dive](https://www.reddit.com/r/Vllm/comments/1skks8n/qwen_35_27b35ba3b_tool_calling_issues_why_it/)  
- [Parser behaviour across Qwen 3.5/3.6](https://www.reddit.com/r/Vllm/comments/1suasv2/)  
- [Qwen 3.6‑27B project repo](https://github.com/allanchan339/qwen36_27B_own_project)  
- [vLLM config repo](https://github.com/allanchan339/vLLM-Qwen3.5-27B)