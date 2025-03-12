
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * แปลง timestamp เป็นวันที่โดยไม่มีเวลา
 * @param timestamp - timestamp ในรูปแบบ number หรือ string
 * @returns วันที่ในรูปแบบ YYYY-MM-DD
 */
export function timestampToDateOnly(timestamp: number | string): string {
  // แปลง timestamp เป็น Date object
  const date = new Date(Number(timestamp));
  
  // ฟอร์แมตวันที่เป็น YYYY-MM-DD โดยไม่มีเวลา
  return format(date, "yyyy-MM-dd");
}
