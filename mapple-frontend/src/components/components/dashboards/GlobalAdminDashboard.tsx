import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

/* UI */
import { Card, CardContent, CardHeader } from "@/components/components/ui/Card";
import { Button } from "@/components/components/ui/Button";
import { Badge } from "@/components/components/ui/Badge";
import { Input } from "@/components/components/ui/Input";
import { Label } from "@/components/components/ui/Label";
import { Select } from "@/components/components/ui/Select";

/* Modals */
import { CreateSchoolModal } from "@/components/forms/CreateSchoolModal";
import { EmailTemplateModal } from "@/components/forms/EmailTemplateModal";
import { CreateProviderModal } from "@/components/forms/CreateProviderModal";
import { LinkSchoolProviderModal } from "@/components/forms/LinkSchoolProviderModal";
import { EditProviderModal } from "@/components/forms/EditProviderModal";
import { EditSchoolModal } from "@/components/forms/EditSchoolModal";

/* Views */
import { LandingPageEditorView } from "@/components/components/dashboards/global/LandingPageEditorView";

/* Services */
import { api } from "@/services/mockApi";

/* Types */
import type {
  School,
  Provider,
  EmailTemplate,
  SchoolProviderLink,
  FeeConfig,
  SubscriptionPlan,
  Feature,
  User,
} from "@/types";
import {
  Role,
  Status,
  PaymentMethod,
  SubscriptionPlanName,
} from "@/types";

/* Context */
import { useAppContext } from "@/context/AppContext";

// Icons
const SchoolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ProviderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;


