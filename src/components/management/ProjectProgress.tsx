import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Target, Calendar, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { WIR, BOQItem } from '../../types';

interface RiskItem {
  type: string;
  level: string;
  description: string;
  riskPercentage?: number;
  items: Array<{
    name: string;
    percentage: number;
    value?: number;
  }>;
}

interface ProjectProgressProps {
  wirs: WIR[];
  boqItems: BOQItem[];
  completionPercentage: number;
}

const ProjectProgress: React.FC<ProjectProgressProps> = ({ wirs, boqItems, completionPercentage }) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Progress by BOQ category - only leaf items
  const boqProgress = useMemo(() => {
    const leafItems = boqItems.filter(item => !item.children || item.children.length === 0);
    
    return leafItems.map(item => {
      const itemWirs = wirs.filter(w => w.boqItemId === item.id);
      const approvedWirs = itemWirs.filter(w => w.result === 'A');
      const conditionalWirs = itemWirs.filter(w => w.result === 'B');
      
      const budgetAmount = item.quantity * item.unitRate;
      const completedAmount = approvedWirs.reduce((sum, w) => sum + (w.calculatedAmount || w.value || 0), 0);
      const pendingAmount = conditionalWirs.reduce((sum, w) => sum + (w.calculatedAmount || w.value || 0), 0);
      
      const progressPercentage = budgetAmount > 0 ? ((completedAmount + pendingAmount) / budgetAmount) * 100 : 0;

      return {
        name: item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description,
        code: item.code,
        budget: budgetAmount,
        completed: completedAmount,
        pending: pendingAmount,
        progress: Math.min(progressPercentage, 100),
        totalWirs: itemWirs.length,
        status: progressPercentage >= 90 ? 'completed' : progressPercentage >= 50 ? 'in-progress' : 'pending'
      };
    }).filter(item => item.budget > 0).sort((a, b) => b.progress - a.progress);
  }, [boqItems, wirs]);

  // Timeline progress (monthly)
  const timelineProgress = useMemo(() => {
    const monthlyData: { [key: string]: { completed: number, pending: number, total: number } } = {};
    
    wirs.forEach(wir => {
      if (wir.receivedDate) {
        const month = new Date(wir.receivedDate).toISOString().substring(0, 7);
        if (!monthlyData[month]) {
          monthlyData[month] = { completed: 0, pending: 0, total: 0 };
        }
        
        const amount = wir.calculatedAmount || wir.value || 0;
        if (wir.result === 'A') {
          monthlyData[month].completed += amount;
        } else if (wir.result === 'B') {
          monthlyData[month].pending += amount;
        }
        monthlyData[month].total += amount;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        completed: data.completed / 1000000, // Convert to millions
        pending: data.pending / 1000000,
        total: data.total / 1000000
      }));
  }, [wirs]);

  // Risk assessment
  const riskItems = useMemo(() => {
    const risks: RiskItem[] = [];
    
    // Low completion items
    const lowProgressItems = boqProgress.filter(item => item.progress < 30 && item.budget > 1000000);
    const lowProgressRate = boqProgress.length > 0 ? (lowProgressItems.length / boqProgress.length) * 100 : 0;
    if (lowProgressItems.length > 0) {
      risks.push({
        type: 'Low Progress',
        level: 'medium',
        description: `${lowProgressItems.length} high-value items with less than 30% completion`,
        riskPercentage: lowProgressRate,
        items: lowProgressItems
          .map(item => ({
            name: item.name,
            percentage: 100 - item.progress, // Risk percentage (inverse of completion)
            value: item.budget
          }))
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 5)
      });
    }

    // High rejection rate
    const rejectedWirs = wirs.filter(w => w.result === 'C');
    const rejectionRate = wirs.length > 0 ? (rejectedWirs.length / wirs.length) * 100 : 0;
    if (rejectedWirs.length > wirs.length * 0.1) {
      // Group rejected WIRs by BOQ item to calculate impact
      const rejectedByBOQ = rejectedWirs.reduce((acc, wir) => {
        const key = wir.boqItemId;
        if (!acc[key]) {
          acc[key] = {
            description: wir.description,
            count: 0,
            totalValue: 0,
            boqItemId: key
          };
        }
        acc[key].count += 1;
        acc[key].totalValue += (wir.calculatedAmount || wir.value || 0);
        return acc;
      }, {} as Record<string, any>);

      const totalRejectedValue = Object.values(rejectedByBOQ).reduce((sum: number, item: any) => sum + item.totalValue, 0);
      
      risks.push({
        type: 'Quality Issues',
        level: 'high',
        description: `${rejectedWirs.length} rejected WIRs (${rejectionRate.toFixed(1)}% risk rate)`,
        riskPercentage: rejectionRate,
        items: Object.values(rejectedByBOQ)
          .map((item: any) => ({
            name: item.description,
            percentage: totalRejectedValue > 0 ? ((item.totalValue / totalRejectedValue) * 100) : 0,
            value: item.totalValue
          }))
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 5)
      });
    }

    // Pending conditionals
    const conditionalWirs = wirs.filter(w => w.result === 'B');
    const conditionalRate = wirs.length > 0 ? (conditionalWirs.length / wirs.length) * 100 : 0;
    if (conditionalWirs.length > 10) {
      // Group conditional WIRs by BOQ item to calculate impact
      const conditionalByBOQ = conditionalWirs.reduce((acc, wir) => {
        const key = wir.boqItemId;
        if (!acc[key]) {
          acc[key] = {
            description: wir.description,
            count: 0,
            totalValue: 0,
            boqItemId: key
          };
        }
        acc[key].count += 1;
        acc[key].totalValue += (wir.calculatedAmount || wir.value || 0);
        return acc;
      }, {} as Record<string, any>);

      const totalConditionalValue = Object.values(conditionalByBOQ).reduce((sum: number, item: any) => sum + item.totalValue, 0);
      
      risks.push({
        type: 'Pending Reviews',
        level: 'medium',
        description: `${conditionalWirs.length} WIRs awaiting final approval`,
        riskPercentage: conditionalRate,
        items: Object.values(conditionalByBOQ)
          .map((item: any) => ({
            name: item.description,
            percentage: totalConditionalValue > 0 ? ((item.totalValue / totalConditionalValue) * 100) : 0,
            value: item.totalValue
          }))
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 5)
      });
    }

    return risks;
  }, [boqProgress, wirs]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-primary text-primary-foreground">In Progress</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">Pending</Badge>;
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress Header */}
      <Card className="bg-card shadow-elegant border-border/50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Overall Progress</h3>
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">
                {completionPercentage.toFixed(1)}%
              </div>
              <Progress value={completionPercentage} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">Project completion based on approved work value</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <h3 className="text-lg font-semibold text-foreground">Active Items</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="text-sm font-semibold text-success">
                    {boqProgress.filter(item => item.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="text-sm font-semibold text-primary">
                    {boqProgress.filter(item => item.status === 'in-progress').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {boqProgress.filter(item => item.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Trend Analysis</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Monthly average: {(timelineProgress.reduce((sum, t) => sum + t.total, 0) / Math.max(timelineProgress.length, 1)).toFixed(1)}M SAR</p>
                <p>Completion rate: {((wirs.filter(w => w.result === 'A').length / Math.max(wirs.length, 1)) * 100).toFixed(1)}%</p>
                <p>Risk items: {riskItems.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-lg">
          <TabsTrigger value="progress" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
            BOQ Progress
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="risks" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Issues Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6">
          <Card className="bg-card shadow-elegant border-border/50">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">BOQ Item Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {boqProgress.map((item, index) => (
                  <div key={item.code} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">Code: {item.code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        <span className="text-sm font-semibold text-foreground">
                          {item.progress.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <Progress value={item.progress} className="h-2 mb-3" />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-semibold text-foreground">
                          {formatter.format(item.budget)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-semibold text-success">
                          {formatter.format(item.completed)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pending</p>
                        <p className="font-semibold text-warning">
                          {formatter.format(item.pending)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total WIRs</p>
                        <p className="font-semibold text-foreground">{item.totalWirs}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card className="bg-card shadow-elegant border-border/50">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Progress Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      fontSize={12}
                      stroke="hsl(var(--foreground))"
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value}M`}
                      fontSize={12}
                      stroke="hsl(var(--foreground))"
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value.toFixed(2)}M SAR`, name === 'completed' ? 'Completed' : 'Pending']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stackId="1"
                      stroke="hsl(var(--success))"
                      fill="hsl(var(--success))"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stackId="1"
                      stroke="hsl(var(--warning))"
                      fill="hsl(var(--warning))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card shadow-elegant border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  WIR System Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskItems.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-foreground">No Major Risks</h3>
                      <p className="text-muted-foreground">Project is progressing well with no significant risks identified.</p>
                    </div>
                  ) : (
                    riskItems.map((risk, index) => (
                      <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          {getRiskIcon(risk.level)}
                          <h3 className="font-semibold text-foreground">{risk.type}</h3>
                          <Badge variant={risk.level === 'high' ? 'destructive' : 'secondary'}>
                            {risk.level.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">{risk.description}</p>
                          {risk.riskPercentage && (
                            <Badge variant="outline" className="text-xs">
                              {risk.riskPercentage.toFixed(1)}% Risk
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Affected Items:</p>
                          <div className="pl-3 space-y-2">
                            {risk.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <div className="flex items-start flex-1">
                                  <span className="mr-2 text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  <span className="text-xs font-medium text-foreground">
                                    {item.percentage.toFixed(1)}%
                                  </span>
                                  {item.value && (
                                    <span className="text-xs text-muted-foreground">
                                      ({formatter.format(item.value)})
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-elegant border-border/50">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">WIR Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      name: 'Approved WIRs', 
                      value: wirs.filter(w => w.result === 'A').length,
                      total: wirs.length,
                      color: 'success'
                    },
                    { 
                      name: 'Conditional WIRs', 
                      value: wirs.filter(w => w.result === 'B').length,
                      total: wirs.length,
                      color: 'warning'
                    },
                    { 
                      name: 'Rejected WIRs', 
                      value: wirs.filter(w => w.result === 'C').length,
                      total: wirs.length,
                      color: 'destructive'
                    },
                    { 
                      name: 'Pending Review', 
                      value: wirs.filter(w => !w.result).length,
                      total: wirs.length,
                      color: 'muted'
                    }
                  ].map((item, index) => {
                    const percentage = item.total > 0 ? (item.value / item.total) * 100 : 0;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {item.value} / {item.total}
                            </span>
                            <span className="text-sm font-semibold text-foreground">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectProgress;