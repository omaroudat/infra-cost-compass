
import { useState } from 'react';
import { Contractor, Engineer } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';

export const useStaffManagement = () => {
  const { 
    contractors, 
    engineers, 
    addContractor, 
    updateContractor, 
    deleteContractor,
    addEngineer,
    updateEngineer,
    deleteEngineer
  } = useAppContext();
  
  const [isContractorDialogOpen, setIsContractorDialogOpen] = useState(false);
  const [isEngineerDialogOpen, setIsEngineerDialogOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<string | null>(null);
  const [editingEngineer, setEditingEngineer] = useState<string | null>(null);
  
  const [newContractor, setNewContractor] = useState<Partial<Contractor>>({
    name: '',
    company: '',
    email: '',
    phone: ''
  });
  
  const [newEngineer, setNewEngineer] = useState<Partial<Engineer>>({
    name: '',
    department: '',
    email: '',
    phone: '',
    specialization: ''
  });

  // Contractor handlers
  const handleAddContractor = () => {
    if (!newContractor.name?.trim()) {
      toast.error('Please enter contractor name');
      return;
    }

    if (editingContractor) {
      updateContractor(editingContractor, newContractor);
      toast.success('Contractor updated successfully');
    } else {
      addContractor(newContractor as Omit<Contractor, 'id' | 'createdAt'>);
      toast.success('Contractor added successfully');
    }
    
    handleCancelContractor();
  };

  const handleEditContractor = (contractor: Contractor) => {
    setNewContractor({
      name: contractor.name,
      company: contractor.company || '',
      email: contractor.email || '',
      phone: contractor.phone || ''
    });
    setEditingContractor(contractor.id);
    setIsContractorDialogOpen(true);
  };

  const handleDeleteContractor = (id: string) => {
    deleteContractor(id);
    toast.success('Contractor deleted successfully');
  };

  const handleCancelContractor = () => {
    setIsContractorDialogOpen(false);
    setEditingContractor(null);
    setNewContractor({
      name: '',
      company: '',
      email: '',
      phone: ''
    });
  };

  // Engineer handlers
  const handleAddEngineer = () => {
    if (!newEngineer.name?.trim()) {
      toast.error('Please enter engineer name');
      return;
    }

    if (editingEngineer) {
      updateEngineer(editingEngineer, newEngineer);
      toast.success('Engineer updated successfully');
    } else {
      addEngineer(newEngineer as Omit<Engineer, 'id' | 'createdAt'>);
      toast.success('Engineer added successfully');
    }
    
    handleCancelEngineer();
  };

  const handleEditEngineer = (engineer: Engineer) => {
    setNewEngineer({
      name: engineer.name,
      department: engineer.department || '',
      email: engineer.email || '',
      phone: engineer.phone || '',
      specialization: engineer.specialization || ''
    });
    setEditingEngineer(engineer.id);
    setIsEngineerDialogOpen(true);
  };

  const handleDeleteEngineer = (id: string) => {
    deleteEngineer(id);
    toast.success('Engineer deleted successfully');
  };

  const handleCancelEngineer = () => {
    setIsEngineerDialogOpen(false);
    setEditingEngineer(null);
    setNewEngineer({
      name: '',
      department: '',
      email: '',
      phone: '',
      specialization: ''
    });
  };

  return {
    contractors,
    engineers,
    isContractorDialogOpen,
    setIsContractorDialogOpen,
    isEngineerDialogOpen,
    setIsEngineerDialogOpen,
    editingContractor,
    editingEngineer,
    newContractor,
    setNewContractor,
    newEngineer,
    setNewEngineer,
    handleAddContractor,
    handleEditContractor,
    handleDeleteContractor,
    handleCancelContractor,
    handleAddEngineer,
    handleEditEngineer,
    handleDeleteEngineer,
    handleCancelEngineer
  };
};
