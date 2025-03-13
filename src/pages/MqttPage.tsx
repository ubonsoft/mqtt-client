
import React, { useState, useRef, useEffect } from 'react';
import { useMqtt } from '@/hooks/use-mqtt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from "@/components/ui/use-toast";
import { generateRandomAlphanumeric10 } from '@/lib/utils';

// ค่าเริ่มต้นสำหรับ MQTT broker (ใช้ broker สาธารณะสำหรับทดสอบ)
const DEFAULT_BROKER = 'wss://broker.emqx.io:8084/mqtt';
const DEFAULT_TOPIC = 'thai/mqtt/test';

const MqttPage: React.FC = () => {
  const [broker, setBroker] = useState(DEFAULT_BROKER);
  const [isEditing, setIsEditing] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [messageText, setMessageText] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const topicInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isConnected,
    messages,
    error,
    subscribedTopics,
    subscribe,
    publish,
    clearMessages
  } = useMqtt(broker, DEFAULT_TOPIC);

  // เมื่อมี error ให้แสดง toast
  useEffect(() => {
    if (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [error]);

  // ฟังก์ชันสำหรับ subscribe ไปยัง topic ใหม่
  const handleSubscribe = () => {
    if (!newTopic.trim()) return;
    subscribe(newTopic);
    setNewTopic('');
    
    toast({
      title: "สำเร็จ",
      description: `Subscribe ไปยัง ${newTopic} สำเร็จ`,
    });
  };

  // ฟังก์ชันสำหรับส่งข้อความ
  const handlePublish = () => {
    if (!messageText.trim()) return;
    
    const topicToPublish = customTopic.trim() || DEFAULT_TOPIC;
    const success = publish(topicToPublish, messageText);
    
    if (success) {
      toast({
        title: "ส่งข้อความสำเร็จ",
        description: `ส่งข้อความไปยัง ${topicToPublish} สำเร็จ`,
      });
      setMessageText('');
    }
  };

  // สร้างข้อความแบบสุ่ม
  const handleGenerateRandomMessage = () => {
    setMessageText(generateRandomAlphanumeric10());
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">MQTT Event Listener</CardTitle>
              <Badge variant={isConnected ? "success" : "destructive"}>
                {isConnected ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
              </Badge>
            </div>
            <CardDescription>
              ฟังและรับข้อความจาก MQTT broker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Broker URL:</span>
                {isEditing ? (
                  <Input 
                    value={broker} 
                    onChange={(e) => setBroker(e.target.value)}
                    className="flex-1"
                  />
                ) : (
                  <span className="flex-1">{broker}</span>
                )}
                <Button 
                  onClick={() => setIsEditing(!isEditing)} 
                  variant="outline" 
                  size="sm"
                >
                  {isEditing ? "บันทึก" : "แก้ไข"}
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <div className="font-semibold mb-2">Topic ที่ Subscribe:</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {subscribedTopics.map((topic) => (
                  <Badge key={topic} variant="secondary">{topic}</Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="ใส่ topic ที่ต้องการ subscribe"
                  ref={topicInputRef}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                />
                <Button onClick={handleSubscribe}>Subscribe</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="listen">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="listen">รับข้อความ</TabsTrigger>
            <TabsTrigger value="send">ส่งข้อความ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="listen">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ข้อความที่ได้รับ</CardTitle>
                  <Button variant="outline" size="sm" onClick={clearMessages}>ล้างข้อความ</Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      ยังไม่มีข้อความ
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, index) => (
                        <div key={index} className="p-3 border rounded-md bg-gray-50">
                          <div className="flex justify-between mb-1">
                            <Badge variant="outline">{msg.topic}</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="font-mono text-sm break-all">
                            {msg.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>ส่งข้อความ</CardTitle>
                <CardDescription>
                  ส่งข้อความไปยัง MQTT topic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Topic (ถ้าไม่ระบุจะใช้ค่าเริ่มต้น: {DEFAULT_TOPIC})
                    </label>
                    <Input
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder={DEFAULT_TOPIC}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ข้อความ
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="ใส่ข้อความที่ต้องการส่ง"
                        onKeyPress={(e) => e.key === 'Enter' && handlePublish()}
                      />
                      <Button 
                        variant="outline"
                        onClick={handleGenerateRandomMessage}
                      >
                        สุ่ม
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handlePublish} className="w-full">ส่งข้อความ</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MqttPage;
