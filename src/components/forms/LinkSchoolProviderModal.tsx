import React, { useState, useEffect } from 'react';
import type { School, Provider } from '../../types';
import { api } from '../../services/mockApi';
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

interface LinkSchoolProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkCreated: () => void;
}

export const LinkSchoolProviderModal: React.FC<LinkSchoolProviderModalProps> = ({ isOpen, onClose, onLinkCreated }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const [schoolsData, providersData] = await Promise.all([
          api.getSchools(),
          api.getProviders()
        ]);
        setSchools(schoolsData);
        setProviders(providersData);
      };
      fetchData();
    }
  }, [isOpen]);

  const handleClose = () => {
    setSelectedSchoolId('');
    setSelectedProviderId('');
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedSchoolId || !selectedProviderId) {
      setError('Please select both a school and a provider.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await api.createLink(selectedSchoolId, selectedProviderId);
      onLinkCreated();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Link School and Provider"
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Linking...' : 'Create Link'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
        <div>
          <Label htmlFor="school">Select School</Label>
          <Select id="school" value={selectedSchoolId} onChange={(e) => setSelectedSchoolId(e.target.value)}>
            <option value="" disabled>-- Choose a school --</option>
            {schools.map(school => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="provider">Select Provider</Label>
          <Select id="provider" value={selectedProviderId} onChange={(e) => setSelectedProviderId(e.target.value)}>
            <option value="" disabled>-- Choose a provider --</option>
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>{provider.businessName}</option>
            ))}
          </Select>
        </div>
      </div>
    </Modal>
  );
};
