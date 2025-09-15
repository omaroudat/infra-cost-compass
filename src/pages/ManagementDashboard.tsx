import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import FinancialOverview from '../components/management/FinancialOverview';
import KPISection from '../components/management/KPISection';
import ProjectProgress from '../components/management/ProjectProgress';
import PerformanceMetrics from '../components/management/PerformanceMetrics';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Briefcase, Calendar } from 'lucide-react';

const ManagementDashboard = () => {
  const { wirs, boqItems, contractors, engineers, loading } = useAppContext();
  const { t } = useLanguage();

  // Calculate key metrics
  const metrics = useMemo(() => {
    // Calculate total BOQ value from leaf items only (to avoid double counting)
    const totalBOQValue = boqItems.reduce((sum, item) => {
      if (item.children && item.children.length > 0) {
        // For parent items, sum children
        return sum + item.children.reduce((childSum, child) => 
          childSum + (child.quantity * child.unitRate), 0);
      } else {
        // For leaf items without children
        return sum + (item.quantity * item.unitRate);
      }
    }, 0);

    const approvedWirs = wirs.filter(w => w.result === 'A');
    const conditionalWirs = wirs.filter(w => w.result === 'B');
    const rejectedWirs = wirs.filter(w => w.result === 'C');

    const totalApprovedValue = approvedWirs.reduce((sum, w) => 
      sum + (w.calculatedAmount || w.value || 0), 0);
    const totalConditionalValue = conditionalWirs.reduce((sum, w) => 
      sum + (w.calculatedAmount || w.value || 0), 0);

    const completionPercentage = totalBOQValue > 0 
      ? ((totalApprovedValue + totalConditionalValue) / totalBOQValue) * 100 
      : 0;

    return {
      totalBOQValue,
      totalApprovedValue,
      totalConditionalValue,
      completionPercentage,
      approvedCount: approvedWirs.length,
      conditionalCount: conditionalWirs.length,
      rejectedCount: rejectedWirs.length,
      totalWIRs: wirs.length
    };
  }, [wirs, boqItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-backdrop p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-card rounded-xl p-8 shadow-elegant animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-xl p-6 shadow-elegant animate-pulse">
                <div className="h-32 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-backdrop p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Executive Header */}
        <Card className="bg-card shadow-luxury border-border/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground">
                  Management Dashboard
                </h1>
                <p className="text-muted-foreground text-lg">
                  Executive overview of project financial performance and key metrics
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="w-4 h-4 text-success" />
                  <span>Live Data</span>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Updated: {new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  <span>Khuzam Project</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs Section */}
        <KPISection metrics={metrics} />

        {/* Financial Overview */}
        <FinancialOverview 
          wirs={wirs} 
          boqItems={boqItems} 
          totalBOQValue={metrics.totalBOQValue}
        />

        {/* Performance Metrics */}
        <PerformanceMetrics 
          contractors={contractors}
          engineers={engineers}
          wirs={wirs}
        />

        {/* Project Progress */}
        <ProjectProgress 
          wirs={wirs}
          boqItems={boqItems}
          completionPercentage={metrics.completionPercentage}
        />
      </div>
    </div>
  );
};

export default ManagementDashboard;