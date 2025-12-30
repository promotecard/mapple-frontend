
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ParentCreationData, UserWithPassword } from '../../types'
import { EmailTemplateType } from '../../types'
import { api } from '../../services/mockApi'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

interface ParentModalProps {
  isOpen: boolean
  onClose: () => void
  onParentCreated: () => void
}

const initialState: ParentCreationData = {
  name: '',
  email: '',
  phone: '',
}

export const ParentModal: React.FC<ParentModalProps> = ({
  isOpen,
  onClose,
  onParentCreated,
}) => {
  const { t } = useTranslation()
  const { currentUser } = useAuth()

  const [formData, setFormData] = useState<ParentCreationData>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [view, setView] = useState<'form' | 'success'>('form')
  const [newParent, setNewParent] = useState<UserWithPassword | null>(null)

  const [emailPreview, setEmailPreview] = useState<{
    to: string
    subject: string
    body: string
  } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser?.schoolId) {
      setError(t('errors.missingSchoolContext'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { newUser } = await api.createParent({
        ...formData,
        schoolId: currentUser.schoolId,
      })

      setNewParent(newUser)
      setView('success')
      onParentCreated()
    } catch (err) {
      console.error(err)
      setError(t('errors.createParent'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendEmail = async () => {
    if (!newParent) return

    try {
      const templates = await api.getEmailTemplates()
      const template = templates.find(
        t => t.type === EmailTemplateType.NewParentCredentials
      )

      if (!template) {
        setError(t('errors.emailTemplateMissing'))
        return
      }

      let subject = template.subject
      let body = template.body

      const replacements = {
        '{{parentName}}': newParent.name,
        '{{parentEmail}}': newParent.email,
        '{{parentPassword}}': newParent.password || '',
      }

      Object.entries(replacements).forEach(([key, value]) => {
        subject = subject.replace(new RegExp(key, 'g'), value)
        body = body.replace(new RegExp(key, 'g'), value)
      })

      setEmailPreview({
        to: newParent.email,
        subject,
        body,
      })
    } catch {
      setError(t('errors.emailTemplateFetch'))
    }
  }

  const handleClose = () => {
    setFormData(initialState)
    setError(null)
    setView('form')
    setNewParent(null)
    setEmailPreview(null)
    onClose()
  }

  /* ---------- FORM ---------- */

  const renderForm = () => (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('parent.create.title')}
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t('common.creating') : t('parent.create.submit')}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-600 bg-red-100 p-3 rounded">
            {error}
          </div>
        )}

        <div>
          <Label>{t('parent.name')}</Label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label>{t('parent.email')}</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label>{t('parent.phone')}</Label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
      </form>
    </Modal>
  )

  /* ---------- SUCCESS ---------- */

  const renderSuccess = () => (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('parent.success.title')}
    >
      <p className="text-center mb-4">
        {t('parent.success.message')}
      </p>

      <div className="space-y-2">
        <Label>{t('parent.email')}</Label>
        <p>{newParent?.email}</p>

        <Label>{t('parent.password')}</Label>
        <p className="font-mono bg-gray-100 p-2 rounded">
          {newParent?.password}
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <Button onClick={handleSendEmail}>
          {t('parent.sendCredentials')}
        </Button>
      </div>
    </Modal>
  )

  return (
    <>
      {view === 'form' ? renderForm() : renderSuccess()}

      {emailPreview && (
        <Modal
          isOpen={true}
          onClose={() => setEmailPreview(null)}
          title={t('email.preview.title')}
        >
          <p>
            <strong>{t('email.to')}:</strong> {emailPreview.to}
          </p>
          <p>
            <strong>{t('email.subject')}:</strong> {emailPreview.subject}
          </p>
          <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded mt-3">
            {emailPreview.body}
          </pre>
        </Modal>
      )}
    </>
  )
}

