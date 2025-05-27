
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { WIR } from '@/types';
import { useLanguage } from '../../context/LanguageContext';

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
  
  const numberFormatter = new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US');
  
  if (wirs.length === 0) return null;

  return (
    <div>
      <h4 className="font-medium mb-3">
        {t('progress.relatedWirs')}
      </h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('progress.wirId')}</TableHead>
            <TableHead>{t('progress.contractor')}</TableHead>
            <TableHead>{t('progress.engineer')}</TableHead>
            <TableHead>{t('progress.wirValue')}</TableHead>
            <TableHead>{t('progress.status')}</TableHead>
            <TableHead>{t('progress.result')}</TableHead>
            <TableHead>{t('progress.amountForItem')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wirs.map((wir) => {
            const wirAmountForThisItem = getWIRAmountForBOQ(wir, boqItemId);
            
            return (
              <TableRow key={wir.id}>
                <TableCell className="font-medium">{wir.id}</TableCell>
                <TableCell>{wir.contractor}</TableCell>
                <TableCell>{wir.engineer}</TableCell>
                <TableCell>{numberFormatter.format(wir.value || 0)}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    wir.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                    wir.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {wir.status}
                  </span>
                </TableCell>
                <TableCell>
                  {wir.result && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      wir.result === 'A' ? 'bg-green-100 text-green-800' :
                      wir.result === 'B' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {wir.result}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {wirAmountForThisItem > 0 ? formatter.format(wirAmountForThisItem) : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
