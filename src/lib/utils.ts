import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
export function getImageSrc(picture: File | string | null): string {
  if (!picture) return '/default-image.png'; // fallback image
  if (typeof picture === 'string') return picture; // It's already a URL
  return URL.createObjectURL(picture); // It's a File
}

export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.log("🚀 ~ formatDate ~ error:", error)
    return 'Invalid date';
  }
};

