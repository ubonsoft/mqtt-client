
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

const Index = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    if (date) {
      // Format the date to show only the date part (without time)
      setFormattedDate(format(date, "yyyy-MM-dd"));
    }
  }, [date]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">แสดงวันที่</h1>
        
        <div className="grid gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>เลือกวันที่</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>วันที่ที่เลือก (ไม่มีเวลา)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-medium">{formattedDate}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
