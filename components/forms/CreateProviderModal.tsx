import React, { useState, useEffect } from 'react';
import type { ProviderCreationData, Provider, UserWithPassword, School } from '../../types';
import { Status, EmailTemplateType, SalesType } from '../../types';
import { api, countries, citiesByCountry } from '../../services/mockApi';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface CreateProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProviderCreated: () => void;
}

const initialState: ProviderCreationData = {
  businessName: '',
  taxId: '',
  address: '',
  country: '',
  city: '',
  phone: '',
  email: '',
  contactName: '',
// FIX: Use SalesType enum member instead of a string literal.
  salesType: SalesType.Online,
  status: Status.Pending,
};

export const CreateProviderModal: React.FC<CreateProviderModalProps> = ({ isOpen, onClose, onProviderCreated }) => {
  const [formData, setFormData] = useState<ProviderCreationData>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [view, setView] = useState<'form' | 'success'>('form');
  const [newData, setNewData] = useState<{ provider: Provider, admin: UserWithPassword } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [emailPreviewContent, setEmailPreviewContent] = useState<{ to: string, subject: string, body: string } | null>(null);
  
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
      if(isOpen) {
          api.getSchools().then(setSchools);
      }
  }, [isOpen]);

  const handleSchoolPrefill = (schoolId: string) => {
    if (!schoolId) {
        setFormData(initialState);
        return;
    }
    const selectedSchool = schools.find(s => s.id === schoolId);
    if (selectedSchool) {
        setFormData({
            ...initialState,
            businessName: selectedSchool.name,
            taxId: selectedSchool.taxId,
            address: selectedSchool.address,
            country: selectedSchool.country,
            city: selectedSchool.city,
            phone: selectedSchool.phone,
            email: selectedSchool.email,
            contactName: selectedSchool.directorName,
        });
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'country') {
        setFormData(prev => ({ ...prev, country: value, city: '' }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value as SalesType | Status | string }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const { provider, admin } = await api.createProvider(formData);
      onProviderCreated();
      setNewData({ provider, admin });
      setView('success');
    } catch (err) {
      setError('Failed to create provider. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
      setFormData(initialState);
      setError(null);
      setView('form');
      setNewData(null);
      setShowPassword(false);
      setIsEmailPreviewOpen(false);
      setEmailPreviewContent(null);
      onClose();
  }
  
  const handleSendEmail = async () => {
      if(!newData) return;
      
      try {
        const templates = await api.getEmailTemplates();
        const credentialTemplate = templates.find(t => t.type === EmailTemplateType.NewProviderCredentials);
        
        if (credentialTemplate) {
            let subject = credentialTemplate.subject;
            let body = credentialTemplate.body;

            const replacements = {
                '{{providerName}}': newData.provider.businessName,
                '{{contactName}}': newData.admin.name,
                '{{adminEmail}}': newData.admin.email,
                '{{adminPassword}}': newData.admin.password || '',
            };

            Object.entries(replacements).forEach(([key, value]) => {
                subject = subject.replace(new RegExp(key, 'g'), value);
                body = body.replace(new RegExp(key, 'g'), value);
            });
            
            setEmailPreviewContent({
                to: newData.provider.email,
                subject: subject,
                body: body,
            });
            setIsEmailPreviewOpen(true);
        } else {
            alert("Credential email template not found.");
        }
      } catch (error) {
          alert("Failed to fetch email templates.");
      }
  }

  const renderForm = () => (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Provider"
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Provider'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
        
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <Label htmlFor="school-prefill">Optional: Create from Existing School</Label>
            <Select id="school-prefill" onChange={(e) => handleSchoolPrefill(e.target.value)}>
                <option value="">-- Select a school to pre-fill data --</option>
                {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                ))}
            </Select>
        </div>

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
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="phone">Contact Phone</Label>
            <Input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Official Email (used as username)</Label>
            <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="contactName">Contact's Name</Label>
            <Input type="text" name="contactName" id="contactName" value={formData.contactName} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" id="status" value={formData.status} onChange={handleChange}>
              <option value={Status.Pending}>Pending</option>
              <option value={Status.Active}>Active</option>
              <option value={Status.Suspended}>Suspended</option>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Sales Type</Label>
            <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center">
                    <input type="radio" name="salesType" value="POS" checked={formData.salesType === 'POS'} onChange={handleChange} className="form-radio h-4 w-4 text-blue-600"/>
                    <span className="ml-2 text-sm text-gray-700">Point of Sale (POS) Only</span>
                </label>
                 <label className="flex items-center">
                    <input type="radio" name="salesType" value="Online" checked={formData.salesType === 'Online'} onChange={handleChange} className="form-radio h-4 w-4 text-blue-600"/>
                    <span className="ml-2 text-sm text-gray-700">Online Sales Only</span>
                </label>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );

  const renderSuccess = () => (
     <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Provider Created Successfully"
        footer={<Button onClick={handleClose}>Finish</Button>}
    >
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="mt-3 text-lg leading-6 font-medium text-gray-900">Success!</h3>
            <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                    The provider "{newData?.provider.businessName}" and its administrator account have been created.
                </p>
            </div>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-gray-800">New Provider & Admin Info</h4>
            <div>
                <Label>Provider ID (Internal)</Label>
                <p className="text-sm text-gray-700 p-2 bg-white rounded-md font-mono">{newData?.provider.id}</p>
            </div>
            <div>
                <Label>Admin Email / Username</Label>
                <p className="text-sm text-gray-700 p-2 bg-white rounded-md">{newData?.admin.email}</p>
            </div>
            <div>
                <Label>Admin Password</Label>
                <div className="flex items-center space-x-2">
                    <input 
                        type={showPassword ? 'text' : 'password'}
                        readOnly
                        value={newData?.admin.password}
                        className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white font-mono"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="p-2 text-gray-500 hover:text-gray-700">
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                </div>
            </div>
        </div>
        
        <div className="mt-6 flex justify-center space-x-4">
            <Button variant="secondary" onClick={handleSendEmail}>
                <MailIcon />
                <span className="ml-2">Send Credentials via Email</span>
            </Button>
        </div>
    </Modal>
  );

  return (
    <>
        {view === 'form' ? renderForm() : renderSuccess()}
        {emailPreviewContent && (
            <Modal
                isOpen={isEmailPreviewOpen}
                onClose={() => setIsEmailPreviewOpen(false)}
                title="Email Preview & Confirmation"
                footer={<Button onClick={() => setIsEmailPreviewOpen(false)}>Close</Button>}
            >
                <div className="space-y-4">
                    <div className="flex items-center p-3 bg-green-100 border border-green-200 rounded-md">
                        <svg className="h-6 w-6 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <p className="text-sm font-medium text-green-800">For demonstration purposes, this email has been generated and displayed here instead of being sent.</p>
                    </div>
                    <div>
                        <Label>To:</Label>
                        <p className="text-sm p-2 bg-gray-100 rounded-md">{emailPreviewContent.to}</p>
                    </div>
                    <div>
                        <Label>Subject:</Label>
                        <p className="text-sm p-2 bg-gray-100 rounded-md">{emailPreviewContent.subject}</p>
                    </div>
                    <div>
                        <Label>Body:</Label>
                        <pre className="text-sm p-4 bg-gray-100 rounded-md whitespace-pre-wrap font-sans">
                            {emailPreviewContent.body}
                        </pre>
                    </div>
                </div>
            </Modal>
        )}
    </>
  );
};


const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;