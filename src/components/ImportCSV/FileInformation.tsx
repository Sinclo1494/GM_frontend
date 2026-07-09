import { FileText } from "lucide-react";

interface Props {
  file: File;
}

export default function FileInformation({ file }: Props) {
  const size =
    file.size > 1024 * 1024
      ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(2)} KB`;

  return (
    <div className="rounded-lg border bg-green-50 border-green-200 p-4 flex items-center gap-4">
      <FileText
        size={36}
        className="text-green-600"
      />

      <div>
        <p className="font-semibold text-gray-800">
          {file.name}
        </p>

        <p className="text-sm text-gray-600">
          Taille : {size}
        </p>
      </div>
    </div>
  );
}