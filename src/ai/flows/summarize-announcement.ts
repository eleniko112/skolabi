'use server';
/**
 * @fileOverview This flow provides an AI agent to summarize long texts into concise announcements.
 *
 * - summarizeAnnouncement - A function that summarizes a given text into a concise announcement.
 * - SummarizeAnnouncementInput - The input type for the summarizeAnnouncement function.
 * - SummarizeAnnouncementOutput - The return type for the summarizeAnnouncement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAnnouncementInputSchema = z.object({
  text: z.string().describe('The long text to be summarized.'),
});
export type SummarizeAnnouncementInput = z.infer<typeof SummarizeAnnouncementInputSchema>;

const SummarizeAnnouncementOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the provided text, suitable for an announcement.'),
});
export type SummarizeAnnouncementOutput = z.infer<typeof SummarizeAnnouncementOutputSchema>;

export async function summarizeAnnouncement(
  input: SummarizeAnnouncementInput
): Promise<SummarizeAnnouncementOutput> {
  return summarizeAnnouncementFlow(input);
}

const summarizeAnnouncementPrompt = ai.definePrompt({
  name: 'summarizeAnnouncementPrompt',
  input: {schema: SummarizeAnnouncementInputSchema},
  output: {schema: SummarizeAnnouncementOutputSchema},
  prompt: `შენ ხარ AI ასისტენტი, რომელსაც ევალება გრძელი ტექსტების შეჯამება სკოლის საინფორმაციო დაფისთვის ლაკონურ განცხადებებად. შეჯამება უნდა იყოს ადვილად წასაკითხი და ეტეოდეს შეზღუდულ ჩვენების არეში.

შეაჯამე შემდეგი ტექსტი:

ტექსტი: {{{text}}}

წარმოადგინე ლაკონური შეჯამება, რომელიც მოიცავს ძირითად პუნქტებს.`,
});

const summarizeAnnouncementFlow = ai.defineFlow(
  {
    name: 'summarizeAnnouncementFlow',
    inputSchema: SummarizeAnnouncementInputSchema,
    outputSchema: SummarizeAnnouncementOutputSchema,
  },
  async input => {
    const {output} = await summarizeAnnouncementPrompt(input);
    return output!;
  }
);
