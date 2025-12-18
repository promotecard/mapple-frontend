import React, { useState, useEffect } from 'react';
import type { School } from '../../types';
import { Status } from '../../types';
import { api, countries, citiesByCountry } from '../../services/mockApi';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface EditSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchoolUpdated: () => void;
  school: School;
}

export const EditSchoolModal: React.FC<EditSchoolModalProps> = ({ isOpen, onClose, onSchoolUpdated, school }) => {
  const [formData, setFormData] = useState<School | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (school) {
      setFormData({ ...school });
    }
  }, [school]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    if (name === 'country') {
        setFormData(prev => prev ? { ...prev, country: value, city: '' } : null);
    } else {
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await api.updateSchool(formData);
      onSchoolUpdated();
      onClose();
    } catch (err) {
      setError('Failed to update school. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) return null;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit School: ${school.name}`}
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">School Name</Label>
            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="taxId">RNC / Tax ID</Label>
            <Input type="text" name="taxId" id="taxId" value={formData.taxId} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Select name="country" id="country" value={formData.country} onChange={handleChange} required>
                <option value="">Select a Country</option>
                {countries.map(country => <option key={country} value={country}>{country}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="city">City / Province</Label>
            <Select name="city" id="city" value={formData.city} onChange={handleChange} disabled={!formData.country} required>
                <option value="">{formData.country ? 'Select a City' : 'Select a Country first'}</option>
                {(citiesByCountry[formData.country] || []).map(city => <option key={city} value={city}>{city}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="directorName">Director's Name</Label>
            <Input type="text" name="directorName" id="directorName" value={formData.directorName} onChange={handleChange} required />
          </div>
           <div>
            <Label htmlFor="email">Official Email</Label>
            <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
          </div>
           <div>
            <Label htmlFor="phone">Contact Phone</Label>
            <Input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" id="status" value={formData.status} onChange={handleChange}>
              <option value={Status.Active}>Active</option>
              <option value={Status.Pending}>Pending</option>
              <option value={Status.Suspended}>Suspended</option>
            </Select>
          </div>
        </div>
      </form>
    </Modal>
  );
};