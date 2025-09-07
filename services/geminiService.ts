import { GoogleGenAI } from '@google/genai';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type AspectRatio = '16:9' | '1:1' | '9:16';

/**
 * Generates one or more 3D Pixar-style images based on a user prompt.
 * @param userPrompt The user's description of the image to create.
 * @param aspectRatio The desired aspect ratio for the image.
 * @param numberOfImages The number of images to generate.
 * @returns A promise that resolves to an array of base64 encoded strings of the generated JPEG images.
 */
export const generatePixarImages = async (
  userPrompt: string,
  aspectRatio: AspectRatio,
  numberOfImages: number = 1
): Promise<string[]> => {
  // Construct a detailed prompt to guide the AI towards the desired style.
  const fullPrompt = `A cinematic, 3D Pixar-style render of: "${userPrompt}". Emphasize cinematic lighting, a vibrant color palette, and high detail to capture the signature look of a modern animated film. Ultra-detailed, sharp focus, movie-quality.`;

  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: numberOfImages,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("The API did not return any images.");
    }
    
    return response.generatedImages.map(img => img.image.imageBytes);

  } catch (error) {
    console.error("Error generating image:", error);
    
    let friendlyMessage = "An unexpected error occurred while generating the image. Please try again.";

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('api key not valid') || message.includes('permission denied')) {
        friendlyMessage = "API Key Issue: Please verify that your API key is correct and has the necessary permissions enabled in your Google AI Studio dashboard.";
      } else if (message.includes('quota')) {
        friendlyMessage = "Usage Limit Reached: You have exceeded your API quota. Please check your billing status or wait until your quota renews.";
      } else if (message.includes('safety policy') || message.includes('blocked')) {
        friendlyMessage = "Prompt Blocked: Your prompt may contain sensitive content. Please try rephrasing your request to be more general and safe for all audiences.";
      } else if (message.includes('network error') || message.includes('failed to fetch')) {
        friendlyMessage = "Network Problem: We couldn't connect to the image generation service. Please check your internet connection and try again.";
      }
    }
    
    throw new Error(friendlyMessage);
  }
};
