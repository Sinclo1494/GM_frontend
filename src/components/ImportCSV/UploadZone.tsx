import { Upload } from "lucide-react";
import { useRef } from "react";

interface Props {
  onFileSelected: (file: File | null) => void;
}

export default function UploadZone({ onFileSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Veuillez sélectionner un fichier CSV.");
      return;
    }

    onFileSelected(file);
  };

  return (
    <>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0]);
        }}
        className="border-2 border-dashed rounded-xl cursor-pointer transition hover:border-blue-500 hover:bg-blue-50 p-12 text-center"
      >
        <Upload
          size={48}
          className="mx-auto text-blue-600 mb-4"
        />

        <p className="font-semibold text-lg">
          Déposez votre fichier CSV ici
        </p>

        <p className="text-gray-500 mt-2">
          ou cliquez pour sélectionner un fichier
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </>
  );
}