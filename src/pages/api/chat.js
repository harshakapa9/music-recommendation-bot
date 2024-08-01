import Groq from 'groq-sdk';

// Initialize Groq with the API key from environment variables
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { message } = req.body;
      const trimmedMessage = message.trim().toLowerCase();
      const basicGreetings = ["hi", "hello", "hey"];
      const musicKeywords = ['song', 'music', 'album', 'artist', 'genre', 'playlist', 'recommend'];

      // Check if the message is a basic greeting
      if (basicGreetings.includes(trimmedMessage)) {
        res.status(200).json({ sender: 'Bot', text: "Hello! How can I assist you with music today?" });
        return;
      }

      // Check if the message contains direct music-related keywords
      const isMusicRelated = musicKeywords.some(keyword => trimmedMessage.includes(keyword));

      // If no direct keywords, use Groq API to verify if the input is potentially music-related
      let isPotentiallyMusicRelated = false;
      if (!isMusicRelated) {
        const verificationResponse = await groq.chat.completions.create({
          messages: [{ role: 'user', content: `${message} Is it related to 'song', 'music', album', 'artist', 'genre', 'playlist', 'recommend'? Reply with 'yes' or 'no'.` }],
          model: 'llama3-8b-8192',
        });

        const verificationText = verificationResponse.choices[0]?.message?.content.toLowerCase().trim() || "";
        isPotentiallyMusicRelated = verificationText.includes("yes");
      }

      // Respond appropriately based on the checks
      if (isMusicRelated || isPotentiallyMusicRelated) {
        // Call the Groq API for the initial response
        const initialResponse = await groq.chat.completions.create({
          messages: [{ role: 'user', content: `${message} MUSIC` }],
          model: 'llama3-8b-8192',
        });

        const botResponse = initialResponse.choices[0]?.message?.content || "I'm not sure how to respond to that.";
        res.status(200).json({ sender: 'Bot', text: botResponse });
      } else {
        res.status(200).json({ sender: 'Bot', text: "I'm only here to recommend music. Please ask me about songs, albums, artists, or genres." });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
