import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { formatCurrency } from "@/frontend/lib/utils";

interface PriceBreakdownProps {
    breakdown: {
        artisan: number;
        platform: number;
        materials: number;
    };
    currency: string;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b"]; // Emerald (Artisan), Blue (Platform), Amber (Materials)

export function PriceBreakdown({ breakdown, currency }: PriceBreakdownProps) {
    const data = [
        { name: "Artisan Share", value: breakdown.artisan, color: COLORS[0] },
        { name: "Platform Fee", value: breakdown.platform, color: COLORS[1] },
        { name: "Material Cost", value: breakdown.materials, color: COLORS[2] },
    ];

    const total = breakdown.artisan + breakdown.platform + breakdown.materials;

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-serif">Transparency Breakdown</CardTitle>
                <p className="text-sm text-muted-foreground">See exactly where your money goes.</p>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="h-[200px] w-[200px] shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: any) => [`${currency} ${value}`, "Amount"]}
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        {data.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm font-medium">{item.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm font-semibold">
                                        {currency} {item.value}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {((item.value / total) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div className="pt-4 border-t border-border mt-2">
                            <div className="flex justify-between items-center font-medium">
                                <span>Total Price</span>
                                <span>{currency} {total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
