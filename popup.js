// ========== API KEYS ==========
const OPENAI_KEY = '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';
const DEEPSEEK_KEY = 'sk-022cae69fe7b475ab1a6b92cd064baaa';
const OPENROUTER_KEY = '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';
const OPENAI_IMAGES_KEY = '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';
const FAL_KEY = 'de7197a2-e70e-439f-ac25-09c98483f2e0:f2cf4d8441ffed175ab856a734117a14';
const DEEPGRAM_KEY = '835d74433ff255a6a53323b593a9bccc9954808e';
const ASSEMBLY_KEY = '308dddcab6764f87b6788d06e13527a6';
const WEATHER_KEY = 'dad9ff767b54bb9553d75f9010e2c3a5';
const SUPABASE_URL = 'https://iovruumufvrbzyorvntv.supabase.co';
const SUPABASE_PUB_KEY = 'sb_publishable_onXqeLxefpMUXF_fAPHS9Q_NsRAXUmN';
const ELEVENLABS_KEY = 'sk_7a312ecf07b993f5a75085d185713ee7d0ffcc6413a08fa1';

// Additional keys (optional)
const RUNWAY_KEY = '';
const HEYGEN_KEY = '';
const D_ID_KEY = '';
const STABILITY_KEY = '';
const SHOTSTACK_KEY = '';
const CREATOMATE_KEY = '';

// ========== UI Elements ==========
const homeScreen = document.getElementById('homeScreen');
const profileCard = document.getElementById('profileCard');
const chatInterface = document.getElementById('chatInterface');
const backToHomeFromProfile = document.getElementById('backToHomeFromProfile');
const backBtn = document.getElementById('backBtn');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const messageBtn = document.getElementById('messageBtn');
const shareBtn = document.getElementById('shareBtn');
const chatTitle = document.getElementById('chatTitle');
const moreToolsBtn = document.getElementById('moreToolsBtn');
const moreToolsList = document.getElementById('moreToolsList');
const recentChatsList = document.getElementById('recentChatsList');
const newChatBtn = document.getElementById('newChatBtn');
const clearChatsBtn = document.getElementById('clearChatsBtn');
const whatsNewToggle = document.getElementById('whatsNewToggle');
const whatsNewContent = document.getElementById('whatsNewContent');
// NEW: Status elements
const statusToggle = document.getElementById('statusToggle');
const statusContent = document.getElementById('statusContent');

let currentTool = 'chat';
let currentChatId = null;

// ========== Local Storage Management ==========
function getChats() {
  try {
    return JSON.parse(localStorage.getItem('iceback_chats')) || [];
  } catch { return []; }
}
function saveChats(chats) {
  localStorage.setItem('iceback_chats', JSON.stringify(chats));
}
function getChat(id) {
  const chats = getChats();
  return chats.find(c => c.id === id);
}
function saveChat(chat) {
  let chats = getChats();
  const idx = chats.findIndex(c => c.id === chat.id);
  if (idx !== -1) {
    chats[idx] = chat;
  } else {
    chats.unshift(chat);
    if (chats.length > 20) chats.pop();
  }
  saveChats(chats);
  renderRecentChats();
}

// ========== Render Recent Chats ==========
function renderRecentChats() {
  const chats = getChats();
  if (chats.length === 0) {
    recentChatsList.innerHTML = '<div style="padding:12px 0;color:#8e8e93;text-align:center;font-size:14px;">No recent chats</div>';
    return;
  }
  recentChatsList.innerHTML = '';
  chats.slice(0, 10).forEach(chat => {
    const div = document.createElement('div');
    div.className = 'recent-item';
    const preview = chat.messages && chat.messages.length > 0 ? chat.messages[0].text.substring(0, 30) : 'Empty chat';
    const time = new Date(chat.timestamp).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});
    div.innerHTML = `
      <span class="chat-preview">${preview}</span>
      <span class="chat-time">${time}</span>
    `;
    div.addEventListener('click', () => loadChat(chat.id));
    recentChatsList.appendChild(div);
  });
}

// ========== Load a chat ==========
function loadChat(id) {
  const chat = getChat(id);
  if (!chat) return;
  currentChatId = id;
  currentTool = chat.tool || 'chat';
  homeScreen.style.display = 'none';
  profileCard.style.display = 'none';
  chatInterface.style.display = 'flex';
  chatTitle.textContent = toolName(currentTool);
  chatMessages.innerHTML = '';
  chat.messages.forEach(msg => {
    addMessage(msg.sender, msg.text, msg.time, false);
  });
}

