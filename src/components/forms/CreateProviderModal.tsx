import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { ProviderCreationData, Provider, UserWithPassword, School } from '../../types'
import { Status, EmailTemplateType, SalesType } from '../../types'
import { api, countries, citiesByCountry } from '../../services/mockApi'

import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface CreateProviderModalProps {
  isOpen: boolean
  onClose: () => void
  onProviderCreated: () => void
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
  salesType: SalesType.Online,
  status: Status.Pending,
}

export const CreateProviderModal: React.FC<CreateProviderModalProps> = ({
  isOpen,
  onClose,
  onProviderCreated,
}) => {
  const { t } = useTranslation()

  const [formData, setFormData] = useState<ProviderCreationData>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [view, setView] = useState<'form' | 'success'>('form')
  const [newData, setNewData] = useState<{ provider: Provider; admin: UserWithPassword } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false)
  const [emailPreviewContent, setEmailPreviewContent] = useState<{
    to: string
    subject: string
    body: string
  } | null>(null)

  const [schools, setSchools] = useState<School[]>([])

  useEffect(() => {
    if (isOpen) {
      api.getSchools().then(setSchools)
    }
  }, [isOpen])

  const handleSchoolPrefill = (schoolId: string) => {
    if (!schoolId) {
      setFormData(initialState)
      return
    }

    const selectedSchool = schools.find(s => s.id === schoolId)
    if (!selectedSchool) return

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
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === 'country') {
      setFormData(prev => ({ ...prev, country: value, city: '' }))
      return
    }

    if (name === 'salesType') {
      setFormData(prev => ({ ...prev, salesType: value as SalesType }))
      return
    }

    if (name === 'status') {
      setFormData(prev => ({ ...prev, status: value as Status }))
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { provider, admin } = await api.createProvider(formData)
      onProviderCreated()
      setNewData({ provider, admin })
      setView('success')
    } catch (err) {
      console.error(err)
      setError(t('errors.createProvider'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData(initialState)
    setError(null)
    setView('form')
    setNewData(null)
    setShowPassword(false)
    setIsEmailPreviewOpen(false)
    setEmailPreviewContent(null)
    onClose()
  }

  const handleSendEmail = async () => {
    if (!newData) return

    try {
      const templates = await api.getEmailTemplates()
      const credentialTemplate = templates.find(
        t => t.type === EmailTemplateType.NewProviderCredentials
      )

      if (!credentialTemplate) {
        setError(t('errors.emailTemplateMissing'))
        return
      }

      let subject = credentialTemplate.subject
      let body = credentialTemplate.body

      const replacements: Record<string, string> = {
        '{{providerName}}': newData.provider.businessName,
        '{{contactName}}': newData.admin.name,
        '{{adminEmail}}': newData.admin.email,
        '{{adminPassword}}': newData.admin.password || '',
      }

      Object.entries(replacements).forEach(([key, value]) => {
        subject = subject.replace(new RegExp(key, 'g'), value)
        body = body.replace(new RegExp(key, 'g'), value)
      })

      setEmailPreviewContent({
        to: newData.provider.email,
        subject,
        body,
      })

      setIsEmailPreviewOpen(true)
    } catch {
      setError(t('errors.emailTemplateFetch'))
    }
  }

  const renderForm = () => (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('provider.create.title')}
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t('common.creating') : t('provider.create.submit')}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600 text-sm bg-red-100 p-3 rounded">{error}</div>}

        <div className="p-3 bg-blue-50 border rounded">
          <Label>{t('provider.prefillFromSchool')}</Label>
          <Select onChange={e => handleSchoolPrefill(e.target.value)}>
            <option value="">{t('common.select')}</option>
            {schools.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <InputField label={t('provider.businessName')} name="businessName" value={formData.businessName} onChange={handleChange} />
        <InputField label={t('provider.taxId')} name="taxId" value={formData.taxId} onChange={handleChange} />
        <InputField label={t('provider.email')} name="email" type="email" value={formData.email} onChange={handleChange} />
        <InputField label={t('provider.contactName')} name="contactName" value={formData.contactName} onChange={handleChange} />
      </form>
    </Modal>
  )

  const renderSuccess = () => (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('provider.success.title')}>
      <p className="text-center">{t('provider.success.message')}</p>

      <div className="mt-4 space-y-2">
        <Label>{t('provider.adminEmail')}</Label>
        <p>{newData?.admin.email}</p>

        <Label>{t('provider.adminPassword')}</Label>
        <input
          type={showPassword ? 'text' : 'password'}
          readOnly
          value={newData?.admin.password}
          className="w-full border p-2 rounded"
        />
        <Button variant="secondary" onClick={() => setShowPassword(p => !p)}>
          {showPassword ? t('common.hide') : t('common.show')}
        </Button>
      </div>

      <div className="mt-6 flex justify-center">
        <Button onClick={handleSendEmail}>{t('provider.sendCredentials')}</Button>
      </div>
    </Modal>
  )

  return (
    <>
      {view === 'form' ? renderForm() : renderSuccess()}
      {emailPreviewContent && (
        <Modal
          isOpen={isEmailPreviewOpen}
          onClose={() => setIsEmailPreviewOpen(false)}
          title={t('email.preview.title')}
        >
          <pre className="whitespace-pre-wrap">{emailPreviewContent.body}</pre>
        </Modal>
      )}
    </>
  )
}

const InputField = ({
  label,
  ...props
}: {
  label: string
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <Label>{label}</Label>
    <Input {...props} />
  </div>
)
