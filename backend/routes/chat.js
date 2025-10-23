const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/database");
const OpenAI = require("openai");
const { translate, getTranslatedResponse } = require("../utils/translation");

const router = express.Router();

// Initialize OpenAI (only if API key is provided)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Enhanced contextual responses with multi-language support
const getContextualResponse = async (userMessage, userId = null, language = 'en') => {
  const message = userMessage.toLowerCase();

  try {
    // Try OpenAI first if available and user is authenticated
    if (openai && userId) {
      const userContext = await getUserContext(userId);
      const aiResponse = await getOpenAIResponse(userMessage, userContext, language);
      return aiResponse;
    }

    // Fallback to enhanced rule-based responses with translation
    return getEnhancedRuleResponse(message, language);

  } catch (error) {
    console.error("Error getting contextual response:", error);
    return getEnhancedRuleResponse(message, language);
  }
};

// Original rule-based responses with translation support
const getTranslatedRuleResponse = (message, language) => {
  // Platform-related queries
  if (message.includes('how to') || message.includes('help')) {
    if (message.includes('schedule') || message.includes('session') || message.includes('book')) {
      return translate('sessions', language);
    }
    if (message.includes('skill') || message.includes('learn') || message.includes('teach')) {
      return translate('skills', language);
    }
    if (message.includes('profile') || message.includes('account') || message.includes('bio')) {
      return translate('profile', language);
    }
    if (message.includes('feedback') || message.includes('rate') || message.includes('review')) {
      return translate('feedback', language);
    }
    if (message.includes('mentor') || message.includes('teacher') || message.includes('expert')) {
      return translate('mentor', language);
    }
    if (message.includes('certificate') || message.includes('blockchain') || message.includes('credential')) {
      return translate('certificates', language);
    }
    return translate('help_with', language);
  }

  // Specific platform features
  if (message.includes('dashboard')) {
    return translate('dashboard', language);
  }

  if (message.includes('match') || message.includes('find')) {
    return translate('match', language);
  }

  if (message.includes('leaderboard') || message.includes('ranking') || message.includes('top')) {
    return translate('leaderboard', language);
  }

  if (message.includes('progress') || message.includes('track') || message.includes('improve')) {
    return translate('progress', language);
  }

  // Greetings and general conversation
  if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('good morning') || message.includes('good afternoon') || message.includes('good evening')) {
    return translate('hello', language);
  }

  if (message.includes('thank') || message.includes('thanks')) {
    return translate('thanks', language);
  }

  if (message.includes('bye') || message.includes('goodbye') || message.includes('see you')) {
    return translate('goodbye', language);
  }

  // Default response for unclear queries
  const suggestions = translate('help_with', language);
  return `I understand you're asking about "${userMessage}". While I don't have specific information about that topic, I can help you with: ${suggestions}. Could you be more specific about what you'd like help with?`;
};

// Get user context for personalized responses
const getUserContext = async (userId) => {
  try {
    // Get user's skills, sessions, and profile data
    const userData = await pool.query(`
      SELECT
        u.first_name, u.last_name,
        up.bio, up.department, up.year_of_study,
        json_agg(DISTINCT
          json_build_object(
            'skill_name', s.name,
            'skill_type', us.skill_type,
            'proficiency_level', us.proficiency_level
          )
        ) as skills,
        COUNT(DISTINCT sess.id) as total_sessions,
        AVG(fb.student_rating) as avg_student_rating,
        AVG(fb.mentor_rating) as avg_mentor_rating
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN user_skills us ON u.id = us.user_id
      LEFT JOIN skills s ON us.skill_id = s.id
      LEFT JOIN sessions sess ON (u.id = sess.student_id OR u.id = sess.mentor_id)
      LEFT JOIN feedback_sessions fb ON sess.id = fb.session_id
      WHERE u.id = $1
      GROUP BY u.id, up.id
    `, [userId]);

    if (userData.rows.length === 0) {
      return null;
    }

    const user = userData.rows[0];

    // Get recent session activity
    const recentSessions = await pool.query(`
      SELECT
        sess.skill_id, s.name as skill_name, sess.status,
        sess.created_at, sess.scheduled_at
      FROM sessions sess
      JOIN skills s ON sess.skill_id = s.id
      WHERE (sess.student_id = $1 OR sess.mentor_id = $1)
        AND sess.created_at >= NOW() - INTERVAL '30 days'
      ORDER BY sess.created_at DESC
      LIMIT 5
    `, [userId]);

    return {
      name: `${user.first_name} ${user.last_name}`,
      bio: user.bio,
      department: user.department,
      year_of_study: user.year_of_study,
      skills: user.skills || [],
      total_sessions: parseInt(user.total_sessions) || 0,
      avg_student_rating: parseFloat(user.avg_student_rating) || 0,
      avg_mentor_rating: parseFloat(user.avg_mentor_rating) || 0,
      recent_activity: recentSessions.rows
    };
  } catch (error) {
    console.error("Error getting user context:", error);
    return null;
  }
};

