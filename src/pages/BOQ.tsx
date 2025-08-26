
import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { BOQItem } from '../types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Download, Upload, Plus, Edit, ChevronDown, ChevronRight, Expand, Shrink, FileText, Package, DollarSign, Hash, Calculator, Globe, Search, X, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

const BOQ = () => {
  const { boqItems, addBOQItem, updateBOQItem, deleteBOQItem } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<BOQItem>>({
    code: '',
    description: '',
    descriptionAr: '',
    quantity: 0,
    unit: '',
    unitAr: '',
    unitRate: 0,
  });
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<BOQItem[]>([]);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  
  // Always use English number formatting
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  // Calculate total amount for an item (sum of children if parent, or own calculation if leaf)
  const calculateItemTotal = (item: BOQItem): number => {
    if (item.children && item.children.length > 0) {
      // Parent item: sum of all children's totals
      return item.children.reduce((sum, child) => sum + calculateItemTotal(child), 0);
    } else {
      // Leaf item: quantity * unitRate
      return item.quantity * item.unitRate;
    }
  };
  
  // Function to find BOQ item by code recursively
  const findItemByCode = (items: BOQItem[], code: string): BOQItem | null => {
    for (const item of items) {
      if (item.code === code) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = findItemByCode(item.children, code);
        if (found) return found;
      }
    }
    return null;
  };
  
  // Function to flatten BOQ items for export
  const flattenBOQItems = (items: BOQItem[], level: number = 0, parentCode: string = ''): any[] => {
    const result: any[] = [];
    items.forEach(item => {
      const totalValue = calculateItemTotal(item);
      result.push({
        'Item Code': item.code,
        'Description (EN)': item.description,
        'Description (AR)': item.descriptionAr || '',
        'Quantity': item.quantity,
        'Unit (EN)': item.unit,
        'Unit (AR)': item.unitAr || '',
        'Unit Rate': item.unitRate,
        'Total Amount': totalValue,
        'Level': level,
        'Parent Code': parentCode
      });
      
      if (item.children && item.children.length > 0) {
        result.push(...flattenBOQItems(item.children, level + 1, item.code));
      }
    });
    return result;
  };
  
  const exportToExcel = () => {
    try {
      const flattenedData = flattenBOQItems(boqItems);
      const worksheet = XLSX.utils.json_to_sheet(flattenedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'BOQ Items');
      
      // Set column widths
      worksheet['!cols'] = [
        { width: 15 }, // Item Code
        { width: 40 }, // Description (EN)
        { width: 40 }, // Description (AR)
        { width: 12 }, // Quantity
        { width: 15 }, // Unit (EN)
        { width: 15 }, // Unit (AR)
        { width: 15 }, // Unit Rate
        { width: 18 }, // Total Amount
        { width: 8 },  // Level
        { width: 15 }  // Parent Code
      ];
      
      XLSX.writeFile(workbook, `BOQ_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('BOQ data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export BOQ data');
    }
  };
  
  const importFromExcel = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('Imported data:', jsonData);
        
        // Process imported data and build hierarchy
        let importCount = 0;
        let skippedCount = 0;
        
        // First, sort data by level to ensure parents are created before children
        const sortedData = jsonData.sort((a: any, b: any) => {
          const levelA = parseInt(a['Level']) || 0;
          const levelB = parseInt(b['Level']) || 0;
          return levelA - levelB;
        });
        
        // Keep track of created items by code for parent lookup
        const createdItemsMap = new Map<string, string>(); // code -> id
        
        // First, add all existing items to the map for parent lookup
        const addExistingItemsToMap = (items: BOQItem[]) => {
          items.forEach(item => {
            createdItemsMap.set(item.code, item.id);
            if (item.children && item.children.length > 0) {
              addExistingItemsToMap(item.children);
            }
          });
        };
        addExistingItemsToMap(boqItems);
        
        for (const row of sortedData) {
          const itemData = {
            code: row['Item Code'] || '',
            description: row['Description (EN)'] || row['Item Code'] || '', // Fallback to code if no description
            descriptionAr: row['Description (AR)'] || '',
            quantity: parseFloat(row['Quantity']) || 0,
            unit: row['Unit (EN)'] || '',
            unitAr: row['Unit (AR)'] || '',
            unitRate: parseFloat(row['Unit Rate']) || 0,
            level: parseInt(row['Level']) || 0,
            parentCode: row['Parent Code'] || ''
          };
          
          console.log('Processing item:', itemData);
          
          // Only import if at least code is provided (minimum requirement)
          if (itemData.code) {
            // Check if item already exists
            const existingItem = findItemByCode(boqItems, itemData.code);
            if (existingItem) {
              console.log('Item already exists, skipping:', itemData.code);
              // Add to map even if skipped for parent lookup
              createdItemsMap.set(itemData.code, existingItem.id);
              skippedCount++;
              continue;
            }
            
            let parentId: string | undefined = undefined;
            
            // Find parent if parentCode is provided
            if (itemData.parentCode) {
              console.log(`Looking for parent '${itemData.parentCode}' for item '${itemData.code}'`);
              const parentIdFromMap = createdItemsMap.get(itemData.parentCode);
              if (parentIdFromMap) {
                parentId = parentIdFromMap;
                console.log('✅ Found parent from map for', itemData.code, ':', itemData.parentCode, '→', parentIdFromMap);
              } else {
                console.log('❌ Parent not found for', itemData.code, ', parent code:', itemData.parentCode);
                console.log('Available parent codes in map:', Array.from(createdItemsMap.keys()));
                
                // Try to find a similar parent code (case-insensitive or with leading zeros)
                const possibleParents = Array.from(createdItemsMap.keys()).filter(code => 
                  code.toLowerCase() === itemData.parentCode.toLowerCase() ||
                  code === itemData.parentCode.padStart(2, '0') ||
                  code.padStart(2, '0') === itemData.parentCode
                );
                
                if (possibleParents.length > 0) {
                  const foundParentCode = possibleParents[0];
                  parentId = createdItemsMap.get(foundParentCode);
                  console.log('🔍 Found similar parent code:', foundParentCode, '→', parentId);
                } else {
                  console.log('💡 Suggestion: Make sure parent code matches exactly. Expected:', itemData.parentCode);
                }
              }
            }
            
            const itemToAdd = {
              code: itemData.code,
              description: itemData.description,
              descriptionAr: itemData.descriptionAr,
              quantity: itemData.quantity,
              unit: itemData.unit,
              unitAr: itemData.unitAr,
              unitRate: itemData.unitRate,
              level: itemData.level
            };
            
            console.log('Adding item:', itemToAdd, 'with parentId:', parentId);
            
            try {
              const createdItem = await addBOQItem(itemToAdd, parentId);
              // Store the created item ID for future parent lookups
              if (createdItem && createdItem.id) {
                createdItemsMap.set(itemData.code, createdItem.id);
              }
              importCount++;
            } catch (error) {
              console.error('Error adding item:', itemData.code, error);
              skippedCount++;
            }
            } else {
              console.log('Skipping item due to missing item code:', itemData);
              skippedCount++;
            }
        }
        
        if (importCount > 0) {
          toast.success(`Successfully imported ${importCount} BOQ items!${skippedCount > 0 ? ` (${skippedCount} items skipped)` : ''}`);
          // Force a complete refresh of the data to show proper hierarchy
          window.location.reload();
        } else {
          toast.warning('No items were imported. Please check the file format and data.');
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import BOQ data. Please check the file format.');
      }
    };
    reader.readAsBinaryString(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' || name === 'unitRate' ? parseFloat(value) || 0 : value 
    }));
  };
  
  const generateNextCode = (parentCode?: string, siblings?: BOQItem[]) => {
    if (!parentCode) {
      const topLevelItems = boqItems.filter(item => !item.parentId);
      const maxNumber = topLevelItems.reduce((max, item) => {
        const num = parseInt(item.code);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
      return (maxNumber + 1).toString();
    }
    
    const siblingCodes = siblings || [];
    const maxSubNumber = siblingCodes.reduce((max, item) => {
      const parts = item.code.split('.');
      const lastPart = parseInt(parts[parts.length - 1]);
      return isNaN(lastPart) ? max : Math.max(max, lastPart);
    }, 0);
    
    return `${parentCode}.${maxSubNumber + 1}`;
  };
  
  const handleAddItem = () => {
    if (!newItem.code || !newItem.description) {
      toast.error('Please fill in code and description.');
      return;
    }
    
    // For leaf items (items with actual quantity and unit values), validate these fields
    // Parent items can have empty quantity/unit as they represent categories
    const hasQuantityOrUnit = newItem.quantity !== undefined && newItem.quantity > 0 || newItem.unit;
    if (hasQuantityOrUnit && (!newItem.unit || newItem.quantity === undefined || newItem.quantity === null)) {
      toast.error('Please fill in both quantity and unit, or leave both empty for parent categories.');
      return;
    }
    
    if (editingItem) {
      // Update existing item
      updateBOQItem(editingItem, newItem);
      toast.success('BOQ item updated successfully.');
    } else {
      // Add new item
      const totalAmount = (newItem.quantity || 0) * (newItem.unitRate || 0);
      const itemToAdd = {
        ...newItem,
        totalAmount,
        level: parentId ? (getItemLevel(parentId) + 1) : 0
      };
      
      addBOQItem(itemToAdd as Omit<BOQItem, 'id'>, parentId);
      toast.success('BOQ item added successfully.');
    }
    
    resetForm();
  };
  
  const resetForm = () => {
    setNewItem({
      code: '',
      description: '',
      descriptionAr: '',
      quantity: 0,
      unit: '',
      unitAr: '',
      unitRate: 0,
    });
    setParentId(undefined);
    setEditingItem(null);
    setIsAddDialogOpen(false);
  };
  
  const handleEditItem = (item: BOQItem) => {
    setNewItem({
      code: item.code,
      description: item.description,
      descriptionAr: item.descriptionAr,
      quantity: item.quantity,
      unit: item.unit,
      unitAr: item.unitAr,
      unitRate: item.unitRate,
    });
    setEditingItem(item.id);
    setParentId(undefined);
    setIsAddDialogOpen(true);
  };
  
  const getItemLevel = (itemId: string): number => {
    const findItem = (items: BOQItem[], id: string): BOQItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItem(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const item = findItem(boqItems, itemId);
    return item?.level || 0;
  };
  
  const handleDeleteItem = (itemId: string, itemCode: string) => {
    deleteBOQItem(itemId);
    toast.success(`BOQ item ${itemCode} deleted successfully.`);
  };
  
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const getAllItemIds = (items: BOQItem[]): string[] => {
      const ids: string[] = [];
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          ids.push(item.id);
          ids.push(...getAllItemIds(item.children));
        }
      });
      return ids;
    };
    setExpandedItems(new Set(getAllItemIds(boqItems)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  // Filter BOQ items recursively
  const filterBOQItems = (items: BOQItem[], searchTerm: string): BOQItem[] => {
    if (!searchTerm.trim()) return items;

    const filtered: BOQItem[] = [];
    const term = searchTerm.toLowerCase();

    for (const item of items) {
      // Check if current item matches
      const codeMatch = item.code.toLowerCase().includes(term);
      const descMatch = item.description.toLowerCase().includes(term);
      const descArMatch = item.descriptionAr?.toLowerCase().includes(term) || false;
      const itemMatches = codeMatch || descMatch || descArMatch;

      // Recursively filter children
      const filteredChildren = item.children ? filterBOQItems(item.children, searchTerm) : [];
      
      // Include item if it matches or has matching children
      if (itemMatches || filteredChildren.length > 0) {
        filtered.push({
          ...item,
          children: filteredChildren.length > 0 ? filteredChildren : item.children
        });
      }
    }

    return filtered;
  };

  // Handle search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      const filtered = filterBOQItems(boqItems, value);
      setFilteredItems(filtered);
      // Auto expand matching items
      const expandItems = (items: BOQItem[]) => {
        items.forEach(item => {
          if (item.children && item.children.length > 0) {
            expandedItems.add(item.id);
            expandItems(item.children);
          }
        });
      };
      expandItems(filtered);
      setExpandedItems(new Set(expandedItems));
    } else {
      setFilteredItems([]);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setFilteredItems([]);
    setSearchFocused(false);
  };

  // Get suggestions based on search term
  const getSearchSuggestions = (term: string): string[] => {
    if (!term.trim() || term.length < 2) return [];
    
    const suggestions = new Set<string>();
    const lowerTerm = term.toLowerCase();
    
    const collectSuggestions = (items: BOQItem[]) => {
      items.forEach(item => {
        // Add matching codes
        if (item.code.toLowerCase().includes(lowerTerm)) {
          suggestions.add(item.code);
        }
        // Add matching descriptions
        const words = item.description.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.includes(lowerTerm) && word.length > 2) {
            suggestions.add(word);
          }
        });
        
        if (item.children) {
          collectSuggestions(item.children);
        }
      });
    };
    
    collectSuggestions(boqItems);
    return Array.from(suggestions).slice(0, 5);
  };

  const suggestions = getSearchSuggestions(searchTerm);
  const displayItems = searchTerm.trim() ? filteredItems : boqItems;

  // Calculate totals for summary
  const calculateGrandTotal = (): number => {
    return boqItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateItemsCount = (): { total: number; parents: number; items: number } => {
    const countItems = (items: BOQItem[]): { total: number; parents: number; items: number } => {
      let total = 0;
      let parents = 0;
      let leafItems = 0;
      
      items.forEach(item => {
        total++;
        if (item.children && item.children.length > 0) {
          parents++;
          const childCounts = countItems(item.children);
          total += childCounts.total;
          parents += childCounts.parents;
          leafItems += childCounts.items;
        } else {
          leafItems++;
        }
      });
      
      return { total, parents, items: leafItems };
    };
    
    return countItems(boqItems);
  };

  const itemStats = calculateItemsCount();

  const renderBOQItem = (item: BOQItem, level: number = 0) => {
    const totalValue = calculateItemTotal(item);
    const isParent = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    
    return (
      <div key={item.id} className="animate-fade-in">
        <Card 
          className={`
            group relative mb-3 transition-all duration-200 hover:shadow-md
            ${level === 0 ? 'border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent' : ''}
            ${level === 1 ? 'ml-6 border-l-2 border-l-secondary bg-gradient-to-r from-secondary/5 to-transparent' : ''}
            ${level === 2 ? 'ml-12 border-l border-l-accent bg-gradient-to-r from-accent/5 to-transparent' : ''}
            ${level > 2 ? 'ml-16 border-l border-l-muted bg-gradient-to-r from-muted/10 to-transparent' : ''}
          `}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              {/* Left Section: Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  {isParent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(item.id)}
                      className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                      )}
                    </Button>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {isParent ? (
                      <Package className="h-5 w-5 text-primary" />
                    ) : (
                      <FileText className="h-5 w-5 text-secondary" />
                    )}
                    <Badge 
                      variant={isParent ? "default" : "secondary"}
                      className="font-mono text-xs px-2 py-1"
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {item.code}
                    </Badge>
                    {level > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Level {level}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className={`font-semibold leading-tight ${
                    level === 0 ? 'text-lg text-foreground' : 
                    level === 1 ? 'text-base text-foreground/90' : 
                    'text-sm text-foreground/80'
                  }`}>
                    {language === 'en' ? item.description : (item.descriptionAr || item.description)}
                  </h3>
                  
                  {item.descriptionAr && language === 'en' && (
                    <p className="text-sm text-muted-foreground font-arabic" dir="rtl">
                      {item.descriptionAr}
                    </p>
                  )}
                </div>

                {/* Specs Row */}
                {!isParent && (item.quantity > 0 || item.unit || item.unitRate > 0) && (
                  <div className="flex flex-wrap items-center gap-4 mt-4 p-3 bg-muted/30 rounded-lg">
                    {item.quantity > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calculator className="h-4 w-4 text-primary" />
                        <span className="font-medium">Qty:</span>
                        <span className="font-mono">{item.quantity.toLocaleString('en-US')}</span>
                      </div>
                    )}
                    
                    {item.unit && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Unit:</span>
                        <Badge variant="outline" className="text-xs">
                          {language === 'en' ? item.unit : (item.unitAr || item.unit)}
                        </Badge>
                      </div>
                    )}
                    
                    {item.unitRate > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="font-medium">Rate:</span>
                        <span className="font-mono font-semibold text-primary">
                          {formatter.format(item.unitRate)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Section: Value & Actions */}
              <div className="flex flex-col items-end gap-3 min-w-[200px]">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">Total Value</div>
                  <div className={`font-bold font-mono ${
                    totalValue > 1000000 ? 'text-xl text-primary' :
                    totalValue > 100000 ? 'text-lg text-primary' :
                    'text-base text-foreground'
                  }`}>
                    {formatter.format(totalValue)}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditItem(item)}
                    className="h-8 px-3 hover:bg-primary/10 hover:border-primary/20"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const nextCode = generateNextCode(item.code, item.children);
                      setNewItem({
                        code: nextCode,
                        description: '',
                        descriptionAr: '',
                        quantity: 0,
                        unit: '',
                        unitAr: '',
                        unitRate: 0,
                      });
                      setParentId(item.id);
                      setIsAddDialogOpen(true);
                    }}
                    className="h-8 px-3 hover:bg-secondary/10 hover:border-secondary/20"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Sub
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 px-3 hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive"
                      >
                        ×
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete BOQ Item</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete item "{item.code}" - {item.description}?
                          {isParent && " This will also delete all sub-items."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteItem(item.id, item.code)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children */}
        {isParent && isExpanded && item.children && (
          <div className="space-y-2 animate-fade-in">
            {item.children.map(child => renderBOQItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Bill of Quantities</h1>
                <p className="text-sm text-muted-foreground font-arabic" dir="rtl">قائمة الكميات</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
                className="h-8"
              >
                <Globe className="h-3 w-3 mr-1" />
                EN
              </Button>
              <Button
                variant={language === 'ar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('ar')}
                className="h-8"
              >
                <Globe className="h-3 w-3 mr-1" />
                عربي
              </Button>
            </div>
          </div>

          {/* Smart Search & Filter */}
          <div className="relative max-w-md w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder={language === 'en' ? "Search BOQ items by code or description..." : "البحث في بنود الكميات بالرقم أو الوصف..."}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                className="pl-10 pr-10 h-10 bg-background/80 backdrop-blur-sm transition-all duration-200 focus:bg-background border-muted-foreground/20 hover:border-muted-foreground/40 focus:border-primary"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Smart Suggestions */}
            {searchFocused && searchTerm && suggestions.length > 0 && (
              <Card className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg bg-popover animate-fade-in">
                <CardContent className="p-2">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                      <Filter className="h-3 w-3 inline mr-1" />
                      Quick Suggestions
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleSearchChange(suggestion);
                          setSearchFocused(false);
                        }}
                        className="w-full justify-start h-8 text-sm font-mono hover:bg-muted/50"
                      >
                        <Search className="h-3 w-3 mr-2 text-muted-foreground" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Results Counter */}
            {searchTerm && (
              <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground">
                {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'} found
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
            />
            
            <Button variant="outline" size="sm" onClick={expandAll} className="h-9">
              <Expand className="h-4 w-4 mr-2" />
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll} className="h-9">
              <Shrink className="h-4 w-4 mr-2" />
              Collapse All
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="outline" onClick={importFromExcel} className="h-9">
              <Upload className="h-4 w-4 mr-2" />
              Import Excel
            </Button>
            <Button variant="outline" onClick={exportToExcel} className="h-9">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="h-9">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {editingItem ? (
                      <>
                        <Edit className="h-5 w-5" />
                        Edit BOQ Item
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        Add BOQ Item
                      </>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem 
                      ? 'Update the BOQ item details below.'
                      : parentId 
                        ? 'Add a sub-item to the selected BOQ category.' 
                        : 'Create a new top-level BOQ item or category.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-sm font-medium">
                        Item Code
                      </Label>
                      <Input
                        id="code"
                        name="code"
                        value={newItem.code}
                        onChange={handleInputChange}
                        placeholder="e.g., 1.1.1"
                        className="font-mono"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description (English)
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={newItem.description}
                        onChange={handleInputChange}
                        placeholder="Enter item description in English"
                        className="min-h-[60px]"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="descriptionAr" className="text-sm font-medium">
                        Description (Arabic)
                      </Label>
                      <Textarea
                        id="descriptionAr"
                        name="descriptionAr"
                        value={newItem.descriptionAr || ''}
                        onChange={handleInputChange}
                        placeholder="أدخل وصف البند باللغة العربية"
                        className="min-h-[60px] font-arabic"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Quantity & Pricing (Leave empty for parent categories)
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-sm font-medium">
                          Quantity
                        </Label>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0"
                          value={newItem.quantity}
                          onChange={handleInputChange}
                          className="font-mono"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="unitRate" className="text-sm font-medium">
                          Unit Rate (SAR)
                        </Label>
                        <Input
                          id="unitRate"
                          name="unitRate"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={newItem.unitRate}
                          onChange={handleInputChange}
                          className="font-mono"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unit" className="text-sm font-medium">
                          Unit (English)
                        </Label>
                        <Input
                          id="unit"
                          name="unit"
                          placeholder="e.g., m, kg, pcs"
                          value={newItem.unit}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="unitAr" className="text-sm font-medium">
                          Unit (Arabic)
                        </Label>
                        <Input
                          id="unitAr"
                          name="unitAr"
                          placeholder="مثال: متر، كيلو، قطعة"
                          value={newItem.unitAr || ''}
                          onChange={handleInputChange}
                          className="font-arabic"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleAddItem}>
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Total Items</p>
                  <p className="text-2xl font-bold text-primary">{itemStats.total}</p>
                </div>
                <Package className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary">Categories</p>
                  <p className="text-2xl font-bold text-secondary">{itemStats.parents}</p>
                </div>
                <FileText className="h-8 w-8 text-secondary/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-accent">Line Items</p>
                  <p className="text-2xl font-bold text-accent">{itemStats.items}</p>
                </div>
                <Hash className="h-8 w-8 text-accent/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Grand Total</p>
                  <p className="text-xl font-bold text-primary font-mono">
                    {formatter.format(calculateGrandTotal())}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BOQ Items */}
      <div className="space-y-4">
        <ScrollArea className="h-[calc(100vh-400px)] pr-4">
          <div className="space-y-3">
            {displayItems.length > 0 ? (
              displayItems.map(item => renderBOQItem(item, 0))
            ) : searchTerm ? (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No Results Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    No BOQ items match your search criteria. Try different keywords or clear the search.
                  </p>
                  <Button variant="outline" onClick={clearSearch}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No BOQ Items</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by adding your first BOQ item or import from Excel
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default BOQ;
