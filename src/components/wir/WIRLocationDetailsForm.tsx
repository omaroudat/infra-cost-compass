import React from 'react';
import { WIR } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';

interface WIRLocationDetailsFormProps {
  newWIR: Partial<WIR>;
  setNewWIR: React.Dispatch<React.SetStateAction<Partial<WIR>>>;
  isResultSubmission?: boolean;
}

const WIRLocationDetailsForm: React.FC<WIRLocationDetailsFormProps> = ({
  newWIR,
  setNewWIR,
  isResultSubmission = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Manhole Information */}
      <Card className="border-2 border-emerald-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-emerald-800">
            <Navigation className="w-4 h-4" />
            Manhole Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manholeFrom">Manhole From *</Label>
              <Input
                id="manholeFrom"
                value={newWIR.manholeFrom || ''}
                onChange={(e) => setNewWIR(prev => ({ ...prev, manholeFrom: e.target.value }))}
                placeholder="Enter starting manhole ID"
                disabled={isResultSubmission}
              />
            </div>
            <div>
              <Label htmlFor="manholeTo">Manhole To *</Label>
              <Input
                id="manholeTo"
                value={newWIR.manholeTo || ''}
                onChange={(e) => setNewWIR(prev => ({ ...prev, manholeTo: e.target.value }))}
                placeholder="Enter ending manhole ID"
                disabled={isResultSubmission}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-blue-800">
            <MapPin className="w-4 h-4" />
            Location Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="zone">Zone *</Label>
              <Input
                id="zone"
                value={newWIR.zone || ''}
                onChange={(e) => setNewWIR(prev => ({ ...prev, zone: e.target.value }))}
                placeholder="Enter zone"
                disabled={isResultSubmission}
              />
            </div>
            <div>
              <Label htmlFor="road">Road *</Label>
              <Input
                id="road"
                value={newWIR.road || ''}
                onChange={(e) => setNewWIR(prev => ({ ...prev, road: e.target.value }))}
                placeholder="Enter road name/ID"
                disabled={isResultSubmission}
              />
            </div>
            <div>
              <Label htmlFor="line">Line *</Label>
              <Input
                id="line"
                value={newWIR.line || ''}
                onChange={(e) => setNewWIR(prev => ({ ...prev, line: e.target.value }))}
                placeholder="Enter line designation"
                disabled={isResultSubmission}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="region">Region *</Label>
              <Input
                id="region"
                value={newWIR.region || ''}
                onChange={(e) => setNewWIR(prev => ({ ...prev, region: e.target.value }))}
                placeholder="Enter region"
                disabled={isResultSubmission}
              />
            </div>
            <div>
              <Label htmlFor="lineNo">Line Number *</Label>
              <Input
                id="lineNo"
                value={newWIR.lineNo || ''}
                onChange={(e) => setNewWIR(prev => ({ ...prev, lineNo: e.target.value }))}
                placeholder="Enter line number"
                disabled={isResultSubmission}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-purple-800">
            <Navigation className="w-4 h-4" />
            Technical Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lengthOfLine">Length of Line (meters) *</Label>
              <Input
                id="lengthOfLine"
                type="number"
                step="0.01"
                min="0"
                value={newWIR.lengthOfLine || ''}
                onChange={(e) => setNewWIR(prev => ({ ...prev, lengthOfLine: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter length in meters"
                disabled={isResultSubmission}
              />
            </div>
            <div>
              <Label htmlFor="diameterOfLine">Diameter of Line (mm) *</Label>
              <Input
                id="diameterOfLine"
                type="number"
                step="0.01"
                min="0"
                value={newWIR.diameterOfLine || ''}
                onChange={(e) => setNewWIR(prev => ({ ...prev, diameterOfLine: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter diameter in mm"
                disabled={isResultSubmission}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WIRLocationDetailsForm;