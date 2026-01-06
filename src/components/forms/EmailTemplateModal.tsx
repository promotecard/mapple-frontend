import React, { useState, useEffect } from "react";
import type { EmailTemplate } from "../../types";
import { EmailTemplateType } from "../../types";

import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate;
  onSave: (template: EmailTemplate) => void;
}

export const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
  onSave,
}) => {
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);

  useEffect(() => {
    setSubject(template.subject);
    setBody(template.body);
  }, [template]);

  const handleSave = () => {
    onSave({
      ...template,
      subject,
      body,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit email template">
      <div className="space-y-4">
        <div>
          <Label>Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>

        <div>
          <Label>Body</Label>
          <Textarea
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  );
};
