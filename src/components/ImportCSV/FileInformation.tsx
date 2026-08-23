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
    <div className="rounded-lg border dark:border-green-800 bg-green-50 p-4 flex items-center gap-4">
      <FileText
        size={36}
        className="text-green-600"
      />

      <div>
        <p className="font-semibold dark:text-dark-text-primary">
          {file.name}
        </p>

        <p className="text-sm dark:text-dark-text-secondary">
          Taille : {size}
        </p>
      </div>
    </div>
  );
}
