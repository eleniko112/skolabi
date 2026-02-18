'use server';
/**
 * @fileOverview A Genkit flow for generating engaging announcements based on keywords or a brief idea.
 *
 * - generateAnnouncement - A function that handles the announcement generation process.
 * - GenerateAnnouncementInput - The input type for the generateAnnouncement function.
 * - GenerateAnnouncementOutput - The return type for the generateAnnouncement function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAnnouncementInputSchema = z.object({
  promptText: z
    .string()
    .describe(
      'Keywords or a brief idea for the announcement. The AI should expand on this to create an engaging message.'
    ),
});
export type GenerateAnnouncementInput = z.infer<
  typeof GenerateAnnouncementInputSchema
>;

const GenerateAnnouncementOutputSchema = z.object({
  announcementText: z.string().describe('The AI-generated engaging announcement.'),
});
export type GenerateAnnouncementOutput = z.infer<
  typeof GenerateAnnouncementOutputSchema
>;

export async function generateAnnouncement(
  input: GenerateAnnouncementInput
): Promise<GenerateAnnouncementOutput> {
  return generateAnnouncementFlow(input);
}

const announcementPrompt = ai.definePrompt({
  name: 'announcementPrompt',
  input: { schema: GenerateAnnouncementInputSchema },
  output: { schema: GenerateAnnouncementOutputSchema },
  prompt: `You are an expert copywriter tasked with drafting engaging announcements for a school information board. Your goal is to create a clear, concise, and captivating message that informs and interests the audience.

Draft an engaging announcement based on the following idea or keywords:

Idea/Keywords: {{{promptText}}}

Ensure the announcement is suitable for a school environment and encourages positive engagement.`,
});

const generateAnnouncementFlow = ai.defineFlow(
  {
    name: 'generateAnnouncementFlow',
    inputSchema: GenerateAnnouncementInputSchema,
    outputSchema: GenerateAnnouncementOutputSchema,
  },
  async (input) => {
    const { output } = await announcementPrompt(input);
    if (!output) {
      throw new Error('Failed to generate announcement text.');
    }
    return output;
  }
);