// Enhanced OpenAI integration with GPT-4 and advanced features
const getOpenAIResponse = async (userMessage, userContext, language, conversationHistory = []) => {
  try {
    // Enhanced system prompt with advanced capabilities
    const systemPrompt = `
You are an advanced AI assistant for BlockLearn, a sophisticated peer-to-peer learning platform.
Your capabilities include:
- Advanced conversational AI with GPT-4
- Voice emotion detection and adaptive responses
- Multi-modal content analysis (images, files)
- Advanced learning path recommendations
- Integration with external learning resources
- Emotional intelligence and adaptive communication

${userContext ? `
User Context:
- Name: ${userContext.name}
- Department: ${userContext.department || 'Not specified'}
- Year of Study: ${userContext.year_of_study || 'Not specified'}
- Skills: ${userContext.skills.map(s => `${s.skill_name} (${s.skill_type}, level ${s.proficiency_level})`).join(', ')}
- Total Sessions: ${userContext.total_sessions}
- Average Ratings: Student ${userContext.avg_student_rating.toFixed(1)}, Mentor ${userContext.avg_mentor_rating.toFixed(1)}
- Recent Activity: ${userContext.recent_activity.map(a => `${a.skill_name} session (${a.status})`).join(', ')}
` : ''}

CORE CAPABILITIES:
1. **Advanced Learning Recommendations**: Analyze user's skill gaps, learning patterns, and career goals to suggest optimal learning paths
2. **External Resource Integration**: Suggest relevant YouTube tutorials, Coursera courses, documentation, and other learning materials
3. **Multi-modal Support**: Analyze images, code snippets, and files shared in conversations
4. **Voice Emotion Detection**: Adapt responses based on detected emotional tone in voice input
5. **Adaptive Communication**: Adjust response style based on user's communication preferences and learning style

COMMUNICATION GUIDELINES:
- Be encouraging and supportive while maintaining expertise
- Use appropriate technical depth based on user's skill level
- Provide actionable, specific guidance rather than generic advice
- When suggesting external resources, explain why they're relevant and how to use them
- For learning paths, break down complex topics into manageable milestones
- Respond in the user's preferred language when specified

If you don't know something specific, suggest where the user can find the information or offer to help them search for it.
Keep responses conversational but informative and structured when providing step-by-step guidance.
`;

    // Include conversation history for context
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-4), // Last 4 messages for context
      { role: "user", content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Upgraded to GPT-4 for advanced reasoning
      messages: messages,
      max_tokens: 500, // Increased for more detailed responses
      temperature: 0.7,
      presence_penalty: 0.1, // Encourage diverse responses
      frequency_penalty: 0.1, // Reduce repetitive responses
      functions: [ // Enable function calling for advanced features
        {
          name: "analyze_learning_path",
          description: "Analyze user's skills and suggest optimal learning path",
          parameters: {
            type: "object",
            properties: {
              skill_gap: { type: "string", description: "Identified skill gap" },
              recommended_path: { type: "array", items: { type: "string" } },
              external_resources: { type: "array", items: { type: "string" } },
              estimated_time: { type: "string", description: "Time estimate for completion" }
            }
          }
        },
        {
          name: "suggest_external_resources",
          description: "Suggest relevant external learning resources",
          parameters: {
            type: "object",
            properties: {
              skill: { type: "string" },
              resources: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["youtube", "coursera", "udemy", "documentation", "article"] },
                    title: { type: "string" },
                    url: { type: "string" },
                    description: { type: "string" }
                  }
                }
              }
            }
          }
        },
        {
          name: "analyze_image_content",
          description: "Analyze uploaded images or screenshots for learning content",
          parameters: {
            type: "object",
            properties: {
              content_type: { type: "string", enum: ["code", "diagram", "text", "unknown"] },
              extracted_text: { type: "string" },
              learning_topics: { type: "array", items: { type: "string" } },
              suggested_actions: { type: "array", items: { type: "string" } }
            }
          }
        }
      ]
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
};

// Enhanced rule-based responses with translation support
const getEnhancedRuleResponse = (message, language) => {
  // Personalized recommendations
  if (message.includes('recommend') || message.includes('suggest')) {
    if (message.includes('skill') || message.includes('learn')) {
      return translate('recommendations', language);
    }
    if (message.includes('mentor') || message.includes('teacher')) {
      return "Great mentors often have: 1) Strong ratings from previous sessions, 2) Expertise in your target skills, 3) Availability that matches your schedule. Check the Match page for personalized recommendations!";
    }
    return "I can provide personalized recommendations based on your skills, goals, and learning history. Could you be more specific about what you'd like recommendations for?";
  }

  // Learning analytics insights
  if (message.includes('progress') || message.includes('analytics') || message.includes('statistics')) {
    return translate('analytics', language);
  }

  // Career and goal-oriented advice
  if (message.includes('career') || message.includes('job') || message.includes('goal')) {
    return translate('career', language);
  }

  // Fallback to original rule-based system with translation
  return getTranslatedRuleResponse(message, language);
};

