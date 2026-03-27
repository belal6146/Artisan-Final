import { Badge } from "@/components/ui/badge";
import { Leaf, Recycle, HeartHandshake, Sparkles } from "lucide-react";

interface EcoTagProps {
    tag: string;
}

const ECO_ICONS: Record<string, React.ReactNode> = {
    "Biodegradable": <Leaf className="w-3 h-3 mr-1" />,
    "Upcycled": <Recycle className="w-3 h-3 mr-1" />,
    "Handmade": <HeartHandshake className="w-3 h-3 mr-1" />,
    "Organic": <Leaf className="w-3 h-3 mr-1" />,
    "Sustainable": <Recycle className="w-3 h-3 mr-1" />,
    "default": <Sparkles className="w-3 h-3 mr-1" />,
};

export function EcoTag({ tag }: EcoTagProps) {
    const icon = ECO_ICONS[tag] || ECO_ICONS["default"];

    return (
        <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal border-green-200 bg-green-50 text-green-800 hover:bg-green-100 transition-colors cursor-default">
            {icon}
            {tag}
        </Badge>
    );
}
