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
  prompt: `შენ ხარ ექსპერტი კოპირაიტერი, რომელსაც ევალება სკოლის საინფორმაციო დაფისთვის მიმზიდველი განცხადებების შედგენა. შენი მიზანია შექმნა ნათელი, ლაკონური და მიმზიდველი მესიჯი, რომელიც აუდიტორიას მიაწვდის ინფორმაციას და დააინტერესებს.

შეადგინე მიმზიდველი განცხადება შემდეგ იდეაზე ან საკვანძო სიტყვებზე დაყრდნობით:

იდეა/საკვანძო სიტყვები: {{{promptText}}}

დარწმუნდი, რომ განცხადება შეესაბამება სასკოლო გარემოს და ხელს უწყობს პოზიტიურ ჩართულობას.`,
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