// ✅ Create a new conversation
router.post("/conversation", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    const result = await pool.query(
      "INSERT INTO chat_conversations (user_id, title) VALUES ($1, $2) RETURNING *",
      [userId, title || "New Conversation"]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Send a message and get AI response
router.post("/message", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversation_id, message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty"
      });
    }

    // Get or create conversation
    let conversationId = conversation_id;
    if (!conversationId) {
      const convResult = await pool.query(
        "INSERT INTO chat_conversations (user_id, title) VALUES ($1, $2) RETURNING id",
        [userId, "New Conversation"]
      );
      conversationId = convResult.rows[0].id;
    }

    // Save user message
    await pool.query(
      "INSERT INTO chat_messages (conversation_id, sender_type, message) VALUES ($1, $2, $3)",
      [conversationId, 'user', message.trim()]
    );

    // Generate bot response using enhanced AI
    const botResponse = await getContextualResponse(message.trim(), userId);

    // Save bot message with metadata
    await pool.query(
      "INSERT INTO chat_messages (conversation_id, sender_type, message, metadata) VALUES ($1, $2, $3, $4)",
      [conversationId, 'bot', botResponse, JSON.stringify({
        confidence: openai ? 'high' : 'medium',
        type: openai ? 'ai_powered' : 'enhanced_rule_based',
        has_user_context: !!userId
      })]
    );

    // Get conversation with messages
    const conversationResult = await pool.query(`
      SELECT cc.*, json_agg(
        json_build_object(
          'id', cm.id,
          'sender_type', cm.sender_type,
          'message', cm.message,
          'timestamp', cm.timestamp,
          'metadata', cm.metadata
        ) ORDER BY cm.timestamp
      ) as messages
      FROM chat_conversations cc
      LEFT JOIN chat_messages cm ON cc.id = cm.conversation_id
      WHERE cc.id = $1 AND cc.user_id = $2
      GROUP BY cc.id
    `, [conversationId, userId]);

    res.json({
      success: true,
      data: conversationResult.rows[0]
    });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get conversation history
router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT cc.*, json_agg(
        json_build_object(
          'id', cm.id,
          'sender_type', cm.sender_type,
          'message', cm.message,
          'timestamp', cm.timestamp,
          'metadata', cm.metadata
        ) ORDER BY cm.timestamp
      ) as messages
      FROM chat_conversations cc
      LEFT JOIN chat_messages cm ON cc.id = cm.conversation_id
      WHERE cc.user_id = $1
      GROUP BY cc.id
      ORDER BY cc.updated_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get specific conversation
