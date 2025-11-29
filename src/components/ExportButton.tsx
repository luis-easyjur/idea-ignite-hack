import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  data?: any;
  filename?: string;
}

export const ExportButton = ({ data, filename = "relatorio" }: ExportButtonProps) => {
  const { toast } = useToast();

  const exportToPDF = () => {
    toast({
      title: "Exportando para PDF",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const exportToExcel = () => {
    if (!data) {
      toast({
        title: "Sem dados para exportar",
        variant: "destructive",
      });
      return;
    }

    const csvContent = convertToCSV(data);
    downloadFile(csvContent, `${filename}.csv`, "text/csv");

    toast({
      title: "Exportado com sucesso",
      description: "Dados exportados para Excel",
    });
  };

  const exportImage = () => {
    toast({
      title: "Exportando imagem",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const convertToCSV = (objArray: any) => {
    const array = typeof objArray !== "object" ? JSON.parse(objArray) : objArray;
    let str = "";

    for (let i = 0; i < array.length; i++) {
      let line = "";
      for (let index in array[i]) {
        if (line !== "") line += ",";
        line += array[i][index];
      }
      str += line + "\r\n";
    }
    return str;
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar como Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportImage}>
          <ImageIcon className="h-4 w-4 mr-2" />
          Exportar como Imagem
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};