const POE_API_URL = 'https://api.poe.com/v1/chat/completions';
const POE_API_KEY = import.meta.env.VITE_POE_API_KEY;

export async function analyzeSignImage(imageBase64) {
  try {
    const response = await fetch(POE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5.2',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this Australian parking sign and create a quiz question.

The sign shows parking restrictions with arrows indicating which direction the rules apply.

Based on the sign, generate a JSON response with:
1. A realistic scenario (day of week, time, and parking duration needed)
2. Available parking spots (always include Spot A, Spot B, and optionally Spot C if there are multiple signs)
3. The correct answer (which spot can be used, or "other" if none are valid)

Important rules:
- Arrows point to which direction the parking restrictions apply
- If arrow points left, the restriction applies to the LEFT side
- If arrow points right, the restriction applies to the RIGHT side
- If arrow points both ways, restrictions apply to both sides
- Consider time restrictions (e.g., "MON-FRI", "8AM-5PM")
- Consider permit zones vs public parking
- Consider time limits (e.g., "2P" means 2 hours maximum)

Return ONLY valid JSON in this exact format:
{
  "scenario": {
    "day": "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday",
    "time": "HH:MM AM/PM",
    "duration": "X hour(s)|X minutes"
  },
  "spots": [
    {"id": "A", "label": "Spot A"},
    {"id": "B", "label": "Spot B"},
    {"id": "other", "label": "Find Another Spot"}
  ],
  "correctAnswer": "A|B|C|other",
  "explanation": "Brief explanation of why this is the correct answer"
}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`POE API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from AI response');
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    return parsedData;
  } catch (error) {
    console.error('Error analyzing sign with POE API:', error);
    throw error;
  }
}

export async function getRandomSignImage() {
  // List of available sign images in the signs folder
  const signImages = [
    'Screenshot 2026-01-27 at 18.10.55.png',
    'Screenshot 2026-01-27 at 18.20.48.png',
    'Screenshot 2026-01-28 at 10.28.25 PM.png',
    'Screenshot 2026-01-28 at 10.29.07 PM.png',
    'signs-08.jpg'
  ];

  // Pick a random image
  const randomImage = signImages[Math.floor(Math.random() * signImages.length)];
  const imagePath = `/signs/${randomImage}`;

  // Fetch the image and convert to base64
  const response = await fetch(imagePath);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      resolve({ base64: base64String, path: imagePath });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
