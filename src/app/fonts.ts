// src/app/fonts.ts
import { Saira, Merienda } from 'next/font/google';

export const saira = Saira({
    subsets: ['latin'],
    weight: ['300', '400', '500', '700'], // Adjust weights as needed
    style: ['normal', 'italic'],   // Include 'italic' if needed
    display: 'swap', // Important for performance
    variable: '--font-saira', // Add this line!
});

export const merienda = Merienda({
    subsets: ['latin'],  // Always include at least 'latin'
    weight: ['400', '700'], // Choose the weights you need from Google Fonts
    // style: ['normal', 'italic'],  // Only if you need italic.
    display: 'swap',
    variable: '--font-merienda', // CSS variable for Merienda
});