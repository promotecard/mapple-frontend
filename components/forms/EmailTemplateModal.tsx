
import React, { useState, useEffect } from 'react';
import type { EmailTemplate } from '../../types';
import { EmailTemplateType } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate;
  onSave: (template: EmailTemplate) => void;
}

const PLACEHOLDERS: { [key in EmailTemplateType]: string[] } = {
    [EmailTemplateType.NewSchoolCredentials]: [
        '{{schoolName}}',
        '{{adminName}}',
        '{{adminEmail}}',
        '{{adminPassword}}',
    ],
    [EmailTemplateType.NewProviderCredentials]: [
        '{{providerName}}',
        '{{contactName}}',
        '{{adminEmail}}',
        '{{adminPassword}}',
    ],
    [EmailTemplateType.NewParentCredentials]: [
        '{{parentName}}',
        '{{schoolName}}',
        '{{email}}',
        '{{password}}',
    ],
    [EmailTemplateType.ActivityCancellation]: [
        '{{activityName}}',
        '{{parentName}}',
        '{{studentName}}',
        '{{schoolName}}',
    ]
}

export const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({ isOpen, onClose, template, onSave }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  }, [template]);

  const handleSave = () => {
    onSave({ ...template, subject, body });
  };
  
  const availablePlaceholders = PLACEHOLDERS[template.type] || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Template: ${template.name}`}
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="subject">Email Subject</Label>
          <Input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="body">Email Body</Label>
          <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={10} />
        </div>
        <div>
            <Label>Available Placeholders</Label>
            <div className="flex flex-wrap gap-2">
                {availablePlaceholders.map(p => (
                    <code key={p} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{p}</code>
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">These placeholders will be automatically replaced with the correct information.</p>
        </div>
      </div>
    </Modal>
  );
};