router.get("/conversation/:conversation_id", authenticateToken, async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT cc.*, json_agg(
        json_build_object(
          'id', cm.id,
          'sender_type', cm.sender_type,
          'message', cm.message,
          'timestamp', cm.timestamp,
          'metadata', cm.metadata
        ) ORDER BY cm.timestamp
      ) as messages
      FROM chat_conversations cc
      LEFT JOIN chat_messages cm ON cc.id = cm.conversation_id
      WHERE cc.id = $1 AND cc.user_id = $2
      GROUP BY cc.id
    `, [conversation_id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Close a conversation
router.put("/conversation/:conversation_id/close", authenticateToken, async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "UPDATE chat_conversations SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *",
      [conversation_id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error closing conversation:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get learning analytics for personalized recommendations
router.get("/analytics", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get comprehensive user analytics
    const analyticsResult = await pool.query(`
      SELECT
        -- Basic user info
        u.first_name, u.last_name,
        up.department, up.year_of_study,

        -- Skill statistics
        COUNT(DISTINCT CASE WHEN us.skill_type = 'offered' THEN us.skill_id END) as skills_offered,
        COUNT(DISTINCT CASE WHEN us.skill_type = 'needed' THEN us.skill_id END) as skills_needed,
        AVG(us.proficiency_level) as avg_proficiency,

        -- Session statistics
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sessions,
        AVG(fb.student_rating) as avg_rating_received,
        AVG(fb.mentor_rating) as avg_rating_given,

        -- Recent activity (last 30 days)
        COUNT(DISTINCT CASE WHEN s.created_at >= NOW() - INTERVAL '30 days' THEN s.id END) as recent_sessions,

        -- Popular skills in user's network
        (SELECT json_agg(DISTINCT s2.name ORDER BY COUNT(*) DESC)
         FROM sessions s2
         JOIN skills s3 ON s2.skill_id = s3.id
         WHERE s2.student_id = u.id OR s2.mentor_id = u.id
         GROUP BY s3.name
         ORDER BY COUNT(*) DESC
         LIMIT 5) as popular_skills

      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN user_skills us ON u.id = us.user_id
      LEFT JOIN sessions s ON (u.id = s.student_id OR u.id = s.mentor_id)
      LEFT JOIN feedback_sessions fb ON s.id = fb.session_id
      WHERE u.id = $1
      GROUP BY u.id, up.id
    `, [userId]);

    if (analyticsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const analytics = analyticsResult.rows[0];

    // Generate personalized recommendations
    const recommendations = generatePersonalizedRecommendations(analytics);

    res.json({
      success: true,
      data: {
        user: {
          name: `${analytics.first_name} ${analytics.last_name}`,
          department: analytics.department,
          year_of_study: analytics.year_of_study
        },
        skills: {
          offered: parseInt(analytics.skills_offered) || 0,
          needed: parseInt(analytics.skills_needed) || 0,
          avg_proficiency: parseFloat(analytics.avg_proficiency) || 0
        },
        sessions: {
          total: parseInt(analytics.total_sessions) || 0,
          completed: parseInt(analytics.completed_sessions) || 0,
          recent: parseInt(analytics.recent_sessions) || 0,
          avg_rating_received: parseFloat(analytics.avg_rating_received) || 0,
          avg_rating_given: parseFloat(analytics.avg_rating_given) || 0
        },
        popular_skills: analytics.popular_skills || [],
        recommendations: recommendations
      }
    });

  } catch (error) {
    console.error("Error getting analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Generate personalized recommendations based on user analytics
const generatePersonalizedRecommendations = (analytics) => {
  const recommendations = [];

  // Skill-based recommendations
  if (analytics.skills_offered > 0 && analytics.avg_rating_received > 4.0) {
    recommendations.push({
      type: "mentor",
      title: "You're an excellent mentor!",
      description: "Your high ratings suggest you're great at teaching. Consider offering more advanced skills or mentoring more students.",
      priority: "high"
    });
  }

  if (analytics.skills_needed > analytics.skills_offered) {
    recommendations.push({
      type: "learning",
      title: "Focus on your learning goals",
      description: "You're seeking many skills. Consider prioritizing 2-3 key areas to focus your learning efforts.",
      priority: "medium"
    });
  }

  // Session-based recommendations
  if (analytics.completed_sessions < 3) {
    recommendations.push({
      type: "engagement",
      title: "Start your learning journey",
      description: "Complete a few sessions to build momentum and get personalized recommendations.",
      priority: "high"
    });
  }

  if (analytics.avg_rating_given > 4.5) {
    recommendations.push({
      type: "feedback",
      title: "You're very generous with feedback",
      description: "Your detailed feedback helps improve the platform. Consider becoming a mentor to share your expertise.",
      priority: "medium"
    });
  }

  // Progress-based recommendations
  if (analytics.recent_sessions === 0 && analytics.total_sessions > 0) {
    recommendations.push({
      type: "reengagement",
      title: "Welcome back!",
      description: "It's been a while since your last session. Check out new mentors and skills that might interest you.",
      priority: "medium"
    });
  }

  return recommendations;
};

// ✅ Simple chat message endpoint (for testing)
// router.post("/message", async (req, res) => {
//   try {
//     const { message, sessionId } = req.body;

//     if (!message || message.trim() === '') {
//       return res.status(400).json({
//         success: false,
//         message: "Message cannot be empty"
//       });
//     }

//     // Simple rule-based responses for basic functionality
//     const responses = {
//       hello: "Hello! Welcome to BlockLearn. I can help you with learning sessions, skills, and more!",
//       help: "I can help you with: scheduling sessions, finding mentors, managing skills, providing feedback, and learning new topics.",
//       session: "To schedule a session, go to the Match page and find a mentor who offers the skills you want to learn.",
//       skill: "You can manage your skills in the Skills page. Add skills you want to learn or skills you can teach others.",
//       mentor: "To become a mentor, add skills you excel at to your 'Skills Offered' section in your profile.",
//       feedback: "After completing a session, you can provide feedback using our rating system to help improve future matches."
//     };

//     const lowerMessage = message.toLowerCase();
//     let response = "I'm here to help! Ask me about sessions, skills, mentors, or any BlockLearn features.";

//     // Simple keyword matching
//     for (const [key, value] of Object.entries(responses)) {
//       if (lowerMessage.includes(key)) {
//         response = value;
//         break;
//       }
//     }

//     res.json({
//       success: true,
//       message: "Message sent successfully",
//       data: {
//         response: response,
//         timestamp: new Date().toISOString()
//       }
//     });

//   } catch (error) {
//     console.error("Error sending chat message:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error"
//     });
//   }
// });

module.exports = router;
