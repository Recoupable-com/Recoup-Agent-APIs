import OpenAI from "openai";

/**
 * Response format for image generation
 */
interface ImageGenerationResponse {
  url: string;
  revised_prompt?: string;
}

/**
 * Configuration options for image generation
 */
interface GenerateImageOptions {
  size?: "1024x1024" | "1024x1792" | "1792x1024";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
}

/**
 * Generates an image using OpenAI's DALL-E 3 model
 * @param prompt The text description of the image to generate
 * @param options Configuration options for image generation
 * @returns Promise containing the image URL and any revised prompt
 * @throws Error if image generation fails
 */
export const generateImage = async (
  prompt: string,
  options: GenerateImageOptions = {}
): Promise<ImageGenerationResponse> => {
  if (!prompt || prompt.trim().length === 0) {
    throw new Error("Prompt cannot be empty");
  }

  try {
    const openai = new OpenAI();

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: options.size || "1024x1024",
      quality: options.quality || "standard",
      style: options.style || "vivid",
      response_format: "url",
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL in OpenAI response");
    }

    return {
      url: imageUrl,
      revised_prompt: response.data[0]?.revised_prompt,
    };
  } catch (error) {
    console.error("[OpenAI] Image generation error:", error);
    throw error;
  }
};
