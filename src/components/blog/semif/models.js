// Modelos da demo SemIf (github.com/TheoLeeCJ/SemIf-OpenJev, MIT), com a
// revisão do Hugging Face fixada. `labelBase` é o id do token "A" no
// vocabulário de cada modelo: a leitura direta dá +100 de viés a A, B, C…
export const MODELS = {
  'qwen3-0.6b': {
    name: 'Qwen3 0.6B',
    size: '639 MB',
    page: 'https://huggingface.co/Qwen/Qwen3-0.6B-GGUF',
    url: 'https://huggingface.co/Qwen/Qwen3-0.6B-GGUF/resolve/23749fefcc72300e3a2ad315e1317431b06b590a/Qwen3-0.6B-Q8_0.gguf',
    labelBase: 32,
    notice: '📱 Small and quick. Made for phones; expect more wrong answers.',
  },
  'minicpm5-2b': {
    name: 'MiniCPM5 2B',
    size: '1.56 GB',
    page: 'https://huggingface.co/openbmb/MiniCPM5-2B-GGUF',
    url: 'https://huggingface.co/openbmb/MiniCPM5-2B-GGUF/resolve/2079a22f3beaa4e306449978533478fe0522f4b3/MiniCPM5-2B-Q4_K_M.gguf',
    labelBase: 54,
    notice: '💻 The middle ground. May not fit on low-end devices.',
  },
  'qwen3.5-4b': {
    name: 'Qwen3.5 4B',
    size: '3.01 GB',
    page: 'https://huggingface.co/bartowski/Qwen_Qwen3.5-4B-GGUF',
    url: 'https://huggingface.co/bartowski/Qwen_Qwen3.5-4B-GGUF/resolve/4168f45a16a1290d65a4ec0fa312ae917a4c15d6/Qwen_Qwen3.5-4B-Q4_K_M.gguf',
    labelBase: 32,
    notice: '🏋️ The heavy one. Needs several GB of free GPU memory and storage.',
  },
}

export const isMobileDevice = () =>
  navigator.userAgentData?.mobile === true ||
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
  window.matchMedia('(max-width: 600px)').matches

// O original sempre escolhe o MiniCPM e só avisa no celular. Aqui o celular
// já começa no modelo pequeno.
export const recommendedModel = () => (isMobileDevice() ? 'qwen3-0.6b' : 'minicpm5-2b')
