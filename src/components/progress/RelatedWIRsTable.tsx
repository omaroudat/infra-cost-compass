
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { WIR } from '@/types';
import { useLanguage } from '../../context/LanguageContext';
import { Badge } from '@/components/ui/badge';

interface RelatedWIRsTableProps {
  wirs: WIR[];
  boqItemId: string;
  language: 'en' | 'ar';
  formatter: Intl.NumberFormat;
  getWIRAmountForBOQ: (wir: WIR, boqId: string) => number;
}

export const RelatedWIRsTable: React.FC<RelatedWIRsTableProps> = ({
  wirs,
  boqItemId,
  language,
  formatter,
  getWIRAmountForBOQ
}) => {
  const { t } = useLanguage();
  
  // Always use English number formatting
  const numberFormatter = new Intl.NumberFormat('en-US');
  
  // Always use English currency formatting
  const englishFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  if (wirs.length === 0) return null;

  return (
    <div>
      <h4 className="font-medium mb-3 text-slate-800">
        {t('progress.relatedWirs')} ({wirs.length})
      </h4>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold text-slate-700">{t('progress.wirId')}</TableHead>
              <TableHead className="font-semibold text-slate-700">{t('progress.contractor')}</TableHead>
              <TableHead className="font-semibold text-slate-700">{t('progress.engineer')}</TableHead>
              <TableHead className="font-semibold text-slate-700">{t('progress.wirValue')}</TableHead>
              <TableHead className="font-semibold text-slate-700">{t('progress.status')}</TableHead>
              <TableHead className="font-semibold text-slate-700">{t('progress.result')}</TableHead>
              <TableHead className="font-semibold text-slate-700">Approved Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wirs.map((wir) => {
              const wirAmountForThisItem = getWIRAmountForBOQ(wir, boqItemId);
              const isApproved = wir.result === 'A' || wir.result === 'B';
              const approvedAmount = isApproved ? (wir.calculatedAmount || wir.value || 0) : 0;
              
              return (
                <TableRow key={wir.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">{wir.id.slice(0, 8)}...</TableCell>
                  <TableCell className="text-slate-700">{wir.contractor}</TableCell>
                  <TableCell className="text-slate-700">{wir.engineer}</TableCell>
                  <TableCell className="font-medium text-slate-900">{numberFormatter.format(wir.value || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      wir.status === 'submitted' ? 'secondary' :
                      wir.status === 'completed' ? 'default' :
                      'outline'
                    }>
                      {wir.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {wir.result && (
                      <Badge variant={
                        wir.result === 'A' ? 'default' :
                        wir.result === 'B' ? 'secondary' :
                        'destructive'
                      } className={
                        wir.result === 'A' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                        wir.result === 'B' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                        'bg-red-100 text-red-800 hover:bg-red-200'
                      }>
                        {wir.result === 'A' ? 'Approved' :
                         wir.result === 'B' ? 'Conditional' :
                         'Rejected'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900">
                        {approvedAmount > 0 ? englishFormatter.format(approvedAmount) : '-'}
                      </div>
                      {isApproved && wirAmountForThisItem > 0 && wirAmountForThisItem !== approvedAmount && (
                        <div className="text-xs text-slate-500">
                          For this item: {englishFormatter.format(wirAmountForThisItem)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {/* Summary Row */}
      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-slate-700">Total Approved Amount for this Item:</span>
          <span className="font-bold text-slate-900">
            {englishFormatter.format(
              wirs
                .filter(wir => wir.result === 'A' || wir.result === 'B')
                .reduce((sum, wir) => sum + getWIRAmountForBOQ(wir, boqItemId), 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
