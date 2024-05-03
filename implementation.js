async function image_generation_via_stable_diffusion(params, userSettings) {
  const { prompt } = params;
  const { stabilityAPIKey, width, height } = userSettings;
  validateAPIKey(stabilityAPIKey);

  try {
    const imageData = await generateImageFromStabilityAPI(
      stabilityAPIKey,
      prompt,
      Number(width) || 512,
      Number(height) || 512
    );

    return imageData;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error(`Error: ${error.message}`);
  }
}

function validateAPIKey(apiKey) {
  if (!apiKey) {
    throw new Error(
      'Please set a Stable Diffusion API Key in the plugin settings.'
    );
  }
}
async function generateImageFromStabilityAPI(apiKey, prompt, width, height) {
  const apiUrl =
    'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt }],
      cfg_scale: 7,
      samples: 1,
      steps: 30,
      width: width,
      height: height,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Stability API error: ${response.status}, Message: ${errorText}`
    );
  }

  const data = await response.json();
  return `![${prompt}](data:image/png;base64,${data.artifacts[0].base64})`;
}
