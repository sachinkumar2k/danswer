import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CSVData {
  [key: string]: string;
}

async function uploadFile(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/admin/persona/upload-image", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    console.error("Failed to upload file");
    return null;
  }

  const responseJson = await response.json();
  return responseJson.file_id;
}

const CSVUploaderAndDisplay: React.FC = () => {
  const [fileId, setFileId] = useState<string | null>(null);
  const [data, setData] = useState<CSVData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("CSV Data");
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const uploadedFileId = await uploadFile(file);
      if (uploadedFileId) {
        setFileId(uploadedFileId);
        await fetchCSV(uploadedFileId);
      }
      setIsLoading(false);
    }
  };

  const fetchCSV = async (id: string) => {
    try {
      const response = await fetch(`api/chat/file/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch CSV file');
      }
      const csvData = await response.text();
      const rows = csvData.trim().split('\n');
      const parsedHeaders = rows[0].split(',');
      setHeaders(parsedHeaders);
      setTitle(parsedHeaders[0] || "CSV Data");

      const parsedData: CSVData[] = rows.slice(1).map(row => {
        const values = row.split(',');
        return parsedHeaders.reduce<CSVData>((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });
      setData(parsedData);
    } catch (error) {
      console.error("Error fetching CSV file:", error);
    }
  };

  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Card className="w-full max-h-[400px] relative overflow-y-scroll max-w-4xl mx-auto">
      <CardHeader className="sticky bg-background z-[1000] top-0">
        <CardTitle className='mb-2'>CSV + CSsee</CardTitle>
        <div className="">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isLoading}
          />
          {fileId && (
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading...</div>
        ) : fileId ? (
          <div className="overflow-x-auto">
            <Table className="relative">
              <TableHeader className="">
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHead key={index}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="max-h-[300px] overflow-y-auto">
                {filteredData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {headers.map((header, cellIndex) => (
                      <TableCell key={cellIndex}>{row[header]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHead key={index}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {headers.map((header, cellIndex) => (
                      <TableCell key={cellIndex}>{row[header]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table> */}
          </div>
        ) : (
          <div>Please upload a CSV file to display data.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default CSVUploaderAndDisplay;