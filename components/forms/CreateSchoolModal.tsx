import React, { useState } from 'react';
import type { SchoolCreationData, School, UserWithPassword } from '../../types';
import { Status, EmailTemplateType } from '../../types';
import { api, countries, citiesByCountry } from '../../services/mockApi';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface CreateSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchoolCreated: () => void;
}

const initialState: SchoolCreationData = {
  name: '',
  taxId: '',
  address: '',
  country: '',
  city: '',
  phone: '',
  email: '',
  directorName: '',
  status: Status.Pending,
};

export const CreateSchoolModal: React.FC<CreateSchoolModalProps> = ({ isOpen, onClose, onSchoolCreated }) => {
  const [formData, setFormData] = useState<SchoolCreationData>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [view, setView] = useState<'form' | 'success'>('form');
  const [newData, setNewData] = useState<{ school: School, admin: UserWithPassword } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [emailPreviewContent, setEmailPreviewContent] = useState<{ to: string, subject: string, body: string } | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'country') {
        setFormData(prev => ({ ...prev, country: value, city: '' }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const { school, admin } = await api.createSchool(formData);
      onSchoolCreated();
      setNewData({ school, admin });
      setView('success');
    } catch (err) {
      setError('Failed to create school. Please try again.');
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
        const credentialTemplate = templates.find(t => t.type === EmailTemplateType.NewSchoolCredentials);
        
        if (credentialTemplate) {
            let subject = credentialTemplate.subject;
            let body = credentialTemplate.body;

            const replacements = {
                '{{adminName}}': newData.admin.name,
                '{{schoolName}}': newData.school.name,
                '{{adminEmail}}': newData.admin.email,
                '{{adminPassword}}': newData.admin.password || '',
            };

            Object.entries(replacements).forEach(([key, value]) => {
                subject = subject.replace(new RegExp(key, 'g'), value);
                body = body.replace(new RegExp(key, 'g'), value);
            });
            
            setEmailPreviewContent({
                to: newData.school.email,
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
      title="Create New School"
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create School'}
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
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="phone">Contact Phone</Label>
            <Input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Official Email</Label>
            <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="directorName">Director's Name</Label>
            <Input type="text" name="directorName" id="directorName" value={formData.directorName} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" id="status" value={formData.status} onChange={handleChange}>
              <option value={Status.Pending}>Pending</option>
              <option value={Status.Active}>Active</option>
              <option value={Status.Suspended}>Suspended</option>
              <option value={Status.Deleted}>Deleted</option>
            </Select>
          </div>
        </div>
      </form>
    </Modal>
  );

  const renderSuccess = () => (
     <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="School Created Successfully"
        footer={<Button onClick={handleClose}>Finish</Button>}
    >
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="mt-3 text-lg leading-6 font-medium text-gray-900">Success!</h3>
            <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                    The school "{newData?.school.name}" and its administrator account have been created.
                </p>
            </div>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-gray-800">New School & Admin Info</h4>
            <div>
                <Label>School ID (Internal)</Label>
                <p className="text-sm text-gray-700 p-2 bg-white rounded-md font-mono">{newData?.school.id}</p>
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