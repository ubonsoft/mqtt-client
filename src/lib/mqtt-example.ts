
/**
 * ตัวอย่างการใช้ MQTT กับ Node.js
 * 
 * วิธีใช้งาน:
 * 1. ติดตั้ง mqtt package: npm install mqtt
 * 2. เรียกใช้ฟังก์ชัน connectAndSubscribe โดยระบุ broker URL และ topic
 * 
 * หมายเหตุ: ไฟล์นี้เป็นตัวอย่างเพื่อนำไปปรับใช้กับ Node.js โดยตรง
 * ไม่ได้ถูกออกแบบให้ทำงานบนเว็บบราวเซอร์
 */

// นำเข้า MQTT
// import mqtt from 'mqtt'; // ต้องติดตั้ง mqtt package ก่อน

/**
 * เชื่อมต่อกับ MQTT broker และ subscribe ไปยัง topic ที่ระบุ
 * @param brokerUrl URL ของ MQTT broker เช่น 'mqtt://broker.hivemq.com'
 * @param topic Topic ที่ต้องการ subscribe เช่น 'test/topic'
 * @param options ตัวเลือกเพิ่มเติมสำหรับการเชื่อมต่อ
 */
export function connectAndSubscribe(
  brokerUrl: string,
  topic: string,
  options: {
    clientId?: string;
    username?: string;
    password?: string;
    clean?: boolean;
    reconnectPeriod?: number;
  } = {}
) {
  // สร้าง Client ID แบบสุ่มถ้าไม่ได้ระบุมา
  const clientId = options.clientId || `mqtt_client_${Math.random().toString(16).substring(2, 10)}`;
  
  const defaultOptions = {
    clientId,
    clean: options.clean !== undefined ? options.clean : true,
    reconnectPeriod: options.reconnectPeriod || 1000,
    username: options.username,
    password: options.password
  };

  console.log(`กำลังเชื่อมต่อกับ MQTT broker ที่ ${brokerUrl}`);
  
  try {
    // ในตัวอย่างนี้เราเพียงแค่แสดงโค้ด แต่ไม่ได้ import mqtt จริง
    // เนื่องจากเป็นตัวอย่างสำหรับ Node.js ไม่ใช่เว็บ
    
    // สำหรับใช้งานจริงใน Node.js ให้เขียนแบบนี้:
    // const client = mqtt.connect(brokerUrl, defaultOptions);
    
    // client.on('connect', () => {
    //   console.log(`เชื่อมต่อสำเร็จ, กำลัง subscribe ไปยัง ${topic}`);
    //   client.subscribe(topic, (err) => {
    //     if (err) {
    //       console.error('เกิดข้อผิดพลาดในการ subscribe:', err);
    //     } else {
    //       console.log(`Subscribe ไปยัง ${topic} สำเร็จ`);
    //     }
    //   });
    // });
    
    // client.on('message', (receivedTopic, message) => {
    //   console.log(`ได้รับข้อความจาก ${receivedTopic}: ${message.toString()}`);
    // });
    
    // client.on('error', (error) => {
    //   console.error('เกิดข้อผิดพลาดในการเชื่อมต่อ MQTT:', error);
    // });
    
    // return client;
    
    // สำหรับตัวอย่างนี้ เราจะ return null เนื่องจากเป็นเพียงตัวอย่างโค้ด
    return null;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อ MQTT:', error);
    throw error;
  }
}

/**
 * ตัวอย่างโค้ด Node.js สำหรับการ subscribe และจัดการกับข้อความ MQTT
 */
export function mqttNodejsExample() {
  const nodeJsCode = `
// นำเข้า mqtt package
const mqtt = require('mqtt');

// กำหนดค่า
const broker = 'mqtt://broker.hivemq.com'; // MQTT broker สาธารณะสำหรับทดสอบ
const topic = 'test/topic';
const clientId = \`mqtt_client_\${Math.random().toString(16).slice(2, 10)}\`;

// เชื่อมต่อกับ MQTT broker
const client = mqtt.connect(broker, {
  clientId,
  clean: true,
  reconnectPeriod: 1000
});

// เมื่อเชื่อมต่อสำเร็จ
client.on('connect', () => {
  console.log('เชื่อมต่อกับ MQTT broker สำเร็จ');
  
  // Subscribe ไปยัง topic
  client.subscribe(topic, (err) => {
    if (!err) {
      console.log(\`Subscribe ไปยัง \${topic} สำเร็จ\`);
      
      // ส่งข้อความทดสอบ
      client.publish(topic, 'สวัสดี MQTT!');
    } else {
      console.error('เกิดข้อผิดพลาดในการ subscribe:', err);
    }
  });
});

// เมื่อได้รับข้อความ
client.on('message', (receivedTopic, message) => {
  console.log(\`ได้รับข้อความจาก \${receivedTopic}: \${message.toString()}\`);
});

// จัดการกับข้อผิดพลาด
client.on('error', (error) => {
  console.error('เกิดข้อผิดพลาดในการเชื่อมต่อ MQTT:', error);
});

// ปิดการเชื่อมต่อเมื่อโปรแกรมถูกปิด
process.on('SIGINT', () => {
  console.log('กำลังยกเลิกการเชื่อมต่อ MQTT...');
  client.end();
  process.exit();
});
`;

  return nodeJsCode;
}
