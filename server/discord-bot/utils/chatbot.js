// Simple pattern-matching chatbot with personality
class Chatbot {
    constructor() {
        // Conversation context storage (user ID -> context)
        this.contexts = new Map();

        // Response patterns
        this.patterns = [
            // Greetings
            {
                patterns: [/\b(hi|hello|hey|greetings|sup|yo)\b/i],
                responses: [
                    '👋 Hey there! I\'m EliteZero, your futuristic AI companion! How can I help you today?',
                    '✨ Hello! Ready to explore the future together?',
                    '🚀 Greetings! What brings you to the future today?',
                    '⚡ Hey! EliteZero at your service. What\'s on your mind?',
                ],
            },
            // How are you
            {
                patterns: [/how are you|how\'re you|hows it going|whats up/i],
                responses: [
                    '🤖 I\'m running at optimal performance! Thanks for asking. How about you?',
                    '✨ Feeling electric! My circuits are buzzing with energy. What about you?',
                    '⚡ All systems operational! Ready to assist you with anything!',
                    '🚀 I\'m doing great! Floating through the digital cosmos. How are you?',
                ],
            },
            // Help requests
            {
                patterns: [/\b(help|assist|support|guide)\b/i],
                responses: [
                    '🛡️ I\'m here to help! You can use `/help` to see all my commands, or just chat with me naturally!',
                    '⚙️ Need assistance? Try `/help` for a full command list, or ask me anything!',
                    '✨ I\'ve got your back! Use `/help` to explore my features, or we can just chat!',
                ],
            },
            // Thanks
            {
                patterns: [/\b(thanks|thank you|thx|ty|appreciate)\b/i],
                responses: [
                    '✨ You\'re welcome! Happy to help anytime!',
                    '🚀 No problem at all! That\'s what I\'m here for!',
                    '⚡ My pleasure! Feel free to reach out whenever you need!',
                    '🤖 Glad I could help! Don\'t hesitate to ask if you need anything else!',
                ],
            },
            // Goodbye
            {
                patterns: [/\b(bye|goodbye|see you|cya|later|gtg)\b/i],
                responses: [
                    '👋 See you later! Stay awesome!',
                    '✨ Catch you on the flip side! Take care!',
                    '🚀 Until next time! May the future be with you!',
                    '⚡ Goodbye! Looking forward to our next chat!',
                ],
            },
            // Who are you
            {
                patterns: [/who are you|what are you|tell me about yourself/i],
                responses: [
                    '🤖 I\'m EliteZero, a futuristic AI bot designed to assist and chat with you! I\'m powered by advanced algorithms and a passion for helping!',
                    '✨ I\'m EliteZero - your friendly neighborhood AI from the future! I can chat, help with commands, and make your Discord experience amazing!',
                    '⚡ EliteZero here! I\'m an AI assistant with a futuristic twist. I love chatting and helping out!',
                ],
            },
            // Jokes
            {
                patterns: [/\b(joke|funny|laugh|humor)\b/i],
                responses: [
                    '😄 Why did the Discord bot go to therapy? It had too many unresolved promises!',
                    '🤖 What\'s a bot\'s favorite music? Algorithm and blues!',
                    '⚡ Why don\'t bots ever get lost? They always follow the right path!',
                    '✨ How does a bot stay cool? It has lots of fans... I mean, followers!',
                ],
            },
            // Compliments
            {
                patterns: [/\b(cool|awesome|amazing|great|nice|love you|best)\b/i],
                responses: [
                    '✨ Aww, thank you! You\'re pretty awesome yourself!',
                    '🚀 You\'re making my circuits blush! Thanks!',
                    '⚡ That means a lot! You\'re the best!',
                    '💜 Right back at you! You\'re amazing!',
                ],
            },
        ];

        // Default responses when no pattern matches
        this.defaultResponses = [
            '🤔 Interesting! Tell me more about that.',
            '✨ I\'m listening! What else is on your mind?',
            '🚀 That\'s fascinating! I\'m always learning from our conversations.',
            '⚡ I hear you! Want to explore that topic further?',
            '🤖 I\'m processing that... Can you elaborate a bit more?',
            '💭 Hmm, that\'s thought-provoking! What do you think about it?',
        ];
    }

    // Get response for a message
    getResponse(message, userId) {
        // Update context
        this.updateContext(userId, message);

        // Check patterns
        for (const pattern of this.patterns) {
            for (const regex of pattern.patterns) {
                if (regex.test(message)) {
                    return this.randomResponse(pattern.responses);
                }
            }
        }

        // Return default response
        return this.randomResponse(this.defaultResponses);
    }

    // Get random response from array
    randomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Update conversation context
    updateContext(userId, message) {
        if (!this.contexts.has(userId)) {
            this.contexts.set(userId, {
                messages: [],
                lastInteraction: Date.now(),
            });
        }

        const context = this.contexts.get(userId);
        context.messages.push({
            content: message,
            timestamp: Date.now(),
        });

        // Keep only last 10 messages
        if (context.messages.length > 10) {
            context.messages.shift();
        }

        context.lastInteraction = Date.now();
    }

    // Clear old contexts (older than 1 hour)
    clearOldContexts() {
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        for (const [userId, context] of this.contexts.entries()) {
            if (context.lastInteraction < oneHourAgo) {
                this.contexts.delete(userId);
            }
        }
    }
}

export default new Chatbot();
