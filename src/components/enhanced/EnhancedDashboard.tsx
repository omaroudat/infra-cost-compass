import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/ManualAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { StatsCard, EnhancedCard } from '@/components/ui/enhanced-card';
import { StatsSkeleton } from '@/components/ui/skeleton-loader';
import { EnhancedStatusBadge } from '@/components/ui/enhanced-status-badge';
import { ResponsiveGrid, ResponsiveContainer } from '@/components/ui/mobile-responsive';
import { 
  FileCheck, 
  Users, 
  TrendingUp, 
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

export const EnhancedDashboard: React.FC = () => {
  const { wirs, boqItems, loading } = useAppContext();
  const { profile } = useAuth();
  const { t } = useLanguage();

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalWIRs = wirs.length;
    const completedWIRs = wirs.filter(wir => wir.status === 'completed').length;
    const submittedWIRs = wirs.filter(wir => wir.status === 'submitted').length;
    const approvedWIRs = wirs.filter(wir => wir.result === 'A').length;
    const conditionalWIRs = wirs.filter(wir => wir.result === 'B').length;
    const rejectedWIRs = wirs.filter(wir => wir.result === 'C').length;
    
    const completionRate = totalWIRs > 0 ? (completedWIRs / totalWIRs) * 100 : 0;
    const totalBOQItems = boqItems.length;

    return {
      totalWIRs,
      completedWIRs,
      submittedWIRs,
      approvedWIRs,
      conditionalWIRs,
      rejectedWIRs,
      completionRate,
      totalBOQItems
    };
  }, [wirs, boqItems]);

  // Recent activity
  const recentWIRs = React.useMemo(() => {
    return [...wirs]
      .sort((a, b) => new Date(b.submittalDate || '').getTime() - new Date(a.submittalDate || '').getTime())
      .slice(0, 5);
  }, [wirs]);

  if (loading) {
    return (
      <ResponsiveContainer>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name}</p>
          </div>
          <StatsSkeleton />
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            {t('dashboard.title', 'Dashboard')}
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{profile?.full_name}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 4 }} gap={6}>
          <StatsCard
            title="Total WIRs"
            value={stats.totalWIRs}
            icon={FileCheck}
            description="Work Inspection Requests"
            trend={{
              value: 12,
              isPositive: true
            }}
          />
          
          <StatsCard
            title="Completion Rate"
            value={`${stats.completionRate.toFixed(1)}%`}
            icon={TrendingUp}
            description="This month"
            trend={{
              value: 5.2,
              isPositive: true
            }}
          />
          
          <StatsCard
            title="Completed WIRs"
            value={stats.completedWIRs}
            icon={CheckCircle2}
            description="Finished inspections"
          />
          
          <StatsCard
            title="BOQ Items"
            value={stats.totalBOQItems}
            icon={Activity}
            description="Total items in BOQ"
          />
        </ResponsiveGrid>

        {/* Content Grid */}
        <ResponsiveGrid cols={{ sm: 1, lg: 2 }} gap={8}>
          {/* Status Overview */}
          <EnhancedCard variant="elevated" hover>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Status Overview</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <EnhancedStatusBadge status="completed" showIcon />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                  <span className="text-2xl font-bold text-success">{stats.completedWIRs}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <EnhancedStatusBadge status="pending" showIcon />
                    <span className="text-sm font-medium">Submitted</span>
                  </div>
                  <span className="text-2xl font-bold text-warning">{stats.submittedWIRs}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <EnhancedStatusBadge status="approved" showIcon />
                    <span className="text-sm font-medium">Grade A</span>
                  </div>
                  <span className="text-2xl font-bold text-success">{stats.approvedWIRs}</span>
                </div>
              </div>
            </div>
          </EnhancedCard>

          {/* Recent Activity */}
          <EnhancedCard variant="elevated" hover>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Recent Activity</h2>
              </div>
              
              <div className="space-y-4">
                {recentWIRs.length > 0 ? (
                  recentWIRs.map((wir) => (
                    <div key={wir.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">WIR #{wir.wirNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {wir.region || 'Location not specified'}
                        </p>
                      </div>
                      <EnhancedStatusBadge 
                        status={wir.status === 'completed' ? 'completed' : 'pending'} 
                        size="sm" 
                        animated 
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No recent WIRs</p>
                  </div>
                )}
              </div>
            </div>
          </EnhancedCard>
        </ResponsiveGrid>

        {/* Quick Actions */}
        <EnhancedCard variant="gradient" className="text-center py-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Ready to get started?</h3>
            <p className="text-muted-foreground">
              Manage your work inspection requests efficiently with our modern tools.
            </p>
          </div>
        </EnhancedCard>
      </div>
    </ResponsiveContainer>
  );
};