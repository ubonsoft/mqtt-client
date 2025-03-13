
import { useState, useEffect, useCallback } from 'react';
import { connectMqtt, subscribeTopic, unsubscribeTopic, publishMessage, disconnectMqtt } from '@/lib/mqtt-client';

/**
 * Custom hook สำหรับใช้งาน MQTT ใน React component
 * @param brokerUrl URL ของ MQTT broker
 * @param defaultTopic Topic เริ่มต้นที่จะ subscribe (optional)
 * @param options ตัวเลือกเพิ่มเติมสำหรับการเชื่อมต่อ MQTT
 */
export function useMqtt(
  brokerUrl: string,
  defaultTopic?: string,
  options: any = {}
) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<{ topic: string; message: string; timestamp: number }[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [subscribedTopics, setSubscribedTopics] = useState<string[]>(defaultTopic ? [defaultTopic] : []);

  // เชื่อมต่อกับ MQTT broker เมื่อ component mount
  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      try {
        await connectMqtt(brokerUrl, options);
        if (mounted) {
          setIsConnected(true);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('เกิดข้อผิดพลาดในการเชื่อมต่อ MQTT'));
          setIsConnected(false);
        }
      }
    };

    connect();

    // ปิดการเชื่อมต่อเมื่อ component unmount
    return () => {
      mounted = false;
      disconnectMqtt().catch(console.error);
    };
  }, [brokerUrl, options]);

  // Subscribe ไปยัง defaultTopic เมื่อเชื่อมต่อสำเร็จ
  useEffect(() => {
    if (isConnected && defaultTopic) {
      const handleMessage = (message: string, topic: string) => {
        setMessages(prev => [
          { topic, message, timestamp: Date.now() },
          ...prev.slice(0, 99) // เก็บเฉพาะ 100 ข้อความล่าสุด
        ]);
      };

      try {
        subscribeTopic(defaultTopic, handleMessage);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`เกิดข้อผิดพลาดในการ subscribe ${defaultTopic}`));
      }

      return () => {
        unsubscribeTopic(defaultTopic, handleMessage);
      };
    }
  }, [isConnected, defaultTopic]);

  // ฟังก์ชันสำหรับ subscribe ไปยัง topic ใหม่
  const subscribe = useCallback((topic: string) => {
    if (!isConnected) {
      setError(new Error('ยังไม่ได้เชื่อมต่อกับ MQTT broker'));
      return;
    }

    const handleMessage = (message: string, receivedTopic: string) => {
      setMessages(prev => [
        { topic: receivedTopic, message, timestamp: Date.now() },
        ...prev.slice(0, 99)
      ]);
    };

    try {
      subscribeTopic(topic, handleMessage);
      setSubscribedTopics(prev => {
        if (prev.includes(topic)) return prev;
        return [...prev, topic];
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`เกิดข้อผิดพลาดในการ subscribe ${topic}`));
    }

    // คืนค่าฟังก์ชันสำหรับ unsubscribe
    return () => {
      unsubscribeTopic(topic, handleMessage);
      setSubscribedTopics(prev => prev.filter(t => t !== topic));
    };
  }, [isConnected]);

  // ฟังก์ชันสำหรับส่งข้อความไปยัง topic
  const publish = useCallback((topic: string, message: string) => {
    if (!isConnected) {
      setError(new Error('ยังไม่ได้เชื่อมต่อกับ MQTT broker'));
      return false;
    }

    try {
      publishMessage(topic, message);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`เกิดข้อผิดพลาดในการส่งข้อความไปยัง ${topic}`));
      return false;
    }
  }, [isConnected]);

  // ฟังก์ชันสำหรับล้างข้อความ
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isConnected,
    messages,
    error,
    subscribedTopics,
    subscribe,
    publish,
    clearMessages
  };
}
