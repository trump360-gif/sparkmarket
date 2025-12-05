'use client';

import { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Line,
    ComposedChart,
    PieChart,
    Pie,
    Cell,
    Sector
} from 'recharts';
import { TrendingUp, Users, CreditCard } from 'lucide-react';

interface SalesData {
    date: string;
    sales: number;
    count: number;
}

interface UserData {
    date: string;
    count: number;
}

interface CategoryData {
    name: string;
    value: number;
}

interface StatusData {
    name: string;
    value: number;
}

interface FirebaseAnalyticsChartsProps {
    salesData: SalesData[];
    userData: UserData[];
    categoryStats: CategoryData[];
    statusStats: StatusData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const STATUS_COLORS: Record<string, string> = {
    'FOR_SALE': '#10b981', // emerald-500
    'SOLD': '#8b5cf6', // violet-500
    'SUSPENDED': '#ef4444', // red-500
    'PENDING_REVIEW': '#f59e0b', // amber-500
    'DELETED': '#94a3b8', // slate-400
};

const STATUS_LABELS: Record<string, string> = {
    'FOR_SALE': '판매중',
    'SOLD': '판매완료',
    'SUSPENDED': '숨김/정지',
    'PENDING_REVIEW': '승인대기',
    'DELETED': '삭제됨',
};

const CATEGORY_LABELS: Record<string, string> = {
    'ELECTRONICS': '전자제품',
    'FASHION': '패션/의류',
    'HOME': '가구/인테리어',
    'BOOKS': '도서/문구',
    'SPORTS': '스포츠/레저',
    'OTHER': '기타',
    'BEAUTY': '뷰티/화장품',
    'TOYS': '장난감/취미',
};

export default function FirebaseAnalyticsCharts({ salesData, userData, categoryStats, statusStats }: FirebaseAnalyticsChartsProps) {
    const [activeTab, setActiveTab] = useState<'traffic' | 'transactions'>('transactions');
    const [categoryActiveIndex, setCategoryActiveIndex] = useState(0);
    const [statusActiveIndex, setStatusActiveIndex] = useState(0);

    const onCategoryPieEnter = (_: any, index: number) => {
        setCategoryActiveIndex(index);
    };

    const onStatusPieEnter = (_: any, index: number) => {
        setStatusActiveIndex(index);
    };

    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill={fill}
                />
                {/* White background circle to ensure text visibility and contrast */}
                <circle cx={cx} cy={cy} r={Math.min(innerRadius || 40, 40) - 2} fill="white" />

                <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#333" className="font-bold text-sm">
                    {payload.name === 'ELECTRONICS' ? '전자제품' :
                        payload.name === 'FASHION' ? '패션/의류' :
                            payload.name === 'HOME' ? '가구/인테리어' :
                                payload.name === 'BOOKS' ? '도서/문구' :
                                    payload.name === 'SPORTS' ? '스포츠/레저' :
                                        payload.name === 'OTHER' ? '기타' :
                                            payload.name === 'BEAUTY' ? '뷰티/화장품' :
                                                payload.name === 'TOYS' ? '장난감/취미' :
                                                    payload.name === 'FOR_SALE' ? '판매중' :
                                                        payload.name === 'SOLD' ? '판매완료' :
                                                            payload.name === 'SUSPENDED' ? '숨김/정지' :
                                                                payload.name === 'PENDING_REVIEW' ? '승인대기' :
                                                                    payload.name === 'DELETED' ? '삭제됨' : payload.name}
                </text>
                <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#999" className="text-xs">
                    {`${value}개 (${(percent * 100).toFixed(0)}%)`}
                </text>
            </g>
        );
    };

    // Format user data for chart (parsing date)
    const userTrafficData = userData.map(item => {
        const d = new Date(item.date);
        return {
            date: `${d.getMonth() + 1}/${d.getDate()}`,
            activeUsers: 0,
            newUsers: item.count,
        };
    });

    // Format sales data for chart
    const transactionData = salesData.map(item => {
        const d = new Date(item.date);
        return {
            date: `${d.getMonth() + 1}/${d.getDate()}`,
            amount: item.sales,
            count: item.count
        };
    });

    // If no sales data, use mock to show the chart UI
    if (transactionData.length === 0) {
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            transactionData.push({
                date: `${d.getMonth() + 1}/${d.getDate()}`,
                amount: Math.floor(Math.random() * 500000),
                count: Math.floor(Math.random() * 10)
            });
        }
    }

    return (
        <div className="space-y-6">
            <style jsx global>{`
                *:focus {
                    outline: none !important;
                }
                .recharts-sector:focus,
                .recharts-pie-sector:focus,
                path:focus,
                g:focus {
                    outline: none !important;
                    box-shadow: none !important;
                }
            `}</style>

            {/* Main Trends Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                            <h2 className="text-lg font-bold text-slate-900">통계 대시보드</h2>
                        </div>
                        <p className="text-slate-500 text-sm">실시간 데이터 분석</p>
                    </div>

                    <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'transactions'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                <span>거래량 추이</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('traffic')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'traffic'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>유저 접속</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="p-6">
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {activeTab === 'transactions' ? (
                                <ComposedChart data={transactionData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickFormatter={(value: number) => `${(value / 10000).toFixed(0)}만`}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number, name: string) => [
                                            name === 'amount' || name === '거래금액' ? `${value.toLocaleString()}원` : `${value}건`,
                                            name === 'amount' || name === '거래금액' ? '거래금액' : '거래수'
                                        ]}
                                    />
                                    <Legend iconType="circle" />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="amount"
                                        name="거래금액"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="count"
                                        name="거래수"
                                        stroke="#f97316"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }}
                                    />
                                </ComposedChart>
                            ) : (
                                <AreaChart data={userTrafficData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <defs>
                                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                        interval={4}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Area
                                        type="monotone"
                                        dataKey="newUsers"
                                        name="신규 가입"
                                        stroke="#ec4899"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorNew)"
                                    />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Secondary Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution (Pie) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        카테고리별 상품 분포
                    </h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={categoryActiveIndex}
                                    activeShape={renderActiveShape}
                                    onMouseEnter={onCategoryPieEnter}
                                    data={categoryStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}  // Reduced to 40 for donut effect
                                    outerRadius={80}  // Reduced to 80
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${CATEGORY_LABELS[name] || name} ${(percent * 100).toFixed(0)}%`}
                                    style={{ outline: 'none' }}
                                >
                                    {categoryStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ outline: 'none' }} />
                                    ))}
                                </Pie>
                                {/* Tooltip removed to avoid overlay conflict with active shape text */}
                                <Legend
                                    wrapperStyle={{ fontSize: '11px' }} // Added font size
                                    formatter={(value) => CATEGORY_LABELS[value] || value}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Product Status (Donut) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                        상품 상태 현황
                    </h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={statusActiveIndex}
                                    activeShape={renderActiveShape}
                                    onMouseEnter={onStatusPieEnter}
                                    data={statusStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}  // Reduced to 40
                                    outerRadius={80}  // Reduced to 80
                                    fill="#8884d8"
                                    dataKey="value"
                                    paddingAngle={5}
                                    nameKey="name"
                                    style={{ outline: 'none' }}
                                >
                                    {statusStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#cbd5e1'} style={{ outline: 'none' }} />
                                    ))}
                                </Pie>
                                {/* Tooltip removed to avoid overlay conflict with active shape text */}
                                <Legend
                                    wrapperStyle={{ fontSize: '11px' }} // Added font size
                                    formatter={(value) => STATUS_LABELS[value] || value}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
