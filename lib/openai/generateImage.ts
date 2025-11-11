import OpenAI from "openai";

/**
 * Generates an image using OpenAI's DALL-E 3 model
 * @param prompt The text description of the image to generate
 * @returns Promise containing the image response from OpenAI
 * @throws Error if image generation fails
 */
export const generateImage = async (
  prompt: string
): Promise<OpenAI.Images.ImagesResponse> => {
  if (!prompt || prompt.trim().length === 0) {
    throw new Error("Prompt cannot be empty");
  }

  try {
    const openai = new OpenAI();

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
    });

    return response;
  } catch (error) {
    console.error("[OpenAI] Image generation error:", error);
    throw error;
  }
};
