"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export function DashboardRevenueChart({ data, currencySymbol = "₦" }: { data: { name: string, total: number }[], currencySymbol?: string }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis 
          dataKey="name" 
          stroke="#94A3B8" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          dy={10}
        />
        <YAxis 
          stroke="#94A3B8" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          width={80}
          tickFormatter={(value) => {
            if (value >= 1000000) return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${currencySymbol}${(value / 1000).toFixed(0)}k`;
            return `${currencySymbol}${value}`;
          }} 
          dx={-10}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            padding: '12px'
          }}
          itemStyle={{ color: '#F97316', fontWeight: 600 }}
          formatter={(value: any) => [`${currencySymbol}${Number(value).toLocaleString()}`, 'Revenue']}
          labelStyle={{ color: '#64748B', marginBottom: '4px', fontWeight: 500 }}
          cursor={{ stroke: '#F97316', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        <Line 
          type="monotone" 
          dataKey="total" 
          stroke="#F97316" 
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#F97316" }}
          activeDot={{ r: 6, fill: "#F97316", stroke: "#fff", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
