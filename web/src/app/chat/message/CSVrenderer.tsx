import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DownloadIcon, ExpandIcon, SwatchBookIcon } from 'lucide-react';
import { FileDescriptor } from '../interfaces';
import { CustomTooltip, TooltipGroup } from '@/components/tooltip/CustomTooltip';
import { Modal } from '@/components/Modal';
import { DexpandTwoIcon, DownloadCSVIcon, ExpandTwoIcon, OpenIcon } from '@/components/icons/icons';
import exp from 'constants';
import { ClosedCaptioning } from '@phosphor-icons/react';

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

const CSVUploaderAndDisplay = ({ csvFileDescriptor, close }: { csvFileDescriptor: FileDescriptor, close: () => void }) => {

  const [expanded, setExpanded] = useState(false)
  const expand = () => {
    setExpanded(expanded => !expanded)
  }

  return (
    <>
      {expanded &&
        <Modal onOutsideClick={() => setExpanded(false)} className='animate-all ease-in !p-0'>
          <CSVViewer close={close} expanded={expanded} expand={expand} csvFileDescriptor={csvFileDescriptor} />
        </Modal>
      }
      <div>
        <CSVViewer close={close} expanded={expanded} expand={expand} csvFileDescriptor={csvFileDescriptor} />
      </div>
    </>
  );
};

