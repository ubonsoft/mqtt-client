
import React, { useState } from "react";
import { timestampToDateOnly } from "@/lib/utils";

const Index = () => {
  const [timestamp, setTimestamp] = useState<string>("");
  const [dateOnly, setDateOnly] = useState<string>("");

  const handleConvert = () => {
    try {
      const result = timestampToDateOnly(timestamp);
      setDateOnly(result);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการแปลง timestamp:", error);
      setDateOnly("รูปแบบ timestamp ไม่ถูกต้อง");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">แปลง Timestamp เป็นวันที่</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 mb-1">
              Timestamp:
            </label>
            <input
              type="text"
              id="timestamp"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="ใส่ timestamp เช่น 1656633600000"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            onClick={handleConvert}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            แปลงเป็นวันที่
          </button>
          
          {dateOnly && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">ผลลัพธ์:</h2>
              <p className="text-xl p-2 bg-gray-50 border border-gray-200 rounded-md">{dateOnly}</p>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-600">
            <p>ตัวอย่าง Timestamp:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>1656633600000 (30 มิถุนายน 2022)</li>
              <li>1672531200000 (1 มกราคม 2023)</li>
              <li>1687392000000 (22 มิถุนายน 2023)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