// ========== Create new chat ==========
function startNewChat() {
  homeScreen.style.display = 'none';
  profileCard.style.display = 'block';
  chatInterface.style.display = 'none';
}

// ========== Open chat with a specific tool ==========
function openChat(tool = 'chat') {
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const newChat = {
    id,
    tool,
    messages: [
      { sender: 'ai', text: getSystemPrompt(tool), time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }
    ],
    timestamp: Date.now()
  };
  saveChat(newChat);
  currentChatId = id;
  currentTool = tool;
  profileCard.style.display = 'none';
  chatInterface.style.display = 'flex';
  chatTitle.textContent = toolName(tool);
  chatMessages.innerHTML = '';
  addMessage('ai', getSystemPrompt(tool));
  renderRecentChats();
}

// ========== Navigation ==========
function goHome() {
  chatInterface.style.display = 'none';
  profileCard.style.display = 'none';
  homeScreen.style.display = 'block';
  renderRecentChats();
}

// ========== UI Helpers ==========
function addMessage(sender, text, time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), save = true) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender === 'user' ? 'user-message' : 'ai-message'}`;
  
  if (sender === 'ai' && text) {
    if (text.startsWith('VIDEO:')) {
      const videoUrl = text.substring(6).trim();
      msgDiv.innerHTML = '';
      const videoContainer = document.createElement('div');
      videoContainer.className = 'video-message';
      videoContainer.innerHTML = `
        <video controls autoplay muted>
          <source src="${videoUrl}" type="video/mp4">
        </video>
        <div class="video-actions">
          <button class="download-video" data-url="${videoUrl}"><i class="fas fa-download"></i> Download</button>
          <button class="share-video" data-url="${videoUrl}"><i class="fas fa-share-alt"></i> Share Link</button>
        </div>
      `;
      msgDiv.appendChild(videoContainer);
      msgDiv.querySelector('.download-video').addEventListener('click', (e) => {
        downloadFile(e.currentTarget.dataset.url, 'video.mp4');
      });
      msgDiv.querySelector('.share-video').addEventListener('click', (e) => {
        navigator.clipboard.writeText(e.currentTarget.dataset.url).then(() => alert('Video link copied!'));
      });
    } else if (text.startsWith('AUDIO:')) {
      const audioUrl = text.substring(6).trim();
      msgDiv.innerHTML = '';
      const audioContainer = document.createElement('div');
      audioContainer.style.cssText = 'background:#f8f9fc;border-radius:12px;padding:12px;margin:4px 0;';
      audioContainer.innerHTML = `
        <audio controls style="width:100%;">
          <source src="${audioUrl}" type="audio/mpeg">
        </audio>
        <div style="margin-top:8px;display:flex;gap:12px;justify-content:center;">
          <button class="download-audio" data-url="${audioUrl}"><i class="fas fa-download"></i> Download Audio</button>
        </div>
      `;
      msgDiv.appendChild(audioContainer);
      msgDiv.querySelector('.download-audio').addEventListener('click', (e) => {
        downloadFile(e.currentTarget.dataset.url, 'audio.mp3');
      });
    } else {
      const textNode = document.createTextNode(text);
      msgDiv.appendChild(textNode);
    }
  } else {
    const textNode = document.createTextNode(text || '');
    msgDiv.appendChild(textNode);
  }
  
  const timeSpan = document.createElement('div');
  timeSpan.className = 'timestamp';
  timeSpan.textContent = time;
  msgDiv.appendChild(timeSpan);
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  if (save && currentChatId) {
    const chat = getChat(currentChatId);
    if (chat) {
      chat.messages.push({ sender, text, time });
      saveChat(chat);
    }
  }
}

// ========== Download helper ==========
async function downloadFile(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch {
    window.open(url, '_blank');
  }
}

function toolName(tool) {
  const names = {
    'chat': 'AI Chat',
    'image-gen': 'Image Generator',
    'image-edit': 'Image Editor',
    'pdf': 'PDF Chat',
    'translate': 'Translator',
    'writer': 'AI Writer',
    'code': 'Code Generator',
    'search': 'AI Search',
    'voice': 'Voice Chat',
    'tts': 'Text to Speech',
    'ocr': 'OCR',
    'summarize': 'AI Summarizer',
    'homework': 'Homework Helper',
    'math': 'Math Solver',
    'logo': 'Logo Generator',
    'video': 'Video Prompt Creator',
    'video-gen': 'Text to Video',
    'ad-gen': 'Ad Generator'
  };
  return names[tool] || 'Safari AI';
}

function getSystemPrompt(tool) {
  const prompts = {
    'chat': "Hello! I'm Safari AI. How can I help you today?",
    'image-gen': "Describe the image you want me to generate.",
    'image-edit': "Upload an image and tell me what edits you need.",
    'pdf': "Upload a PDF and ask me questions about its content.",
    'translate': "Type text and tell me the target language.",
    'writer': "What would you like me to write?",
    'code': "Describe the code you need (language and functionality).",
    'search': "Ask me anything, I'll search the web and summarize.",
    'voice': "Click the microphone and speak your query.",
    'tts': "Paste text and I'll convert it to speech.",
    'ocr': "Upload an image with text – I'll extract it.",
    'summarize': "Paste long text – I'll summarize it.",
    'homework': "Ask your homework question – I'll help.",
    'math': "Enter your math problem – I'll solve it.",
    'logo': "Describe your logo – I'll generate a design.",
    'video': "Give a concept – I'll create a video prompt.",
    'video-gen': "Describe the video you want to generate (e.g., 'a dog running in a park').",
    'ad-gen': "Describe the ad you want (e.g., 'school supplies ad'). I'll generate a script, video, and voiceover."
  };
  return prompts[tool] || prompts['chat'];
}

// ========== AI API Calls ==========
async function callOpenAI(prompt, system = "You are a helpful AI assistant.") {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callDeepSeek(prompt) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DEEPSEEK_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateVideo(prompt) {
  const response = await fetch('https://fal.run/fal-ai/runwayml/stable-video-diffusion', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });
  const data = await response.json();
  const videoUrl = data.video?.url || data.video;
  if (!videoUrl) throw new Error('No video URL received');
  return videoUrl;
}

async function elevenLabsTTS(text) {
  const voiceId = '21m00Tcm4TlvDq8ikWAM';
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    })
  });
  if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

async function generateImage(prompt) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_IMAGES_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024'
    })
  });
  const data = await response.json();
  return data.data[0].url;
}

async function transcribeAudio(audioBlob) {
  const response = await fetch('https://api.deepgram.com/v1/listen', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${DEEPGRAM_KEY}`
    },
    body: audioBlob
  });
  const data = await response.json();
  return data.results.channels[0].alternatives[0].transcript;
}

