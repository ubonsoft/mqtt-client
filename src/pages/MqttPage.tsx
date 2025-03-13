
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

// ค่าเริ่มต้นสำหรับ MQTT broker
const DEFAULT_BROKER = '';
const DEFAULT_TOPIC = '';

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
    <div className="min-h-screen bg-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6 border-green-200 shadow-md">
          <CardHeader className="bg-green-100 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-green-800">MQTT Event Listener</CardTitle>
              <Badge variant={isConnected ? "default" : "destructive"} className={isConnected ? "bg-green-500" : ""}>
                {isConnected ? "เชื่อมต่อแล้ว" : "ไม่ได้เชื่อมต่อ"}
              </Badge>
            </div>
            <CardDescription className="text-green-700">
              ฟังและรับข้อความจาก MQTT broker
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-800">Broker URL:</span>
                {isEditing ? (
                  <Input 
                    value={broker} 
                    onChange={(e) => setBroker(e.target.value)}
                    className="flex-1 border-green-300 focus:ring-green-500"
                  />
                ) : (
                  <span className="flex-1 text-green-700">{broker}</span>
                )}
                <Button 
                  onClick={() => setIsEditing(!isEditing)} 
                  variant="outline" 
                  size="sm"
                  className="border-green-400 text-green-700 hover:bg-green-100"
                >
                  {isEditing ? "บันทึก" : "แก้ไข"}
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <div className="font-semibold mb-2 text-green-800">Topic ที่ Subscribe:</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {subscribedTopics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="bg-green-200 text-green-800">{topic}</Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="ใส่ topic ที่ต้องการ subscribe"
                  ref={topicInputRef}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                  className="border-green-300 focus:ring-green-500"
                />
                <Button 
                  onClick={handleSubscribe}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="listen" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-green-100">
            <TabsTrigger value="listen" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">รับข้อความ</TabsTrigger>
            <TabsTrigger value="send" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">ส่งข้อความ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="listen">
            <Card className="border-green-200 shadow-md">
              <CardHeader className="bg-green-100 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-800">ข้อความที่ได้รับ</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearMessages}
                    className="border-green-400 text-green-700 hover:bg-green-100"
                  >
                    ล้างข้อความ
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] rounded-md border border-green-200 p-4 bg-white">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-green-500">
                      ยังไม่มีข้อความ
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, index) => (
                        <div key={index} className="p-3 border border-green-100 rounded-md bg-green-50">
                          <div className="flex justify-between mb-1">
                            <Badge variant="outline" className="border-green-300 text-green-700">{msg.topic}</Badge>
                            <span className="text-xs text-green-600">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="font-mono text-sm break-all text-green-800">
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
            <Card className="border-green-200 shadow-md">
              <CardHeader className="bg-green-100 rounded-t-lg">
                <CardTitle className="text-green-800">ส่งข้อความ</CardTitle>
                <CardDescription className="text-green-700">
                  ส่งข้อความไปยัง MQTT topic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-green-800">
                      Topic (ถ้าไม่ระบุจะใช้ค่าเริ่มต้น: {DEFAULT_TOPIC})
                    </label>
                    <Input
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder={DEFAULT_TOPIC}
                      className="border-green-300 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-green-800">
                      ข้อความ
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="ใส่ข้อความที่ต้องการส่ง"
                        onKeyPress={(e) => e.key === 'Enter' && handlePublish()}
                        className="border-green-300 focus:ring-green-500"
                      />
                      <Button 
                        variant="outline"
                        onClick={handleGenerateRandomMessage}
                        className="border-green-400 text-green-700 hover:bg-green-100"
                      >
                        สุ่ม
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-green-50">
                <Button 
                  onClick={handlePublish} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  ส่งข้อความ
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MqttPage;
