
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { WIR } from '@/types';

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
  if (wirs.length === 0) return null;

  return (
    <div>
      <h4 className="font-medium mb-3">
        {language === 'en' ? 'Related WIRs' : 'طلبات المعاينة المرتبطة'}
      </h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{language === 'en' ? 'WIR ID' : 'رقم طلب المعاينة'}</TableHead>
            <TableHead>{language === 'en' ? 'Contractor' : 'المقاول'}</TableHead>
            <TableHead>{language === 'en' ? 'Engineer' : 'المهندس'}</TableHead>
            <TableHead>{language === 'en' ? 'WIR Value' : 'قيمة الطلب'}</TableHead>
            <TableHead>{language === 'en' ? 'Status' : 'الحالة'}</TableHead>
            <TableHead>{language === 'en' ? 'Result' : 'النتيجة'}</TableHead>
            <TableHead>{language === 'en' ? 'Amount for this Item' : 'المبلغ لهذا البند'}</TableHead>
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
                <TableCell>{wir.value?.toLocaleString()}</TableCell>
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
