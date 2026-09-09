interface Props {
    title: string;
    description?: string;
}

export default function ValidationProgress({
    title,
    description,
}: Props) {
    return (
        <div className="rounded-xl border border-gray-300 bg-gray-50 p-6">
            <div className="flex items-center gap-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />

                <div>
                    <p className="font-semibold text-gray-800">
                        {title}
                    </p>

                    {description && (
                        <p className="mt-1 text-sm text-gray-600">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
