interface Props {
  progress: number;
}

export default function ValidationProgress({
  progress,
}: Props) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="font-medium mb-3">
        Vérification en cours...
      </p>

      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-gray-500 mt-2">
        {progress} %
      </p>
    </div>
  );
}