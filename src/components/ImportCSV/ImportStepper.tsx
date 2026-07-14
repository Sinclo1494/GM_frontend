import {
    CheckCircle2,
    Circle,
} from "lucide-react";

interface Props {
    step: number;
}

const STEPS = [
    "Fichier",
    "Correspondance",
    "Validation",
    "Import",
];

export default function ImportStepper({
    step,
}: Props) {
    return (
        <div className="flex justify-between border-b bg-slate-50 px-8 py-5">
            {STEPS.map((label, index) => {
                const stepNumber = index + 1;
                const active = step === stepNumber;
                const completed = step > stepNumber;

                return (
                    <div
                        key={label}
                        className="flex items-center gap-3"
                    >
                        {active || completed ? (
                            <CheckCircle2
                                className={
                                    completed
                                        ? "text-green-600"
                                        : "text-blue-600"
                                }
                                size={22}
                            />
                        ) : (
                            <Circle
                                className="text-gray-300"
                                size={22}
                            />
                        )}

                        <span
                            className={`font-medium ${
                                active
                                    ? "text-blue-700"
                                    : "text-gray-500"
                            }`}
                        >
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}