async function textToSpeech(text) {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: 'alloy',
      input: text
    })
  });
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

async function ocrImage(imageUrl) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract all text from this image.' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 1000
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}

// ========== Event Listeners ==========
newChatBtn.addEventListener('click', startNewChat);

clearChatsBtn.addEventListener('click', () => {
  if (confirm('Delete all chat history?')) {
    localStorage.removeItem('iceback_chats');
    renderRecentChats();
  }
});

whatsNewToggle.addEventListener('click', () => {
  const isVisible = whatsNewContent.style.display === 'block';
  whatsNewContent.style.display = isVisible ? 'none' : 'block';
  whatsNewToggle.innerHTML = isVisible ? '<i class="fas fa-bullhorn"></i> What\'s New <i class="fas fa-chevron-down"></i>' : '<i class="fas fa-bullhorn"></i> What\'s New <i class="fas fa-chevron-up"></i>';
});

// NEW: Status toggle
statusToggle.addEventListener('click', () => {
  const isVisible = statusContent.style.display === 'block';
  statusContent.style.display = isVisible ? 'none' : 'block';
  statusToggle.innerHTML = isVisible ? '<i class="fas fa-info-circle"></i> Status / Commands <i class="fas fa-chevron-down"></i>' : '<i class="fas fa-info-circle"></i> Status / Commands <i class="fas fa-chevron-up"></i>';
});

