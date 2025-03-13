
import mqtt, { MqttClient, IClientOptions } from 'mqtt';

let client: MqttClient | null = null;
const subscribers: Map<string, Set<(message: string, topic: string) => void>> = new Map();

/**
 * เชื่อมต่อกับ MQTT broker
 * @param brokerUrl URL ของ MQTT broker เช่น 'wss://broker.emqx.io:8084/mqtt'
 * @param options ตัวเลือกเพิ่มเติมสำหรับการเชื่อมต่อ
 * @returns MQTT client
 */
export function connectMqtt(
  brokerUrl: string,
  options: IClientOptions = {}
): Promise<MqttClient> {
  return new Promise((resolve, reject) => {
    // ถ้ามี client อยู่แล้ว ให้ใช้ client เดิม
    if (client) {
      resolve(client);
      return;
    }

    // กำหนดค่าเริ่มต้น
    const defaultOptions: IClientOptions = {
      clientId: `web_client_${Math.random().toString(16).substring(2, 10)}`,
      clean: true,
      reconnectPeriod: 3000,
      ...options
    };

    console.log(`กำลังเชื่อมต่อกับ MQTT broker ที่ ${brokerUrl}`);
    try {
      client = mqtt.connect(brokerUrl, defaultOptions);

      client.on('connect', () => {
        console.log('เชื่อมต่อกับ MQTT broker สำเร็จ');
        resolve(client as MqttClient);
      });

      client.on('error', (error) => {
        console.error('เกิดข้อผิดพลาดในการเชื่อมต่อ MQTT:', error);
        reject(error);
      });

      client.on('message', (topic, message) => {
        const messageStr = message.toString();
        console.log(`ได้รับข้อความจาก ${topic}: ${messageStr}`);
        
        // ส่งข้อความไปยัง subscribers ทั้งหมดที่ subscribe topic นี้
        const topicSubscribers = subscribers.get(topic);
        if (topicSubscribers) {
          topicSubscribers.forEach(callback => callback(messageStr, topic));
        }
      });

      client.on('close', () => {
        console.log('การเชื่อมต่อ MQTT ถูกปิด');
        client = null;
      });
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเชื่อมต่อ MQTT:', error);
      reject(error);
    }
  });
}

/**
 * Subscribe ไปยัง topic และลงทะเบียน callback เพื่อรับข้อความ
 * @param topic Topic ที่ต้องการ subscribe
 * @param callback ฟังก์ชันที่จะถูกเรียกเมื่อได้รับข้อความใหม่
 */
export function subscribeTopic(
  topic: string,
  callback: (message: string, topic: string) => void
): void {
  if (!client) {
    throw new Error('ยังไม่ได้เชื่อมต่อกับ MQTT broker กรุณาเรียก connectMqtt ก่อน');
  }

  // ลงทะเบียน callback
  if (!subscribers.has(topic)) {
    subscribers.set(topic, new Set());
    
    // Subscribe ไปยัง topic เฉพาะเมื่อเป็น subscriber คนแรก
    client.subscribe(topic, (err) => {
      if (err) {
        console.error(`เกิดข้อผิดพลาดในการ subscribe ${topic}:`, err);
      } else {
        console.log(`Subscribe ไปยัง ${topic} สำเร็จ`);
      }
    });
  }
  
  const topicSubscribers = subscribers.get(topic);
  if (topicSubscribers) {
    topicSubscribers.add(callback);
  }
}

/**
 * ยกเลิกการลงทะเบียน callback สำหรับ topic
 * @param topic Topic ที่ต้องการยกเลิก subscription
 * @param callback ฟังก์ชันที่เคยลงทะเบียนไว้
 */
export function unsubscribeTopic(
  topic: string,
  callback: (message: string, topic: string) => void
): void {
  if (!client) return;

  const topicSubscribers = subscribers.get(topic);
  if (topicSubscribers) {
    topicSubscribers.delete(callback);
    
    // ถ้าไม่มี subscriber เหลืออยู่ ให้ unsubscribe topic
    if (topicSubscribers.size === 0) {
      subscribers.delete(topic);
      client.unsubscribe(topic);
      console.log(`Unsubscribe จาก ${topic} สำเร็จ`);
    }
  }
}

/**
 * ส่งข้อความไปยัง topic
 * @param topic Topic ที่ต้องการส่งข้อความไป
 * @param message ข้อความที่ต้องการส่ง
 */
export function publishMessage(topic: string, message: string): void {
  if (!client) {
    throw new Error('ยังไม่ได้เชื่อมต่อกับ MQTT broker กรุณาเรียก connectMqtt ก่อน');
  }

  client.publish(topic, message);
  console.log(`ส่งข้อความไปยัง ${topic}: ${message}`);
}

/**
 * ปิดการเชื่อมต่อ MQTT
 */
export function disconnectMqtt(): Promise<void> {
  return new Promise((resolve) => {
    if (!client) {
      resolve();
      return;
    }

    client.end(true, {}, () => {
      client = null;
      subscribers.clear();
      console.log('ปิดการเชื่อมต่อ MQTT สำเร็จ');
      resolve();
    });
  });
}
