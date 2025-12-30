import React, { useState, useEffect } from 'react';
import type { Provider, FeeConfig } from '../../types';
import { PaymentMethod, Status } from '../../types';
import { api, countries, citiesByCountry } from '../../services/mockApi';
import { Modal } from "@/components/components/ui/Modal";
import { Input } from "@/components/components/ui/Input";
import { Label } from "@/components/components/ui/Label";
import { Button } from "@/components/components/ui/Button";
import { Select } from "@/components/components/ui/Select";

interface EditProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProviderUpdated: () => void;
  provider: Provider;
}

const defaultFeeConfig: FeeConfig = {
    percentage: 0,
    applyToSalesType: 'Both',
    applyToPaymentMethods: [],
};

export const EditProviderModal: React.FC<EditProviderModalProps> = ({ isOpen, onClose, onProviderUpdated, provider }) => {
  const [formData, setFormData] = useState<Provider | null>(null);
  const [useCustomFee, setUseCustomFee] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (provider) {
      setFormData({
        ...provider,
        feeConfig: provider.feeConfig || defaultFeeConfig,
      });
      setUseCustomFee(!!provider.feeConfig);
    }
  }, [provider]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
     if (name === 'country') {
        setFormData(prev => prev ? { ...prev, country: value, city: '' } : null);
    } else {
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    }
  };
  
  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!formData) return;
      const { name, value, type } = e.target;
      if (type === 'number') {
          setFormData(prev => prev ? { ...prev, feeConfig: { ...prev.feeConfig!, [name]: parseFloat(value) || 0 } } : null);
      } else {
          setFormData(prev => prev ? { ...prev, feeConfig: { ...prev.feeConfig!, [name]: value } } : null);
      }
  };

  const handleFeePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData || !formData.feeConfig) return;
    const method = e.target.value as PaymentMethod;
    const currentMethods = formData.feeConfig.applyToPaymentMethods;
    let newMethods: PaymentMethod[];
    if (e.target.checked) {
      newMethods = [...currentMethods, method];
    } else {
      newMethods = currentMethods.filter(m => m !== method);
    }
    setFormData(prev => prev ? { ...prev, feeConfig: { ...prev.feeConfig!, applyToPaymentMethods: newMethods } } : null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSubmitting(true);
    setError(null);

    const finalData = {
        ...formData,
        feeConfig: useCustomFee ? formData.feeConfig : null
    };

    try {
      await api.updateProvider(finalData);
      onProviderUpdated();
      onClose();
    } catch (err) {
      setError('Failed to update provider. Please try again.');
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
      title={`Edit Provider: ${provider.businessName}`}
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input type="text" name="businessName" id="businessName" value={formData.businessName} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="taxId">RNC / Tax ID</Label>
            <Input type="text" name="taxId" id="taxId" value={formData.taxId} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Select name="country" id="country" value={formData.country} onChange={handleChange} required>
                <option value="">Select a Country</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
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
            <Label htmlFor="contactName">Contact's Name</Label>
            <Input type="text" name="contactName" id="contactName" value={formData.contactName} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Official Email</Label>
            <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" id="status" value={formData.status} onChange={handleChange}>
              <option value={Status.Active}>Active</option>
              <option value={Status.Pending}>Pending</option>
              <option value={Status.Suspended}>Suspended</option>
            </Select>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
             <h4 className="text-lg font-medium text-gray-800 mb-4">Sales Fee Configuration</h4>
             <div className="flex items-center mb-4">
                <input 
                    type="checkbox"
                    id="useCustomFee"
                    checked={useCustomFee}
                    onChange={(e) => setUseCustomFee(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="useCustomFee" className="ml-2 mb-0">Set custom fee for this provider (overrides default)</Label>
             </div>

             {useCustomFee && (
                 <div className="space-y-4 p-4 border rounded-md bg-gray-50">
                    <div>
                        <Label htmlFor="percentage">Fee Percentage (%)</Label>
                        <Input id="percentage" name="percentage" type="number" value={formData.feeConfig?.percentage} onChange={handleFeeChange} step="0.1" min="0" max="100"/>
                    </div>
                    <div>
                        <Label>Apply to Sales Type</Label>
                        <div className="flex space-x-4 mt-1">
                            <label className="inline-flex items-center"><input type="radio" name="applyToSalesType" value="POS" checked={formData.feeConfig?.applyToSalesType === 'POS'} onChange={handleFeeChange} className="form-radio" /> <span className="ml-2">POS</span></label>
                            <label className="inline-flex items-center"><input type="radio" name="applyToSalesType" value="Online" checked={formData.feeConfig?.applyToSalesType === 'Online'} onChange={handleFeeChange} className="form-radio" /> <span className="ml-2">Online</span></label>
                            <label className="inline-flex items-center"><input type="radio" name="applyToSalesType" value="Both" checked={formData.feeConfig?.applyToSalesType === 'Both'} onChange={handleFeeChange} className="form-radio" /> <span className="ml-2">Both</span></label>
                        </div>
                    </div>
                    <div>
                         <Label>Apply to Payment Methods</Label>
                         <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                            {Object.values(PaymentMethod).map(method => (
                                 <label key={method} className="inline-flex items-center">
                                    <input 
                                        type="checkbox" 
                                        value={method} 
                                        checked={formData.feeConfig?.applyToPaymentMethods.includes(method)} 
                                        onChange={handleFeePaymentMethodChange}
                                        className="form-checkbox"
                                    />
                                    {/* FIX: Cast method to string to use replace method and fix type error. */}
                                    <span className="ml-2">{(method as string).replace(/([A-Z])/g, ' $1').trim()}</span>
                                </label>
                            ))}
                         </div>
                    </div>
                 </div>
             )}

        </div>

      </form>
    </Modal>
  );
};