const statusColorMap: { [key in Status]?: 'green' | 'yellow' | 'red' | 'gray' } = {
    [Status.Active]: 'green',
    [Status.Pending]: 'yellow',
    [Status.Suspended]: 'red',
    [Status.Deleted]: 'gray',
};

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <Card>
        <CardContent className="flex items-center gap-4">
            <div className={`p-4 rounded-lg ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-text-secondary">{title}</p>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
            </div>
        </CardContent>
    </Card>
);

const DashboardHome: React.FC<{ schools: School[], providers: Provider[] }> = ({ schools, providers }) => {
    const { t } = useTranslation();
    return (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title={t('globalAdmin.metrics.totalSchools')} value={schools.length} icon={<SchoolIcon />} color="bg-primary-light text-primary" />
            <MetricCard title={t('globalAdmin.metrics.activeSchools')} value={schools.filter(s => s.status === Status.Active).length} icon={<CheckCircleIcon />} color="bg-accent-green/20 text-accent-green" />
            <MetricCard title={t('globalAdmin.metrics.pendingSchools')} value={schools.filter(s => s.status === Status.Pending).length} icon={<ClockIcon />} color="bg-accent-yellow/20 text-accent-yellow" />
            <MetricCard title={t('globalAdmin.metrics.totalProviders')} value={providers.length} icon={<ProviderIcon />} color="bg-accent-purple/20 text-accent-purple" />
        </div>
        <Card className="mt-8">
            <CardHeader>
                <h2 className="text-xl font-semibold text-gray-800">{t('globalAdmin.welcomeMessage')}</h2>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600">
                    {t('globalAdmin.welcomeSub')}
                </p>
            </CardContent>
        </Card>
    </>
)};

const UserManagementView: React.FC = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [schools, setSchools] = useState<Map<string, string>>(new Map());
    const [providers, setProviders] = useState<Map<string, string>>(new Map());
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [usersData, schoolsData, providersData] = await Promise.all([
            api.getUsers(),
            api.getSchools(),
            api.getProviders()
        ]);
        
        setUsers(usersData);
        setSchools(new Map(schoolsData.map(s => [s.id, s.name])));
        setProviders(new Map(providersData.map(p => [p.id, p.businessName])));
        setFilteredUsers(usersData);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        let result = users;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(u => 
                u.name.toLowerCase().includes(term) || 
                u.email.toLowerCase().includes(term)
            );
        }

        if (roleFilter) {
            result = result.filter(u => u.role === roleFilter);
        }

        setFilteredUsers(result);
    }, [users, searchTerm, roleFilter]);

    const handleImpersonate = (userId: string, userName: string) => {
        if (window.confirm(t('common.impersonate') + ` ${userName}?`)) {
            const url = new URL(window.location.href);
            url.search = ''; // Clear existing params
            url.searchParams.set('impersonate', userId);
            window.open(url.toString(), '_blank');
        }
    };

    const getEntityName = (user: User) => {
        if (user.schoolId) return schools.get(user.schoolId) || 'School ID: ' + user.schoolId;
        if (user.providerId) return providers.get(user.providerId) || 'Provider ID: ' + user.providerId;
        return '-';
    };

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-semibold text-gray-800">{t('globalAdmin.users.title')}</h2>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4 pb-4 border-b border-gray-200">
                    <Input
                        placeholder={t('globalAdmin.users.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow"
                    />
                    <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="md:w-48">
                        <option value="">{t('globalAdmin.users.allRoles')}</option>
                        {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                    </Select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.users.table.user')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.users.table.role')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.users.table.entity')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan={4} className="text-center py-4">{t('common.loading')}</td></tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getEntityName(user)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button size="sm" onClick={() => handleImpersonate(user.id, user.name)}>
                                                {t('common.impersonate')}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center py-4">{t('common.noData')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

const SchoolManagementView: React.FC<{ users: User[], allSchools: School[] }> = ({ users, allSchools }) => {
    const { t } = useTranslation();
    const [schools, setSchools] = useState<School[]>([]);
    const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingSchool, setEditingSchool] = useState<School | null>(null);
    const [suspendingId, setSuspendingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    const fetchSchools = useCallback(async () => {
        const schoolsData = await api.getSchools();
        setSchools(schoolsData);
    }, []);

    useEffect(() => {
        fetchSchools();
    }, [fetchSchools]);

    useEffect(() => {
        let result = schools;

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            result = result.filter(school =>
                school.name.toLowerCase().includes(lowercasedTerm) ||
                school.directorName.toLowerCase().includes(lowercasedTerm) ||
                school.city.toLowerCase().includes(lowercasedTerm) ||
                school.country.toLowerCase().includes(lowercasedTerm)
            );
        }

        if (statusFilter) {
            result = result.filter(school => school.status === statusFilter);
        }

        if (cityFilter) {
            result = result.filter(school => school.city === cityFilter);
        }

        setFilteredSchools(result);
    }, [searchTerm, statusFilter, cityFilter, schools]);


    const handleEdit = (school: School) => {
        setEditingSchool(school);
    };

    const handleSuspend = async (schoolId: string) => {
        if (window.confirm('Are you sure you want to suspend this school?')) {
            setSuspendingId(schoolId);
            try {
                await api.suspendSchool(schoolId);
                fetchSchools();
            } catch (error) {
                console.error("Failed to suspend school", error);
                alert("Failed to suspend school. Please try again.");
            } finally {
                setSuspendingId(null);
            }
        }
    };

    const handleImpersonate = async (schoolId: string) => {
        const admin = users.find(u => u.schoolId === schoolId && u.role === Role.SchoolAdmin);
        if (admin) {
            if (window.confirm(`Are you sure you want to log in as ${admin.name}?`)) {
                const url = new URL(window.location.href);
                url.search = '';
                url.searchParams.set('impersonate', admin.id);
                window.open(url.toString(), '_blank');
            }
        } else {
            alert('No School Admin user found for this school.');
        }
    };

    const schoolCities = [...new Set(schools.map(s => s.city))].sort();

    return (
        <>
            <Card>
              <CardHeader className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">{t('globalAdmin.schools.title')}</h2>
                <Button onClick={() => setIsCreateModalOpen(true)}>+ {t('globalAdmin.schools.create')}</Button>
              </CardHeader>
              <CardContent>
                 <div className="flex flex-col md:flex-row gap-4 mb-4 pb-4 border-b border-gray-200">
                    <Input
                        placeholder={t('globalAdmin.schools.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow"
                    />
                    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="md:w-48">
                        <option value="">All Statuses</option>
                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                    <Select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="md:w-48">
                        <option value="">All Cities</option>
                        {schoolCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <colgroup>
                        <col className="w-4/12" />
                        <col className="w-2/12" />
                        <col className="w-1/12" />
                        <col className="w-2/12" />
                        <col className="w-1/12" />
                        <col className="w-2/12" />
                    </colgroup>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.schools.table.name')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.schools.table.country')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.schools.table.city')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.schools.table.director')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.schools.table.status')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSchools.map((school) => (
                        <tr key={school.id}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">{school.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 break-words">{school.country}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 break-words">{school.city}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 break-words">{school.directorName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge color={statusColorMap[school.status]}>{school.status}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex justify-end gap-2 flex-wrap">
                                <Button variant="primary" size="sm" onClick={() => handleImpersonate(school.id)}>{t('common.impersonate')}</Button>
                                <Button variant="secondary" size="sm" onClick={() => handleEdit(school)}>{t('common.edit')}</Button>
                                {school.status !== Status.Suspended && (
                                    <Button variant="danger" size="sm" onClick={() => handleSuspend(school.id)} disabled={suspendingId === school.id}>
                                        {suspendingId === school.id ? '...' : t('common.suspend')}
                                    </Button>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            <CreateSchoolModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSchoolCreated={fetchSchools}
            />
            {editingSchool && (
                <EditSchoolModal
                    isOpen={!!editingSchool}
                    onClose={() => setEditingSchool(null)}
                    onSchoolUpdated={() => {
                        fetchSchools();
                        setEditingSchool(null);
                    }}
                    school={editingSchool}
                />
            )}
        </>
    );
};

const ProviderManagementView: React.FC<{ users: User[], allProviders: Provider[] }> = ({ users, allProviders }) => {
    const { t } = useTranslation();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
    const [suspendingId, setSuspendingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');


    const fetchProviders = useCallback(async () => {
        const providersData = await api.getProviders();
        setProviders(providersData);
    }, []);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    useEffect(() => {
        let result = providers;

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            result = result.filter(provider =>
                provider.businessName.toLowerCase().includes(lowercasedTerm) ||
                provider.contactName.toLowerCase().includes(lowercasedTerm) ||
                provider.city.toLowerCase().includes(lowercasedTerm) ||
                provider.country.toLowerCase().includes(lowercasedTerm)
            );
        }

        if (statusFilter) {
            result = result.filter(provider => provider.status === statusFilter);
        }

        if (cityFilter) {
            result = result.filter(provider => provider.city === cityFilter);
        }

        setFilteredProviders(result);
    }, [searchTerm, statusFilter, cityFilter, providers]);

    const handleSuspend = async (providerId: string) => {
        if (window.confirm('Are you sure you want to suspend this provider?')) {
            setSuspendingId(providerId);
            try {
                await api.suspendProvider(providerId);
                fetchProviders();
            } catch (error) {
                console.error("Failed to suspend provider", error);
                alert("Failed to suspend provider. Please try again.");
            } finally {
                setSuspendingId(null);
            }
        }
    };
    
    const handleEdit = (provider: Provider) => {
        setEditingProvider(provider);
    };

    const handleImpersonate = async (providerId: string) => {
        const admin = users.find(u => u.providerId === providerId && u.role === Role.ProviderAdmin);
        if (admin) {
            if (window.confirm(`Are you sure you want to log in as ${admin.name}?`)) {
                const url = new URL(window.location.href);
                url.search = '';
                url.searchParams.set('impersonate', admin.id);
                window.open(url.toString(), '_blank');
            }
        } else {
            alert('No Provider Admin user found for this provider.');
        }
    };

    const providerCities = [...new Set(providers.map(p => p.city))].sort();
    const providerStatuses = Object.values(Status).filter(s => 
        s !== Status.Confirmed && s !== Status.Cancelled && s !== Status.Rescheduled
    );


    return (
        <>
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">{t('globalAdmin.providers.title')}</h2>
                    <Button onClick={() => setIsCreateModalOpen(true)}>+ {t('globalAdmin.providers.create')}</Button>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-4 pb-4 border-b border-gray-200">
                        <Input
                            placeholder={t('globalAdmin.providers.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-grow"
                        />
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="md:w-48">
                            <option value="">All Statuses</option>
                            {providerStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                        <Select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="md:w-48">
                            <option value="">All Cities</option>
                            {providerCities.map(c => <option key={c} value={c}>{c}</option>)}
                        </Select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                            <colgroup>
                                <col className="w-4/12" />
                                <col className="w-1/12" />
                                <col className="w-2/12" />
                                <col className="w-1/12" />
                                <col className="w-1/12" />
                                <col className="w-3/12" />
                            </colgroup>
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.providers.table.name')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.providers.table.feeConfig')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.providers.table.country')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.providers.table.city')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.providers.table.status')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProviders.map((provider) => (
                                    <tr key={provider.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">{provider.businessName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {provider.feeConfig ? (
                                                <Badge color="blue">Custom</Badge>
                                            ) : (
                                                <Badge color="gray">Default</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 break-words">{provider.country}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 break-words">{provider.city}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge color={statusColorMap[provider.status]}>{provider.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 flex-wrap">
                                                <Button variant="primary" size="sm" onClick={() => handleImpersonate(provider.id)}>{t('common.impersonate')}</Button>
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(provider)}>{t('common.edit')}</Button>
                                                {provider.status !== Status.Suspended && (
                                                    <Button variant="danger" size="sm" onClick={() => handleSuspend(provider.id)} disabled={suspendingId === provider.id}>
                                                        {suspendingId === provider.id ? '...' : t('common.suspend')}
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            <CreateProviderModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onProviderCreated={fetchProviders}
            />
            {editingProvider && (
                <EditProviderModal
                    isOpen={!!editingProvider}
                    onClose={() => setEditingProvider(null)}
                    onProviderUpdated={() => {
                        fetchProviders();
                        setEditingProvider(null);
                    }}
                    provider={editingProvider}
                />
            )}
        </>
    );
};

const LinkagesView: React.FC = () => {
    const [links, setLinks] = useState<SchoolProviderLink[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { t } = useTranslation();
    
    const fetchData = useCallback(async () => {
        const [linksData, schoolsData, providersData] = await Promise.all([
            api.getLinks(),
            api.getSchools(),
            api.getProviders()
        ]);
        setLinks(linksData);
        setSchools(schoolsData);
        setProviders(providersData);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (linkId: string) => {
        if (window.confirm('Are you sure you want to unlink this school and provider?')) {
            setDeletingId(linkId);
            try {
                await api.deleteLink(linkId);
                fetchData();
            } catch (error) {
                console.error("Failed to delete link", error);
                alert("Failed to delete link. Please try again.");
            } finally {
                setDeletingId(null);
            }
        }
    };

    const getSchoolName = (id: string) => schools.find(s => s.id === id)?.name || 'N/A';
    const getProviderName = (id: string) => providers.find(p => p.id === id)?.businessName || 'N/A';

    return (
        <>
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">{t('globalAdmin.linkages.title')}</h2>
                    <Button onClick={() => setIsLinkModalOpen(true)}>+ {t('globalAdmin.linkages.create')}</Button>
                </CardHeader>
                <CardContent>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                            <colgroup>
                                <col className="w-2/5" />
                                <col className="w-2/5" />
                                <col className="w-1/5" />
                            </colgroup>
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.linkages.table.school')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.linkages.table.provider')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {links.map(link => (
                                    <tr key={link.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">{getSchoolName(link.schoolId)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 break-words">{getProviderName(link.providerId)}</td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 flex-wrap">
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(link.id)} disabled={deletingId === link.id}>
                                                    {deletingId === link.id ? '...' : t('common.delete')}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            <LinkSchoolProviderModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                onLinkCreated={fetchData}
            />
        </>
    );
};

const SubscriptionsView: React.FC = () => {
    type Tab = 'planManagement' | 'schoolAssignments';
    const [activeTab, setActiveTab] = useState<Tab>('planManagement');

    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [allSchools, setAllSchools] = useState<School[]>([]);
    const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const { t } = useTranslation();

    const fetchData = useCallback(async () => {
        const [plansData, featuresData, schoolsData] = await Promise.all([
            api.getSubscriptionPlans(),
            api.getFeatures(),
            api.getSchools()
        ]);
        setPlans(plansData);
        setFeatures(featuresData);
        setAllSchools(schoolsData);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        let result = allSchools;
        if (searchTerm) {
            result = result.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (planFilter) {
            result = result.filter(s => s.subscriptionPlan === planFilter);
        }
        setFilteredSchools(result);
    }, [searchTerm, planFilter, allSchools]);

    const handleFeatureToggle = (planId: string, featureId: string) => {
        setPlans(prevPlans => prevPlans.map(plan => {
            if (plan.id === planId) {
                return {
                    ...plan,
                    features: {
                        ...plan.features,
                        [featureId]: !plan.features[featureId],
                    },
                };
            }
            return plan;
        }));
    };

    const handlePriceChange = (planId: string, newPrice: number) => {
        setPlans(prevPlans => prevPlans.map(plan => {
            if (plan.id === planId) {
                return { ...plan, price: newPrice >= 0 ? newPrice : 0 };
            }
            return plan;
        }));
    };

    const handleSavePlans = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            await Promise.all(plans.map(plan => api.updateSubscriptionPlan(plan)));
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save plans", error);
            alert("Error saving plans.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSchoolPlanChange = async (schoolId: string, planName: SubscriptionPlanName) => {
        try {
            await api.updateSchoolSubscription(schoolId, planName);
            // Refetch or update local state
            setAllSchools(prev => prev.map(s => s.id === schoolId ? {...s, subscriptionPlan: planName} : s));
        } catch (error) {
            console.error("Failed to update school plan", error);
            alert("Error updating school plan.");
        }
    };

    const exportToCSV = () => {
        const headers = ["School Name", "Country", "City", "Subscription Plan"];
        const rows = filteredSchools.map(school => 
            [school.name, school.country, school.city, school.subscriptionPlan || 'N/A'].join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "school_subscriptions.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderPlanManagement = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <Card key={plan.id} className="flex flex-col">
                        <CardHeader className={`bg-gray-50 ${plan.name === SubscriptionPlanName.Premium ? 'bg-blue-100' : ''}`}>
                            <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                            <div className="flex items-center mt-1">
                                <span className="text-2xl font-extrabold text-blue-600">$</span>
                                <Input
                                    type="number"
                                    aria-label={`Price for ${plan.name} plan`}
                                    value={plan.price}
                                    onChange={(e) => handlePriceChange(plan.id, parseFloat(e.target.value) || 0)}
                                    disabled={plan.name === SubscriptionPlanName.Gratis}
                                    className="w-24 p-0 border-0 bg-transparent text-2xl font-extrabold text-blue-600 focus:ring-2 focus:ring-blue-500 rounded"
                                    min="0"
                                />
                                <span className="text-sm font-medium text-gray-500">/mo</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <ul className="space-y-3">
                                {features.map(feature => (
                                    <li key={feature.id} className="flex items-start">
                                        <input
                                            type="checkbox"
                                            id={`${plan.id}-${feature.id}`}
                                            checked={plan.features[feature.id] || false}
                                            onChange={() => handleFeatureToggle(plan.id, feature.id)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                                        />
                                        <Label htmlFor={`${plan.id}-${feature.id}`} className="ml-3 text-sm text-gray-600 cursor-pointer">
                                            {feature.name}
                                            <p className="text-xs text-gray-400">{feature.description}</p>
                                        </Label>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="flex justify-end items-center space-x-4">
                {saveSuccess && <p className="text-sm text-green-600">Plans saved successfully!</p>}
                <Button onClick={handleSavePlans} disabled={isSaving}>{isSaving ? t('common.loading') : t('common.save')}</Button>
            </div>
        </div>
    );

    const renderSchoolAssignments = () => (
        <Card>
            <CardHeader>
                <h3 className="text-xl font-semibold text-gray-800">{t('globalAdmin.subscriptions.assignmentsTitle')}</h3>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4 pb-4 border-b border-gray-200">
                    <Input
                        placeholder={t('globalAdmin.schools.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow"
                    />
                    <Select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="md:w-48">
                        <option value="">All Plans</option>
                        {Object.values(SubscriptionPlanName).map(p => <option key={p} value={p}>{p}</option>)}
                    </Select>
                    <Button variant="secondary" onClick={exportToCSV}>
                        <DownloadIcon /> <span className="ml-2">{t('common.exportCSV')}</span>
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.schools.table.name')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('globalAdmin.schools.table.city')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Plan</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSchools.map(school => (
                                <tr key={school.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{school.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.city}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <Select 
                                            value={school.subscriptionPlan || ''} 
                                            onChange={(e) => handleSchoolPlanChange(school.id, e.target.value as SubscriptionPlanName)}
                                            className="w-48"
                                        >
                                            {Object.values(SubscriptionPlanName).map(p => <option key={p} value={p}>{p}</option>)}
                                        </Select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4">
             <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('planManagement')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'planManagement' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t('globalAdmin.subscriptions.tabs.plans')}
                </button>
                <button 
                    onClick={() => setActiveTab('schoolAssignments')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'schoolAssignments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t('globalAdmin.subscriptions.tabs.assignments')}
                </button>
            </div>
            {activeTab === 'planManagement' ? renderPlanManagement() : renderSchoolAssignments()}
        </div>
    );
};


const FeeConfiguration: React.FC = () => {
    const [config, setConfig] = useState<FeeConfig | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        api.getFeeConfig().then(setConfig);
    }, []);

    const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!config) return;
        setConfig({ ...config, percentage: parseFloat(e.target.value) || 0 });
    };
    
    const handleSalesTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!config) return;
        setConfig({ ...config, applyToSalesType: e.target.value as FeeConfig['applyToSalesType'] });
    }

    const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!config) return;
        const method = e.target.value as PaymentMethod;
        const currentMethods = config.applyToPaymentMethods;
        if (e.target.checked) {
            setConfig({ ...config, applyToPaymentMethods: [...currentMethods, method] });
        } else {
            setConfig({ ...config, applyToPaymentMethods: currentMethods.filter(m => m !== method) });
        }
    }

    const handleSave = async () => {
        if (!config) return;
        setIsSaving(true);
        setSaveSuccess(false);
        await api.updateFeeConfig(config);
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    if (!config) return <p>{t('common.loading')}</p>

    return (
        <Card>
            <CardHeader>
                <h3 className="font-semibold text-gray-700">{t('globalAdmin.settings.feeTitle')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('globalAdmin.settings.feeDesc')}</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label htmlFor="feePercentage">{t('globalAdmin.settings.percentage')}</Label>
                    <div className="flex gap-4 items-end">
                        <Input id="feePercentage" type="number" value={config.percentage} onChange={handlePercentageChange} step="0.1" min="0" max="100" className="flex-grow"/>
                        <Button onClick={handleSave} disabled={isSaving} className="mb-0.5">
                            {isSaving ? t('common.loading') : 'Guardar Porcentaje'}
                        </Button>
                    </div>
                </div>
                <div>
                    <Label>{t('globalAdmin.settings.salesType')}</Label>
                    <div className="flex space-x-4 mt-1">
                        <label className="inline-flex items-center"><input type="radio" name="salesType" value="POS" checked={config.applyToSalesType === 'POS'} onChange={handleSalesTypeChange} className="form-radio" /> <span className="ml-2">POS</span></label>
                        <label className="inline-flex items-center"><input type="radio" name="salesType" value="Online" checked={config.applyToSalesType === 'Online'} onChange={handleSalesTypeChange} className="form-radio" /> <span className="ml-2">Online</span></label>
                        <label className="inline-flex items-center"><input type="radio" name="salesType" value="Both" checked={config.applyToSalesType === 'Both'} onChange={handleSalesTypeChange} className="form-radio" /> <span className="ml-2">Both</span></label>
                    </div>
                </div>
                <div>
                     <Label>{t('globalAdmin.settings.paymentMethods')}</Label>
                     <div className="flex space-x-4 mt-1">
                        {Object.values(PaymentMethod).map(method => (
                             <label key={method} className="inline-flex items-center">
                                <input 
                                    type="checkbox" 
                                    value={method} 
                                    checked={config.applyToPaymentMethods.includes(method)} 
                                    onChange={handlePaymentMethodChange}
                                    className="form-checkbox"
                                />
                                <span className="ml-2">{(method as string).replace(/([A-Z])/g, ' $1').trim()}</span>
                            </label>
                        ))}
                     </div>
                </div>
                <div className="flex items-center space-x-4 pt-4 border-t">
                    <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">{isSaving ? t('common.loading') : t('common.save')}</Button>
                    {saveSuccess && <p className="text-sm text-green-600 flex items-center"><CheckCircleIcon /> Configuración guardada exitosamente</p>}
                </div>
            </CardContent>
        </Card>
    );
};

const SettingsView: React.FC = () => {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    api.getEmailTemplates().then(setEmailTemplates);
  }, []);

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = async (template: EmailTemplate) => {
    await api.updateEmailTemplate(template);
    const templates = await api.getEmailTemplates();
    setEmailTemplates(templates);
    setIsTemplateModalOpen(false);
    setSelectedTemplate(null);
  }

    return (
        <div className="space-y-8">
            <FeeConfiguration />
            <Card>
                <CardHeader>
                    <h3 className="font-semibold text-gray-700">{t('globalAdmin.settings.templatesTitle')}</h3>
                </CardHeader>
                <CardContent>
                    <ul className="divide-y divide-gray-200">
                        {emailTemplates.map(template => (
                            <li key={template.id} className="py-3 flex justify-between items-center">
                                <span className="text-sm text-gray-600">{template.name}</span>
                                <Button variant="secondary" size="sm" onClick={() => handleEditTemplate(template)}>{t('common.edit')}</Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            {selectedTemplate && (
                <EmailTemplateModal
                    isOpen={isTemplateModalOpen}
                    onClose={() => setIsTemplateModalOpen(false)}
                    template={selectedTemplate}
                    onSave={handleSaveTemplate}
                />
            )}
        </div>
    );
};


export const GlobalAdminDashboard: React.FC<{ activeView?: string }> = ({ activeView = 'dashboard' }) => {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<School[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const fetchSummaryData = useCallback(async () => {
    const [schoolsData, providersData, usersData] = await Promise.all([
      api.getSchools(),
      api.getProviders(),
      api.getUsers(),
    ]);
    setSchools(schoolsData);
    setProviders(providersData);
    setUsers(usersData);
  }, []);

  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);
  
  const renderContent = () => {
      switch(activeView) {
          case 'schools':
              return <SchoolManagementView users={users} allSchools={schools} />;
          case 'providers':
              return <ProviderManagementView users={users} allProviders={providers} />;
          case 'users':
              return <UserManagementView />;
          case 'linkages':
              return <LinkagesView />;
          case 'subscriptions':
              return <SubscriptionsView />;
          case 'homePage':
              return <LandingPageEditorView />;
          case 'settings':
              return <SettingsView />;
          case 'dashboard':
          default:
              return <DashboardHome schools={schools} providers={providers} />;
      }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-display font-bold text-text-primary">
        {t(`sidebar.${activeView}`)}
      </h1>
      
      {renderContent()}
      
    </div>
  );
};
