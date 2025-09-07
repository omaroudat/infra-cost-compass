import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, CheckCircle, Clock, AlertCircle, FileText, Target, DollarSign } from 'lucide-react';

interface KPISectionProps {
  metrics: {
    totalBOQValue: number;
    totalApprovedValue: number;
    totalConditionalValue: number;
    completionPercentage: number;
    approvedCount: number;
    conditionalCount: number;
    rejectedCount: number;
    totalWIRs: number;
  };
}

const KPISection: React.FC<KPISectionProps> = ({ metrics }) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const approvalRate = metrics.totalWIRs > 0 ? (metrics.approvedCount / metrics.totalWIRs) * 100 : 0;
  const rejectionRate = metrics.totalWIRs > 0 ? (metrics.rejectedCount / metrics.totalWIRs) * 100 : 0;
  const totalValue = metrics.totalApprovedValue + metrics.totalConditionalValue;

  const kpis = [
    {
      title: 'Project Value',
      value: formatter.format(totalValue),
      subtitle: 'Total Approved + Conditional',
      icon: DollarSign,
      trend: {
        direction: 'up' as const,
        value: `${((totalValue / metrics.totalBOQValue) * 100).toFixed(1)}%`,
      },
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50',
      borderColor: 'border-emerald-200',
    },
    {
      title: 'Project Completion',
      value: `${metrics.completionPercentage.toFixed(1)}%`,
      subtitle: 'Based on approved work value',
      icon: Target,
      trend: {
        direction: metrics.completionPercentage >= 50 ? 'up' as const : 'down' as const,
        value: `${metrics.approvedCount} approved`,
      },
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Approval Rate',
      value: `${approvalRate.toFixed(1)}%`,
      subtitle: 'WIR approval efficiency',
      icon: CheckCircle,
      trend: {
        direction: approvalRate >= 70 ? 'up' as const : 'down' as const,
        value: `${metrics.approvedCount}/${metrics.totalWIRs}`,
      },
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50',
      borderColor: 'border-violet-200',
    },
    {
      title: 'Pending Review',
      value: metrics.conditionalCount.toString(),
      subtitle: 'Conditional WIRs',
      icon: Clock,
      trend: {
        direction: metrics.conditionalCount < 5 ? 'up' as const : 'down' as const,
        value: `${((metrics.conditionalCount / metrics.totalWIRs) * 100).toFixed(1)}%`,
      },
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
    },
    {
      title: 'Risk Items',
      value: metrics.rejectedCount.toString(),
      subtitle: 'Rejected WIRs requiring attention',
      icon: AlertCircle,
      trend: {
        direction: metrics.rejectedCount < 3 ? 'up' as const : 'down' as const,
        value: `${rejectionRate.toFixed(1)}% rejected`,
      },
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-50 to-rose-50',
      borderColor: 'border-red-200',
    },
    {
      title: 'Total WIRs',
      value: metrics.totalWIRs.toString(),
      subtitle: 'Work inspection requests',
      icon: FileText,
      trend: {
        direction: 'up' as const,
        value: 'All statuses',
      },
      gradient: 'from-slate-500 to-gray-600',
      bgGradient: 'from-slate-50 to-gray-50',
      borderColor: 'border-slate-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.trend.direction === 'up' ? TrendingUp : TrendingDown;
        
        return (
          <Card
            key={index}
            className={`bg-gradient-to-br ${kpi.bgGradient} ${kpi.borderColor} shadow-elegant hover:shadow-premium transition-all duration-300 animate-fade-in border-2 group hover:scale-105`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${kpi.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    kpi.trend.direction === 'up' ? 'text-success' : 'text-destructive'
                  }`}>
                    <TrendIcon className="w-3 h-3" />
                    <span>{kpi.trend.value}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {kpi.title}
                  </h3>
                  <p className="text-2xl font-bold text-foreground leading-none">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {kpi.subtitle}
                  </p>
                </div>

                {/* Progress indicator for completion percentage */}
                {kpi.title === 'Project Completion' && (
                  <div className="w-full bg-background/50 rounded-full h-2 mt-3">
                    <div 
                      className={`bg-gradient-to-r ${kpi.gradient} h-2 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.min(metrics.completionPercentage, 100)}%` }}
                    ></div>
                  </div>
                )}

                {/* Approval rate indicator */}
                {kpi.title === 'Approval Rate' && (
                  <div className="w-full bg-background/50 rounded-full h-2 mt-3">
                    <div 
                      className={`bg-gradient-to-r ${kpi.gradient} h-2 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.min(approvalRate, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default KPISection;