export const CSVViewer = ({ expand, csvFileDescriptor, expanded, close }: { close: () => void, expanded: boolean, expand: () => void, csvFileDescriptor: FileDescriptor }) => {

  // const [fileId, setFileId] = useState<string | null>(null);
  const [data, setData] = useState<CSVData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("CSV Data");
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileId = csvFileDescriptor.id
  useEffect(() => {
    fetchCSV(fileId);
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const uploadedFileId = await uploadFile(file);
      if (uploadedFileId) {
        // setFileId(uploadedFileId);
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
  )



  const downloadFile = () => {
    if (!fileId) return;

    const csvContent = [headers.join(',')].concat(
      data.map(row => headers.map(header => row[header]).join(','))
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${csvFileDescriptor.name || 'download'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  return (
    <div className={`${!expanded ? "!rounded !rounded-xl max-w-message-max" : "w-full"} !bg-neutral-50 w-full border `}>
      <CardHeader className="w-full !py-0 !pb-4 border-b  border-b-neutral-200  !pt-4  !mb-0 z-[10] top-0">
        <div className='flex justify-between items-center'>
          <CardTitle className='!my-auto !text-xl'>
            {csvFileDescriptor.name}
          </CardTitle>
          <div className='flex !my-auto'>
            <TooltipGroup>
              <CustomTooltip showTick line position='top' content="Download file">
                <button onClick={() => downloadFile()}>
                  <DownloadCSVIcon className='cursor-pointer transition-colors duration-300 hover:text-neutral-800 h-6 w-6 text-neutral-400' />
                </button>
              </CustomTooltip>
              <CustomTooltip line position='top' content={expanded ? "Minimize" : "Full screen"}>
                <button onClick={() => expand()}>
                  {!expanded ?
                    <ExpandTwoIcon className='transition-colors duration-300 ml-4 hover:text-neutral-800 h-6 w-6 cursor-pointer text-neutral-400' />
                    :
                    <DexpandTwoIcon className='transition-colors duration-300 ml-4 hover:text-neutral-800 h-6 w-6 cursor-pointer text-neutral-400' />
                  }
                </button>
              </CustomTooltip>
              <CustomTooltip line position='top' content="No vis">
                <button onClick={() => close()}>
                  <OpenIcon className='transition-colors duration-300 ml-4 hover:text-neutral-800 h-6 w-6 cursor-pointer text-neutral-400' />
                </button>
              </CustomTooltip>
            </TooltipGroup>
          </div>
        </div>
      </CardHeader>
      <Card className="w-full max-h-[600px] !p-0 relative overflow-x-scroll overflow-y-scroll mx-auto">
        <CardContent className='!mt-0 !p-0'>
          {isLoading ? (
            <div>Loading...</div>
          ) :

            <Table>
              <TableHeader>
                <TableRow className='!bg-neutral-100'>
                  {headers.map((header, index) => (
                    <TableHead key={index}>{index == 0 ? "" : header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className="max-h-[300px] overflow-y-auto">
                {filteredData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {headers.map((header, cellIndex) => (
                      <TableCell className={`${cellIndex == 0 && "!bg-neutral-100"}`} key={cellIndex}>{row[header]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
        </CardContent>
      </Card>
    </div>
  )
}

export default CSVUploaderAndDisplay;










// import React, { useState } from 'react';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { DownloadIcon, ExpandIcon, SwatchBookIcon } from 'lucide-react';

// interface CSVData {
//   [key: string]: string;
// }

// async function uploadFile(file: File): Promise<string | null> {
//   const formData = new FormData();
//   formData.append("file", file);
//   const response = await fetch("/api/admin/persona/upload-image", {
//     method: "POST",
//     body: formData,
//   });

//   if (!response.ok) {
//     console.error("Failed to upload file");
//     return null;
//   }

//   const responseJson = await response.json();
//   return responseJson.file_id;
// }

// const CSVUploaderAndDisplay = ({fileId}: {fileId: string}) => {
//   // const [fileId, setFileId] = useState<string | null>(null);
//   const [data, setData] = useState<CSVData[]>([]);
//   const [headers, setHeaders] = useState<string[]>([]);
//   const [title, setTitle] = useState<string>("CSV Data");
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setIsLoading(true);
//       const uploadedFileId = await uploadFile(file);
//       if (uploadedFileId) {
//         // setFileId(uploadedFileId);
//         await fetchCSV(uploadedFileId);
//       }
//       setIsLoading(false);
//     }
//   };

//   const fetchCSV = async (id: string) => {
//     try {
//       const response = await fetch(`api/chat/file/${id}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch CSV file');
//       }
//       const csvData = await response.text();
//       const rows = csvData.trim().split('\n');
//       const parsedHeaders = rows[0].split(',');
//       setHeaders(parsedHeaders);
//       setTitle(parsedHeaders[0] || "CSV Data");

//       const parsedData: CSVData[] = rows.slice(1).map(row => {
//         const values = row.split(',');
//         return parsedHeaders.reduce<CSVData>((obj, header, index) => {
//           obj[header] = values[index];
//           return obj;
//         }, {});
//       });
//       setData(parsedData);
//     } catch (error) {
//       console.error("Error fetching CSV file:", error);
//     }
//   };

//   const filteredData = data.filter(row =>
//     Object.values(row).some(value =>
//       value.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   );

//   return (
//     <Card className="w-full max-h-[400px] relative overflow-y-scroll max-w-4xl mx-auto">
//       <CardHeader className="sticky bg-background z-[1000] top-0">
//         <div className='flex justify-between '>
//           <CardTitle>
//             CSV + CSsee

//           </CardTitle>
//           <div className='flex gap-x-2'>
//           <DownloadIcon className='text-neutral-700'/>

//             <button>
//               <ExpandIcon className='text-neutral-700'/>
//             </button>
//           </div>
//         </div>
//         <div className="">
//           {/* <Input
//             type="file"
//             accept=".csv"
//             onChange={handleFileUpload}
//             disabled={isLoading}
//           /> */}
//           {fileId && (
//             <Input
//               type="text"
//               placeholder="Search..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           )}
//         </div>

//       </CardHeader>
//       <CardContent>
//         {isLoading ? (
//           <div>Loading...</div>
//         ) : fileId ? (
//           <div className="overflow-x-auto">
//             <Table className="relative">
//               <TableHeader className="">
//                 <TableRow>
//                   {headers.map((header, index) => (
//                     <TableHead key={index}>{header}</TableHead>
//                   ))}
//                 </TableRow>
//               </TableHeader>
//               <TableBody className="max-h-[300px] overflow-y-auto">
//                 {filteredData.map((row, rowIndex) => (
//                   <TableRow key={rowIndex}>
//                     {headers.map((header, cellIndex) => (
//                       <TableCell key={cellIndex}>{row[header]}</TableCell>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//             {/* <Table>
//               <TableHeader>
//                 <TableRow>
//                   {headers.map((header, index) => (
//                     <TableHead key={index}>{header}</TableHead>
//                   ))}
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredData.map((row, rowIndex) => (
//                   <TableRow key={rowIndex}>
//                     {headers.map((header, cellIndex) => (
//                       <TableCell key={cellIndex}>{row[header]}</TableCell>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table> */}
//           </div>
//         ) : (
//           <div>Please upload a CSV file to display data.</div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default CSVUploaderAndDisplay;