// Populate Status with commands (no HTML tags – all plain text)
const commands = [
  { cmd: '/chat', desc: 'Start AI Chat' },
  { cmd: '/image', desc: 'Generate Images' },
  { cmd: '/edit', desc: 'Image Editor' },
  { cmd: '/pdf', desc: 'Chat with PDF' },
  { cmd: '/translate', desc: 'Translate text' },
  { cmd: '/writer', desc: 'AI Writer' },
  { cmd: '/code', desc: 'Code Generator' },
  { cmd: '/search', desc: 'AI Search' },
  { cmd: '/voice', desc: 'Voice Chat' },
  { cmd: '/tts', desc: 'Text to Speech' },
  { cmd: '/ocr', desc: 'OCR (Image to Text)' },
  { cmd: '/summarize', desc: 'AI Summarizer' },
  { cmd: '/homework', desc: 'Homework Helper' },
  { cmd: '/math', desc: 'Math Solver' },
  { cmd: '/logo', desc: 'Logo Generator' },
  { cmd: '/video', desc: 'Video Prompt Creator' },
  { cmd: '/videogen', desc: 'Text to Video' },
  { cmd: '/ad', desc: 'Ad Generator (Script + Video + Voice)' },
];
commands.forEach(item => {
  const div = document.createElement('div');
  div.className = 'command-item';
  // Use textContent to avoid HTML injection
  const cmdSpan = document.createElement('span');
  cmdSpan.className = 'cmd';
  cmdSpan.textContent = item.cmd;
  const descSpan = document.createElement('span');
  descSpan.className = 'desc';
  descSpan.textContent = item.desc;
  div.appendChild(cmdSpan);
  div.appendChild(descSpan);
  statusContent.appendChild(div);
});

// Update What's New to include this feature
const updateMessages = [
  { icon: '📢', text: 'Added Status / Commands – see all available shortcuts!' },
  { icon: '🎬', text: 'Ad Generator – create full ads with script, video & voiceover!' },
  { icon: '🔊', text: 'Integrated ElevenLabs TTS for high-quality voiceovers' },
  { icon: '📂', text: 'Chat history is now saved locally – continue conversations anytime' },
  { icon: '🏠', text: 'New home screen with Recent Chats and What\'s New' },
  { icon: '🎥', text: 'Generate videos from text using Fal.ai' },
  { icon: '🔧', text: 'More tools section with upcoming features' },
];
updateMessages.forEach(item => {
  const div = document.createElement('div');
  div.className = 'whats-new-item';
  const iconSpan = document.createElement('span');
  iconSpan.className = 'wn-icon';
  iconSpan.textContent = item.icon;
  const textSpan = document.createElement('span');
  textSpan.textContent = item.text;
  div.appendChild(iconSpan);
  div.appendChild(textSpan);
  whatsNewContent.appendChild(div);
});

backToHomeFromProfile.addEventListener('click', goHome);

document.querySelectorAll('.feature-item').forEach(item => {
  item.addEventListener('click', () => {
    const tool = item.dataset.tool;
    openChat(tool);
  });
});

messageBtn.addEventListener('click', () => openChat('chat'));

shareBtn.addEventListener('click', () => {
  const text = "Check out safari Ai by ICEBACK MASTER TECH! Business: safaritechcompany@gmail.com | Owner: icebackmaster@gmail.com";
  navigator.clipboard.writeText(text).then(() => alert('Share text copied!'));
});

moreToolsBtn.addEventListener('click', () => {
  const isVisible = moreToolsList.style.display === 'block';
  moreToolsList.style.display = isVisible ? 'none' : 'block';
  moreToolsBtn.innerHTML = isVisible ? '<i class="fas fa-chevron-down"></i> More Tools' : '<i class="fas fa-chevron-up"></i> Less Tools';
});

backBtn.addEventListener('click', goHome);

