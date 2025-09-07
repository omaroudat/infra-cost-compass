import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { WIR, BOQItem } from '../../types';

interface FinancialOverviewProps {
  wirs: WIR[];
  boqItems: BOQItem[];
  totalBOQValue: number;
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ wirs, boqItems, totalBOQValue }) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const financialData = useMemo(() => {
    const approvedAmount = wirs
      .filter(w => w.result === 'A')
      .reduce((sum, w) => sum + (w.calculatedAmount || w.value || 0), 0);
    
    const conditionalAmount = wirs
      .filter(w => w.result === 'B')
      .reduce((sum, w) => sum + (w.calculatedAmount || w.value || 0), 0);

    const actualSpending = approvedAmount + conditionalAmount;
    const variance = totalBOQValue - actualSpending;
    const variancePercentage = totalBOQValue > 0 ? (variance / totalBOQValue) * 100 : 0;

    return {
      budget: totalBOQValue,
      actualSpending,
      approvedAmount,
      conditionalAmount,
      variance,
      variancePercentage,
      utilizationRate: totalBOQValue > 0 ? (actualSpending / totalBOQValue) * 100 : 0
    };
  }, [wirs, totalBOQValue]);

  const budgetBreakdown = [
    { name: 'Approved', value: financialData.approvedAmount, color: 'hsl(var(--success))' },
    { name: 'Conditional', value: financialData.conditionalAmount, color: 'hsl(var(--warning))' },
    { name: 'Remaining', value: Math.max(0, financialData.variance), color: 'hsl(var(--muted))' }
  ];

  const categoryBreakdown = useMemo(() => {
    // Get top 6 BOQ items by allocated budget
    const topBOQItems = boqItems
      .filter(item => !item.children || item.children.length === 0) // Only leaf items
      .map(item => {
        const itemWirs = wirs.filter(w => w.boqItemId === item.id);
        const spentAmount = itemWirs.reduce((sum, w) => {
          if (w.result === 'A' || w.result === 'B') {
            return sum + (w.calculatedAmount || w.value || 0);
          }
          return sum;
        }, 0);
        
        const budgetAmount = item.quantity * item.unitRate;

        return {
          name: item.description.length > 25 ? item.description.substring(0, 25) + '...' : item.description,
          budget: budgetAmount,
          actual: spentAmount,
          utilization: budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0,
          code: item.code
        };
      })
      .sort((a, b) => b.budget - a.budget)
      .slice(0, 6);

    return topBOQItems;
  }, [boqItems, wirs]);

  // Cash flow trend (monthly)
  const cashFlowData = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    
    wirs.forEach(wir => {
      if ((wir.result === 'A' || wir.result === 'B') && wir.receivedDate) {
        const month = new Date(wir.receivedDate).toISOString().substring(0, 7);
        const amount = wir.calculatedAmount || wir.value || 0;
        monthlyData[month] = (monthlyData[month] || 0) + amount;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        amount: amount / 1000000 // Convert to millions for readability
      }));
  }, [wirs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Budget vs Actual */}
      <Card className="bg-card shadow-elegant border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-foreground">
            <DollarSign className="w-5 h-5 text-success" />
            Budget vs Actual Spending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatter.format(financialData.budget)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Actual Spending</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatter.format(financialData.actualSpending)}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Budget Utilization</span>
                <span className="text-sm font-semibold text-foreground">
                  {financialData.utilizationRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-success to-warning h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(financialData.utilizationRate, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              financialData.variancePercentage >= 0 
                ? 'bg-success/10 text-success' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              {financialData.variancePercentage >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {financialData.variancePercentage >= 0 ? 'Under Budget' : 'Over Budget'} by {' '}
                {formatter.format(Math.abs(financialData.variance))} ({Math.abs(financialData.variancePercentage).toFixed(1)}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Breakdown Pie Chart */}
      <Card className="bg-card shadow-elegant border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-foreground">Budget Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {budgetBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatter.format(value), 'Amount']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {budgetBreakdown.map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatter.format(item.value)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="bg-card shadow-elegant border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-foreground">Cost by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end" 
                  height={60}
                  fontSize={12}
                  stroke="hsl(var(--foreground))"
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  fontSize={12}
                  stroke="hsl(var(--foreground))"
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatter.format(value), 
                    name === 'budget' ? 'Budget' : 'Actual'
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="budget" fill="hsl(var(--muted))" name="budget" radius={[2, 2, 0, 0]} />
                <Bar dataKey="actual" fill="hsl(var(--primary))" name="actual" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Trend */}
      <Card className="bg-card shadow-elegant border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-foreground">Cash Flow Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  stroke="hsl(var(--foreground))"
                />
                <YAxis 
                  tickFormatter={(value) => `${value.toFixed(1)}M`}
                  fontSize={12}
                  stroke="hsl(var(--foreground))"
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(2)}M SAR`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverview;