"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export function DashboardRevenueChart({ data, currencySymbol = "₦" }: { data: { name: string, total: number }[], currencySymbol?: string }) {
  return (
    <ResponsiveContainer width="99%" height={350}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis 
          dataKey="name" 
          stroke="#94A3B8" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false} 
          dy={10}
          padding={{ left: 15, right: 15 }}
        />
        <YAxis 
          stroke="#94A3B8" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          width={50}
          tickFormatter={(value) => {
            if (value >= 1000000) return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${currencySymbol}${(value / 1000).toFixed(0)}k`;
            return `${currencySymbol}${value}`;
          }} 
          dx={-5}
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

import { PieChart, Pie, Cell, Legend } from "recharts"

export function DashboardStatusChart({ data }: { data: { name: string, value: number, color: string }[] }) {
  if (data.every(d => d.value === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
        <p>No invoice data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="80%"
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            padding: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)'
          }}
          itemStyle={{ fontWeight: 600, color: '#0F172A' }}
          labelStyle={{ display: 'none' }}
          formatter={(value: any, name: any) => [value, name]}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
          formatter={(value, entry: any) => <span style={{ color: '#64748B', fontWeight: 500, marginRight: '10px' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
