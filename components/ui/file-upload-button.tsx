import { useRef } from "react";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Props = {
  onFileSelect: (file: File) => void;
};

export default function FileUploadButton({ onFileSelect }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const MAX_SIZE = 10 * 1024 * 1024;

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      toast.error("File must be less than 10MB");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only .pdf and .docx files are allowed");
      return;
    }

    onFileSelect(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={handleChange}
      />

      <Button
        type="button"
        variant="link"
        onClick={handleClick}
        // className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Import from document
      </Button>
    </>
  );
}
