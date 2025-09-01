import React, { useState, useEffect, useRef } from 'react';
import { WIR, BOQItem } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Attachment } from '@/types/attachments';

interface WIRPrintViewProps {
  wir: WIR;
  flattenedBOQItems: BOQItem[];
  onPrintReady?: () => void;
}

const WIRPrintView: React.FC<WIRPrintViewProps> = ({ wir, flattenedBOQItems, onPrintReady }) => {
  const { breakdownItems } = useAppContext();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});
  const [attachmentsLoaded, setAttachmentsLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [allContentReady, setAllContentReady] = useState(false);
  const contentReadyRef = useRef(false);

  const getBOQItemDetails = (id: string) => {
    const item = flattenedBOQItems.find(item => item.id === id);
    return item || null;
  };

  const getSelectedBreakdownItems = () => {
    if (!wir.selectedBreakdownItems || !breakdownItems) return [];
    return breakdownItems.filter(item => wir.selectedBreakdownItems?.includes(item.id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const selectedBOQItem = getBOQItemDetails(wir.boqItemId);
  const selectedBreakdownItems = getSelectedBreakdownItems();

  // Check if all content is ready for printing
  useEffect(() => {
    const hasAttachments = wir.attachments && wir.attachments.length > 0;
    const hasImages = attachments.some(att => att.file_type.startsWith('image/'));
    
    if (!hasAttachments) {
      // No attachments, content is ready
      setAllContentReady(true);
      contentReadyRef.current = true;
      return;
    }

    if (!attachmentsLoaded) {
      // Still loading attachments
      setAllContentReady(false);
      contentReadyRef.current = false;
      return;
    }

    if (hasImages) {
      // Check if all images are loaded
      const imageAttachments = attachments.filter(att => att.file_type.startsWith('image/'));
      const allImagesLoaded = imageAttachments.every(att => imagesLoaded[att.id]);
      
      if (allImagesLoaded) {
        setAllContentReady(true);
        contentReadyRef.current = true;
      } else {
        setAllContentReady(false);
        contentReadyRef.current = false;
      }
    } else {
      // No images, just need attachments loaded
      setAllContentReady(true);
      contentReadyRef.current = true;
    }
  }, [attachmentsLoaded, imagesLoaded, attachments, wir.attachments]);

  // Notify parent when content is ready and trigger print
  useEffect(() => {
    if (allContentReady && onPrintReady) {
      // Add a small delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        onPrintReady();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [allContentReady, onPrintReady]);

  // Handle image load events
  const handleImageLoad = (attachmentId: string) => {
    console.log('Image loaded successfully:', attachmentId);
    setImagesLoaded(prev => ({ ...prev, [attachmentId]: true }));
  };

  const handleImageError = (attachmentId: string) => {
    console.error('Image failed to load:', attachmentId);
    setImagesLoaded(prev => ({ ...prev, [attachmentId]: true })); // Mark as "loaded" to continue
  };

  // Fetch attachments and their URLs directly
  useEffect(() => {
    const fetchAttachmentsAndUrls = async () => {
      if (!wir.attachments || wir.attachments.length === 0) {
        setAttachmentsLoaded(true);
        return;
      }

      setAttachmentsLoaded(false);
      console.log('Fetching attachments for WIR:', wir.attachments);

      try {
        // Fetch attachment records from database
        const { data: attachmentData, error: fetchError } = await supabase
          .from('attachments')
          .select('*')
          .in('id', wir.attachments)
          .eq('is_active', true);

        if (fetchError) {
          console.error('Error fetching attachments:', fetchError);
          setAttachmentsLoaded(true);
          return;
        }

        console.log('Fetched attachments:', attachmentData?.length || 0);
        setAttachments(attachmentData || []);

        // Get download URLs for each attachment
        const urls: Record<string, string> = {};
        for (const attachment of attachmentData || []) {
          try {
            const { data: urlData, error: urlError } = await supabase.storage
              .from('attachments')
              .createSignedUrl(attachment.storage_path, 3600);

            if (!urlError && urlData?.signedUrl) {
              // Construct full URL if signedUrl is relative
              let fullUrl = urlData.signedUrl;
              if (fullUrl.startsWith('/')) {
                fullUrl = `https://xlxqgasvhfohmmyftskf.supabase.co/storage/v1${fullUrl}`;
              }
              urls[attachment.id] = fullUrl;
              console.log('Got URL for attachment:', attachment.file_name, fullUrl);
            } else {
              console.error('Failed to get URL for attachment:', attachment.id, urlError);
            }
          } catch (error) {
            console.error('Error getting URL for attachment:', attachment.id, error);
          }
        }

        setAttachmentUrls(urls);
        console.log('Loaded', Object.keys(urls).length, 'attachment URLs');
      } catch (error) {
        console.error('Error in fetchAttachmentsAndUrls:', error);
      } finally {
        setAttachmentsLoaded(true);
      }
    };

    fetchAttachmentsAndUrls();
  }, [wir.attachments]);

  return (
    <div className="max-w-none mx-auto bg-white p-8 print:p-6 print:max-w-none print:shadow-none">
      {/* Header with Company Logo and Info */}
      <div className="border-b-2 border-blue-600 pb-6 mb-8 print:mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 flex items-center justify-center">
              <img 
                src="/lovable-uploads/95c8557c-cd51-4f8b-b734-7a87f9249f1a.png" 
                alt="Company Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Saad Saeed Al-Saadi & Sons Company</h1>
              <h2 className="text-lg text-gray-600">شركة سعد سعيد الصاعدي وأولاده التضامنية</h2>
              <p className="text-sm text-gray-500 mt-1">Work Inspection Request Document</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">WIR Number</div>
            <div className="text-2xl font-bold text-blue-600">{wir.wirNumber || wir.id}</div>
            <div className="text-sm text-gray-500 mt-2">
              Submission Date: {formatDate(wir.submittalDate)}
            </div>
          </div>
        </div>
      </div>

      {/* BOQ Item Information */}
      <div className="mb-8 print:mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          BOQ Item Information
        </h3>
        {selectedBOQItem && (
          <div className="bg-gray-50 p-6 rounded-lg print:bg-white print:border print:border-gray-300">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 font-semibold text-gray-700 w-1/4">BOQ Code:</td>
                  <td className="py-3 text-gray-900 font-mono">{selectedBOQItem.code}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 font-semibold text-gray-700">Description:</td>
                  <td className="py-3 text-gray-900">{selectedBOQItem.description}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 font-semibold text-gray-700">Quantity:</td>
                  <td className="py-3 text-gray-900">{selectedBOQItem.quantity} {selectedBOQItem.unit}</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-gray-700">Unit Rate:</td>
                  <td className="py-3 text-gray-900 font-semibold">{formatCurrency(selectedBOQItem.unitRate || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Breakdown Sub-Items */}
      {selectedBreakdownItems.length > 0 && (
        <div className="mb-8 print:mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
            Breakdown Sub-Items
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg print:bg-white print:border print:border-gray-300">
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 print:bg-gray-50">
                  <th className="border border-gray-300 text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="border border-gray-300 text-center py-3 px-4 font-semibold text-gray-700">Percentage</th>
                  <th className="border border-gray-300 text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedBreakdownItems.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}>
                    <td className="border border-gray-300 py-3 px-4 text-gray-900">{item.description}</td>
                    <td className="border border-gray-300 py-3 px-4 text-center text-gray-900">{item.percentage}%</td>
                    <td className="border border-gray-300 py-3 px-4 text-right text-gray-900 font-semibold">{formatCurrency(item.value || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Location & Technical Details */}
      <div className="mb-8 print:mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          Location & Technical Details
        </h3>
        <div className="bg-gray-50 p-6 rounded-lg print:bg-white print:border print:border-gray-300">
          {/* Manhole Information */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3 text-base border-b border-gray-200 pb-2">Manhole Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-semibold text-gray-700 w-1/3">From Manhole:</td>
                    <td className="py-2 text-gray-900 font-mono">{wir.manholeFrom || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-700">To Manhole:</td>
                    <td className="py-2 text-gray-900 font-mono">{wir.manholeTo || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Location Information */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3 text-base border-b border-gray-200 pb-2">Location Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-semibold text-gray-700 w-1/3">Zone:</td>
                    <td className="py-2 text-gray-900">{wir.zone || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-semibold text-gray-700">Road:</td>
                    <td className="py-2 text-gray-900">{wir.road || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-700">Line:</td>
                    <td className="py-2 text-gray-900">{wir.line || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-semibold text-gray-700 w-1/3">Region:</td>
                    <td className="py-2 text-gray-900">{wir.region}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-700">Line Number:</td>
                    <td className="py-2 text-gray-900">{wir.lineNo}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3 text-base border-b border-gray-200 pb-2">Technical Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-semibold text-gray-700 w-1/2">Length of Line:</td>
                    <td className="py-2 text-gray-900 font-semibold">{wir.lengthOfLine} meters</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-700">Diameter of Line:</td>
                    <td className="py-2 text-gray-900 font-semibold">{wir.diameterOfLine} mm</td>
                  </tr>
                </tbody>
              </table>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-semibold text-gray-700 w-1/2">WIR Value:</td>
                    <td className="py-2 text-gray-900 font-semibold">{formatCurrency(wir.value || 0)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-700">Status:</td>
                    <td className="py-2">
                      <span className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium bg-blue-600">
                        {wir.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Project Team */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3 text-base border-b border-gray-200 pb-2">Project Team</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-semibold text-gray-700 w-1/3">Contractor:</td>
                    <td className="py-2 text-gray-900">{wir.contractor}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-gray-700">Engineer:</td>
                    <td className="py-2 text-gray-900">{wir.engineer}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Work Description */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 text-base border-b border-gray-200 pb-2">Work Description</h4>
            <div className="bg-white p-4 rounded border border-gray-300 min-h-[80px]">
              <p className="text-gray-900 leading-relaxed">{wir.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Details - removed calculation formula section */}
      {wir.calculatedAmount && (
        <div className="mb-8 print:mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
            Calculation Details
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg print:bg-white print:border print:border-gray-300">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-3 font-semibold text-gray-700">Calculated Amount:</td>
                  <td className="py-3 text-gray-900 font-bold text-lg">{formatCurrency(wir.calculatedAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status and Result Details */}
      <div className="mb-8 print:mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
          Inspection Result
        </h3>
        <div className="bg-gray-50 p-6 rounded-lg print:bg-white print:border print:border-gray-300">
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-4">Status:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={wir.result === 'A'}
                  readOnly
                />
                <span className="text-sm text-gray-900">A - Approved</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={wir.result === 'B'}
                  readOnly
                />
                <span className="text-sm text-gray-900">B - Conditional Approved</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={wir.result === 'C'}
                  readOnly
                />
                <span className="text-sm text-gray-900">C - Rejected</span>
              </label>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Result Details:</h4>
            <div className="bg-white p-4 border border-gray-300 rounded min-h-[120px]">
              <p className="text-gray-900 leading-relaxed">
                {wir.statusConditions || ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attachment Content */}
      {wir.attachments && wir.attachments.length > 0 && (
        <div className="mb-8 print:mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
            Attachments
          </h3>
          
          {!attachmentsLoaded && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-gray-600">Loading attachments...</p>
              </div>
            </div>
          )}
          
          {attachmentsLoaded && attachments.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-red-600">No attachments found</p>
              </div>
            </div>
          )}
          
          {attachmentsLoaded && attachments.length > 0 && (
            <div className="space-y-6">
              {attachments.map((attachment) => {
                const url = attachmentUrls[attachment.id];
                
                // Show placeholder if URL is not available
                if (!url) {
                  return (
                    <div key={attachment.id} className="flex items-center justify-center h-32 border border-red-300 rounded bg-red-50">
                      <div className="text-center">
                        <p className="text-red-600 font-medium">Failed to load: {attachment.file_name}</p>
                        <p className="text-sm text-red-500">File type: {attachment.file_type}</p>
                        <p className="text-xs text-red-400 mt-1">URL: {url || 'Not available'}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={attachment.id} className="attachment-content page-break-inside-avoid">
                    <div className="mb-3 border-b border-gray-200 pb-2">
                      <h4 className="text-base font-semibold text-gray-800">{attachment.file_name}</h4>
                      <p className="text-xs text-gray-500">File Type: {attachment.file_type} • Size: {Math.round((attachment.file_size || 0) / 1024)} KB</p>
                    </div>
                    
                    {attachment.file_type.startsWith('image/') ? (
                      <div className="border border-gray-300 rounded bg-white p-2 print-attachment-content">
                        <img 
                          src={url} 
                          alt={attachment.file_name}
                          className="max-w-full h-auto mx-auto print-attachment-image"
                          style={{ maxHeight: '600px' }}
                          onLoad={() => handleImageLoad(attachment.id)}
                          onError={() => handleImageError(attachment.id)}
                          crossOrigin="anonymous"
                        />
                      </div>
                    ) : (attachment.file_type === 'application/pdf' || attachment.file_name.toLowerCase().endsWith('.pdf')) ? (
                      <div className="border border-gray-300 rounded bg-white print-attachment-content">
                        <div className="w-full">
                          <iframe
                            src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full border-0 print-attachment-image"
                            style={{ height: '800px' }}
                            title={`PDF: ${attachment.file_name}`}
                            onLoad={() => console.log('PDF loaded:', attachment.file_name)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 border border-gray-300 rounded bg-gray-100">
                        <div className="text-center">
                          <p className="text-gray-600 font-medium">{attachment.file_name}</p>
                          <p className="text-sm text-gray-500">File type: {attachment.file_type}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            This file type cannot be displayed inline.
                          </p>
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block mt-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Signature Section */}
      <div className="mt-12 print:mt-8 print:break-inside-avoid">
        <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-300">
          Approval & Signatures
        </h3>
        <div className="text-center">
          <div className="border-b-2 border-gray-400 mb-3 pb-8"></div>
          <div className="space-y-1">
            <p className="font-semibold text-gray-900">Approved by</p>
            <p className="text-sm text-gray-600">Name: _________________</p>
            <p className="text-sm text-gray-600">Date: _________________</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-200 pt-6 mt-12 print:mt-8">
        <div className="flex justify-between text-sm text-gray-500 print:text-xs">
          <div>
            <p>Generated on: {formatDate(new Date().toISOString().split('T')[0])}</p>
            <p>Document ID: {wir.wirNumber || wir.id}</p>
          </div>
          <div className="text-right">
            <p>Saad Saeed Al-Saadi & Sons Company</p>
            <p>شركة سعد سعيد الصاعدي وأولاده التضامنية</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WIRPrintView;
