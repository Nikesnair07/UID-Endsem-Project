// CHATBOT — Powered by Anthropic API (Claude claude-sonnet-4-20250514)

let chatOpen = false;
const SYSTEM_PROMPT = `You are Chef AI, a friendly and knowledgeable AI cooking assistant for ReadySetCook. 
You help users with: recipe recommendations, cooking tips, ingredient substitutions, meal ideas, nutrition advice, and cooking techniques.
Keep responses concise (2-4 sentences max), warm, and practical. Use cooking emojis occasionally. 
Always stay on-topic — food, cooking, recipes, nutrition. If asked something unrelated, gently redirect to cooking.`;

function toggleChat() {
  const panel = document.getElementById('chatPanel');
  if (!panel) return;
  chatOpen = !chatOpen;
  panel.classList.toggle('open', chatOpen);
  if (chatOpen) document.getElementById('chatInput')?.focus();
}

function sendSug(btn) {
  const text = btn.textContent;
  document.getElementById('chatInput').value = text;
  sendChat();
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');
  if (!input || !messages) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  appendMsg(messages, text, 'user');
  const typingEl = appendTyping(messages);

  try {
    const reply = await callClaude(text, 'chatMessages');
    typingEl.remove();
    appendMsg(messages, reply, 'bot');
  } catch (e) {
    typingEl.remove();
    appendMsg(messages, "I'm having a little trouble connecting right now. Try asking again in a moment! 🍳", 'bot');
  }
}

// AI Chef section (dashboard full panel)
async function chefSend() {
  const input = document.getElementById('chefInput');
  const messages = document.getElementById('chefMessages');
  if (!input || !messages) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  appendMsg(messages, text, 'user');
  const typingEl = appendTyping(messages);

  try {
    const reply = await callClaude(text, 'chefMessages');
    typingEl.remove();
    appendMsg(messages, reply, 'bot');
  } catch (e) {
    typingEl.remove();
    appendMsg(messages, "Connection issue — please try again! 🙏", 'bot');
  }
}

function chefSug(btn) {
  const input = document.getElementById('chefInput');
  if (input) { input.value = btn.textContent; chefSend(); }
}

async function callClaude(userMessage, containerId) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }]
    })
  });

  if (!response.ok) {
    // Fallback smart responses when API key not set
    return getFallbackResponse(userMessage);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "I couldn't think of a response. Ask me again!";
}

// Fallback responses when no API key configured
function getFallbackResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('substitute') || q.includes('replace')) {
    return "Great question! For most baking, you can substitute butter with coconut oil (1:1 ratio) or applesauce for moisture. For cooking, olive oil works well. 🧈";
  }
  if (q.includes('vegetarian') || q.includes('vegan')) {
    return "For plant-based protein, try chickpeas, lentils, tofu, tempeh, or edamame! They're versatile and delicious in most recipes. 🌱";
  }
  if (q.includes('dinner') || q.includes('meal')) {
    return "How about a quick stir-fry? Sauté whatever veggies you have with garlic, soy sauce, and sesame oil. Serve over rice for a complete meal in 15 minutes! 🍜";
  }
  if (q.includes('breakfast')) {
    return "A classic veggie omelette is perfect — whisk 2-3 eggs, add diced peppers, onions, and cheese. Cook on medium heat for 3 minutes. Quick, nutritious, delicious! 🍳";
  }
  if (q.includes('pasta') || q.includes('noodle')) {
    return "For amazing pasta, salt your water generously — it should taste like the sea! Cook al dente, and always save a cup of pasta water to loosen your sauce. 🍝";
  }
  if (q.includes('chicken')) {
    return "The secret to juicy chicken? Don't skip resting it! After cooking, let it rest for 5-10 minutes before cutting. All those delicious juices redistribute. 🍗";
  }
  return "That's a great cooking question! The key to any great dish is fresh ingredients and proper seasoning. Taste as you go and trust your palate! 👨‍🍳✨";
}

function appendMsg(container, text, role) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function appendTyping(container) {
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}
