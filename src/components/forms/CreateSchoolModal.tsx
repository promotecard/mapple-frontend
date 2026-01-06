
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SchoolCreationData, School, UserWithPassword } from '../../types';
import { Status, EmailTemplateType } from '../../types';
import { api, countries, citiesByCountry } from '../../services/mockApi';
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

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

export const CreateSchoolModal: React.FC<CreateSchoolModalProps> = ({
  isOpen,
  onClose,
  onSchoolCreated,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<SchoolCreationData>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<'form' | 'success'>('form');
  const [newData, setNewData] = useState<{ school: School; admin: UserWithPassword } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [emailPreviewContent, setEmailPreviewContent] = useState<{
    to: string;
    subject: string;
    body: string;
  } | null>(null);

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
  };

  const handleSendEmail = async () => {
    if (!newData) return;

    try {
      const templates = await api.getEmailTemplates();
      const credentialTemplate = templates.find(
        t => t.type === EmailTemplateType.NewSchoolCredentials
      );

      if (!credentialTemplate) {
        alert('Credential email template not found.');
        return;
      }

      let subject = credentialTemplate.subject;
      let body = credentialTemplate.body;

      const replacements: Record<string, string> = {
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
        subject,
        body,
      });
      setIsEmailPreviewOpen(true);
    } catch {
      alert('Failed to fetch email templates.');
    }
  };

  const renderForm = () => (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('Create New School')}
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={handleClose}>
            {t('Cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t('Creating...') : t('Create School')}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>School Name</Label>
            <Input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div>
            <Label>RNC / Tax ID</Label>
            <Input name="taxId" value={formData.taxId} onChange={handleChange} required />
          </div>

          <div>
            <Label>Country</Label>
            <Select name="country" value={formData.country} onChange={handleChange} required>
              <option value="">Select a country</option>
              {countries.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>City</Label>
            <Select
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!formData.country}
              required
            >
              <option value="">Select city</option>
              {(citiesByCountry[formData.country] || []).map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label>Address</Label>
            <Input name="address" value={formData.address} onChange={handleChange} required />
          </div>

          <div>
            <Label>Phone</Label>
            <Input name="phone" value={formData.phone} onChange={handleChange} required />
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div>
            <Label>Director Name</Label>
            <Input
              name="directorName"
              value={formData.directorName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select name="status" value={formData.status} onChange={handleChange}>
              <option value={Status.Pending}>Pending</option>
              <option value={Status.Active}>Active</option>
              <option value={Status.Suspended}>Suspended</option>
            </Select>
          </div>
        </div>
      </form>
    </Modal>
  );

  const renderSuccess = () => (
    <Modal isOpen={isOpen} onClose={handleClose} title="School Created" footer={<Button onClick={handleClose}>Finish</Button>}>
      <div className="space-y-4">
        <p>
          The school <strong>{newData?.school.name}</strong> was created successfully.
        </p>

        <div>
          <Label>Admin Email</Label>
          <p className="bg-gray-100 p-2 rounded">{newData?.admin.email}</p>
        </div>

        <div>
          <Label>Admin Password</Label>
          <input
            readOnly
            type={showPassword ? 'text' : 'password'}
            value={newData?.admin.password}
            className="w-full p-2 border rounded"
          />
          <Button variant="secondary" onClick={() => setShowPassword(p => !p)}>
            Toggle
          </Button>
        </div>

        <Button variant="secondary" onClick={handleSendEmail}>
          Send Credentials Email
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
          title="Email Preview"
          footer={<Button onClick={() => setIsEmailPreviewOpen(false)}>Close</Button>}
        >
          <div className="space-y-3">
            <p>
              <strong>To:</strong> {emailPreviewContent.to}
            </p>
            <p>
              <strong>Subject:</strong> {emailPreviewContent.subject}
            </p>
            <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap">
              {emailPreviewContent.body}
            </pre>
          </div>
        </Modal>
      )}
    </>
  );
};