sendBtn.addEventListener('click', async () => {
  const userText = chatInput.value.trim();
  if (!userText) return;
  addMessage('user', userText);
  chatInput.value = '';
  const placeholder = document.createElement('div');
  placeholder.className = 'message ai-message';
  placeholder.textContent = '...';
  chatMessages.appendChild(placeholder);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    let response = '';
    switch (currentTool) {
      case 'chat':
      case 'writer':
      case 'code':
      case 'homework':
      case 'math':
        response = await callOpenAI(userText, `You are ${toolName(currentTool)}. ${getSystemPrompt(currentTool)}`);
        break;
      case 'translate':
        response = await callDeepSeek(`Translate: ${userText}`);
        break;
      case 'search':
        response = await callOpenAI(userText, "Search the web and summarize.");
        break;
      case 'image-gen':
        const imgUrl = await generateImage(userText);
        response = `Image generated: ${imgUrl}`;
        break;
      case 'video-gen':
        const videoUrl = await generateVideo(userText);
        response = `VIDEO: ${videoUrl}`;
        break;
      case 'ad-gen': {
        const scriptSystem = "You are a professional ad scriptwriter. Write a compelling, concise script (up to 100 words) for the given product/topic. The script should be suitable for a short video ad, with clear scenes and narration.";
        const script = await callOpenAI(userText, scriptSystem);
        chatMessages.removeChild(placeholder);
        addMessage('ai', `📝 Script generated:\n\n${script}`);
        
        const videoPlaceholder = document.createElement('div');
        videoPlaceholder.className = 'message ai-message';
        videoPlaceholder.textContent = 'Generating video...';
        chatMessages.appendChild(videoPlaceholder);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        try {
          const videoUrl2 = await generateVideo(script);
          chatMessages.removeChild(videoPlaceholder);
          addMessage('ai', `VIDEO: ${videoUrl2}`);
        } catch (vErr) {
          chatMessages.removeChild(videoPlaceholder);
          addMessage('ai', `⚠ Video generation failed: ${vErr.message}`);
        }
        
        const voicePlaceholder = document.createElement('div');
        voicePlaceholder.className = 'message ai-message';
        voicePlaceholder.textContent = 'Generating voiceover...';
        chatMessages.appendChild(voicePlaceholder);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        try {
          const audioUrl = await elevenLabsTTS(script);
          chatMessages.removeChild(voicePlaceholder);
          addMessage('ai', `AUDIO: ${audioUrl}`);
        } catch (aErr) {
          chatMessages.removeChild(voicePlaceholder);
          addMessage('ai', `⚠ Voiceover generation failed: ${aErr.message}`);
        }
        response = '';
        break;
      }
      case 'image-edit':
        response = "Please upload an image using the file button, then tell me what edits.";
        break;
      case 'pdf':
        response = "Please upload a PDF file using the file button, then ask your question.";
        break;
      case 'voice':
        response = "Click the microphone button and speak.";
        break;
      case 'tts':
        const audioUrl2 = await textToSpeech(userText);
        response = `AUDIO: ${audioUrl2}`;
        break;
      case 'ocr':
        response = "Please upload an image with text using the file button.";
        break;
      case 'summarize':
        response = await callOpenAI(`Summarize this: ${userText}`, "You are a summarization assistant.");
        break;
      case 'logo':
        const logoUrl = await generateImage(`Logo design: ${userText}`);
        response = `Image generated: ${logoUrl}`;
        break;
      case 'video':
        response = `Video prompt created: ${userText}`;
        break;
      default:
        response = await callOpenAI(userText, `You are ${toolName(currentTool)}. ${getSystemPrompt(currentTool)}`);
    }
    if (response) {
      chatMessages.removeChild(placeholder);
      addMessage('ai', response);
    }
  } catch (error) {
    chatMessages.removeChild(placeholder);
    addMessage('ai', `⚠ Error: ${error.message}`);
  }
});

document.getElementById('voiceBtn').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const text = await transcribeAudio(blob);
      chatInput.value = text;
    };
    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 5000);
    alert('Recording... speak now for 5 seconds.');
  } catch { alert('Microphone access denied.'); }
});

document.getElementById('fileBtn').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.png,.jpg,.jpeg';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      if (file.type.startsWith('image/')) {
        const text = await ocrImage(dataUrl);
        addMessage('ai', `Extracted text: ${text}`);
      } else if (file.type === 'application/pdf') {
        addMessage('ai', 'PDF uploaded – analysis coming soon.');
      }
    };
    reader.readAsDataURL(file);
  };
  input.click();
});

document.getElementById('photoBtn').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      const text = await ocrImage(dataUrl);
      addMessage('ai', `OCR result: ${text}`);
    };
    reader.readAsDataURL(file);
  };
  input.click();
});

chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendBtn.click();
});

// ========== Initialize ==========
renderRecentChats();
homeScreen.style.display = 'block';
profileCard.style.display = 'none';
chatInterface.style.display = 'none';
