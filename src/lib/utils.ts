
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

/**
 * แปลง timestamp เป็นวันที่โดยไม่มีเวลา โดยไม่ใช้ไลบรารีภายนอก
 * @param timestamp - timestamp ในรูปแบบ number หรือ string
 * @returns วันที่ในรูปแบบ YYYY-MM-DD
 */
export function timestampToDateOnlyNative(timestamp: number | string): string {
  // แปลง timestamp เป็น Date object
  const date = new Date(Number(timestamp));
  
  // ดึงค่าปี เดือน วัน
  const year = date.getFullYear();
  // getMonth() จะคืนค่า 0-11 จึงต้อง +1 และเติม 0 ด้านหน้าถ้าเป็นเลขหลักเดียว
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // สร้างสตริงในรูปแบบ YYYY-MM-DD
  return `${year}-${month}-${day}`;
}

/**
 * สุ่มอักษร A-Z ตัวใหญ่ และตัวเลข 0-9 จำนวน 10 ตัว
 * @returns สตริงที่ประกอบด้วยตัวอักษร A-Z และตัวเลข 0-9 จำนวน 10 ตัว
 */
export function generateRandomAlphanumeric10(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}
