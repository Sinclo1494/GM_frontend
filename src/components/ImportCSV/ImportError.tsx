interface Props {
    message: string;
}

export default function ImportError({
    message,
}: Props) {
    return (
        <div className="rounded-xl border border-red-300 bg-red-50 p-5">
            <h2 className="mb-3 text-lg font-semibold text-red-700">
                Échec de l'import
            </h2>

            <p className="text-red-700">
                {message}
            </p>
        </div>
    );
}
