import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Users, Briefcase, Award, TrendingUp } from 'lucide-react';
import { WIR, Contractor, Engineer } from '../../types';

interface PerformanceMetricsProps {
  contractors: Contractor[];
  engineers: Engineer[];
  wirs: WIR[];
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ contractors, engineers, wirs }) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Contractor Performance Analysis
  const contractorPerformance = useMemo(() => {
    const performance = contractors.map(contractor => {
      const contractorWirs = wirs.filter(w => w.contractor === contractor.name);
      const approvedWirs = contractorWirs.filter(w => w.result === 'A');
      const conditionalWirs = contractorWirs.filter(w => w.result === 'B');
      const rejectedWirs = contractorWirs.filter(w => w.result === 'C');
      
      const totalValue = contractorWirs.reduce((sum, w) => {
        if (w.result === 'A' || w.result === 'B') {
          return sum + (w.calculatedAmount || w.value || 0);
        }
        return sum;
      }, 0);

      const approvalRate = contractorWirs.length > 0 ? ((approvedWirs.length + conditionalWirs.length) / contractorWirs.length) * 100 : 0;
      const qualityScore = contractorWirs.length > 0 ? 
        ((approvedWirs.length * 100 + conditionalWirs.length * 100) / contractorWirs.length) : 0;
      
      // Risk score based on rejection rate and conditional rate
      const rejectionRate = contractorWirs.length > 0 ? (rejectedWirs.length / contractorWirs.length) * 100 : 0;
      const conditionalRate = contractorWirs.length > 0 ? (conditionalWirs.length / contractorWirs.length) * 100 : 0;
      const riskScore = Math.max(0, 100 - (rejectionRate * 2 + conditionalRate));

      return {
        name: contractor.name,
        company: contractor.company,
        totalWirs: contractorWirs.length,
        approvedWirs: approvedWirs.length,
        conditionalWirs: conditionalWirs.length,
        rejectedWirs: rejectedWirs.length,
        totalValue,
        approvalRate,
        qualityScore,
        riskScore,
        efficiency: contractorWirs.length > 0 ? (approvedWirs.length + conditionalWirs.length * 0.7) / contractorWirs.length * 100 : 0
      };
    }).filter(p => p.totalWirs > 0).sort((a, b) => b.qualityScore - a.qualityScore);

    return performance;
  }, [contractors, wirs]);

  // Engineer Performance Analysis  
  const engineerPerformance = useMemo(() => {
    const performance = engineers.map(engineer => {
      const engineerWirs = wirs.filter(w => w.engineer === engineer.name);
      const approvedWirs = engineerWirs.filter(w => w.result === 'A');
      const conditionalWirs = engineerWirs.filter(w => w.result === 'B');
      const rejectedWirs = engineerWirs.filter(w => w.result === 'C');
      
      const totalValue = engineerWirs.reduce((sum, w) => {
        if (w.result === 'A' || w.result === 'B') {
          return sum + (w.calculatedAmount || w.value || 0);
        }
        return sum;
      }, 0);

      const approvalRate = engineerWirs.length > 0 ? ((approvedWirs.length + conditionalWirs.length) / engineerWirs.length) * 100 : 0;
      const reviewEfficiency = engineerWirs.length > 0 ? 
        ((approvedWirs.length * 100 + conditionalWirs.length * 100) / engineerWirs.length) : 0;

      return {
        name: engineer.name,
        department: engineer.department,
        specialization: engineer.specialization,
        totalWirs: engineerWirs.length,
        approvedWirs: approvedWirs.length,
        conditionalWirs: conditionalWirs.length,
        rejectedWirs: rejectedWirs.length,
        totalValue,
        approvalRate,
        reviewEfficiency,
        thoroughness: engineerWirs.length > 0 ? Math.min(100, (conditionalWirs.length / engineerWirs.length) * 100 + 70) : 0
      };
    }).filter(p => p.totalWirs > 0).sort((a, b) => b.reviewEfficiency - a.reviewEfficiency);

    return performance;
  }, [engineers, wirs]);


  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-success text-success-foreground">Excellent</Badge>;
    if (score >= 75) return <Badge className="bg-primary text-primary-foreground">Good</Badge>;
    if (score >= 60) return <Badge className="bg-warning text-warning-foreground">Average</Badge>;
    return <Badge className="bg-destructive text-destructive-foreground">Needs Improvement</Badge>;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Contractor Performance */}
      <Card className="bg-card shadow-elegant border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-foreground">
            <Briefcase className="w-5 h-5 text-primary" />
            Contractor Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contractorPerformance.slice(0, 5).map((contractor, index) => (
              <div key={contractor.name} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{contractor.name}</h3>
                    <p className="text-sm text-muted-foreground">{contractor.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPerformanceBadge(contractor.qualityScore)}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Award className="w-3 h-3" />
                      #{index + 1}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total WIRs</p>
                    <p className="font-semibold text-foreground">{contractor.totalWirs}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Approval Rate</p>
                    <p className="font-semibold text-foreground">{contractor.approvalRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Value</p>
                    <p className="font-semibold text-foreground text-xs">
                      {formatter.format(contractor.totalValue)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Quality Score</span>
                    <span className="font-medium text-foreground">{contractor.qualityScore.toFixed(1)}%</span>
                  </div>
                  <Progress value={contractor.qualityScore} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    Approved: {contractor.approvedWirs}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    Conditional: {contractor.conditionalWirs}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    Rejected: {contractor.rejectedWirs}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engineer Performance */}
      <Card className="bg-card shadow-elegant border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-foreground">
            <Users className="w-5 h-5 text-primary" />
            Engineer Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {engineerPerformance.slice(0, 5).map((engineer, index) => (
              <div key={engineer.name} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{engineer.name}</h3>
                    <p className="text-sm text-muted-foreground">{engineer.department} • {engineer.specialization}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPerformanceBadge(engineer.reviewEfficiency)}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      #{index + 1}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Reviews</p>
                    <p className="font-semibold text-foreground">{engineer.totalWirs}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Approval Rate</p>
                    <p className="font-semibold text-foreground">{engineer.approvalRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Review Value</p>
                    <p className="font-semibold text-foreground text-xs">
                      {formatter.format(engineer.totalValue)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Review Efficiency</span>
                    <span className="font-medium text-foreground">{engineer.reviewEfficiency.toFixed(1)}%</span>
                  </div>
                  <Progress value={engineer.reviewEfficiency} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    Approved: {engineer.approvedWirs}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    Conditional: {engineer.conditionalWirs}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    Rejected: {engineer.rejectedWirs}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default PerformanceMetrics;