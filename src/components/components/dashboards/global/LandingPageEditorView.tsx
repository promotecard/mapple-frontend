
import { useTranslation } from "react-i18next";

/* UI */
import { Label } from "@/components/components/ui/Label";
import { Textarea } from "@/components/components/ui/Textarea";

/* Services */
import { api } from "@/services/mockApi";

/* Context */
import { useAppContext } from "@/context/AppContext";

export const LandingPageEditorView: React.FC = () => {
    const { fetchLandingPageConfig } = useAppContext();
    const [config, setConfig] = useState<LandingPageConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('general');

    const sections = [
        { key: 'general', title: 'General y Logos' },
        { key: 'hero', title: 'Sección Principal (Hero)' },
        { key: 'connections', title: 'Sección "Conectados"' },
        { key: 'magic', title: 'Sección "Magia"' },
        { key: 'learning', title: 'Sección "Aprendizaje"' },
        { key: 'character', title: 'Sección "Personaje"' },
        { key: 'finalCta', title: 'Llamada a la Acción Final' },
    ];

    useEffect(() => {
        api.getLandingPageConfig().then(data => {
            setConfig(data);
            setIsLoading(false);
        });
    }, []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!config) return;
        const { name, value } = e.target;
        
        // Handle nested properties
        if (name.includes('.')) {
            const [section, key] = name.split('.');
            setConfig(prev => {
                if (!prev) return null;
                const sectionData = (prev as any)[section];
                return { ...prev, [section]: { ...sectionData, [key]: value } };
            });
        } else {
            setConfig(prev => prev ? { ...prev, [name]: value } : null);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof LandingPageConfig) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setConfig(prev => prev ? { ...prev, [fieldName]: reader.result as string } : null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileUploadNested = (
        e: React.ChangeEvent<HTMLInputElement>,
        section: keyof LandingPageConfig,
        key: string
    ) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setConfig(prev => {
                    if (!prev) return null;
                    const sectionData = (prev as any)[section];
                    return {
                        ...prev,
                        [section]: {
                            ...sectionData,
                            [key]: reader.result as string,
                        },
                    };
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        setIsSaving(true);
        try {
            await api.updateLandingPageConfig(config);
            await fetchLandingPageConfig(); // Refresh global context
            alert('¡Página de inicio actualizada!');
        } catch (error) {
            alert('Error al guardar los cambios.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const renderSectionContent = () => {
        if (!config) return null;

        switch (activeSection) {
            case 'general':
                return (
                    <Card>
                        <CardHeader><h3 className="font-semibold text-lg">Configuración General y Logos</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-6">
                                <div>
                                    <Label>Banner Principal (Hero)</Label>
                                    <div className="flex items-center gap-4">
                                        <img src={config.heroBannerUrl} alt="banner preview" className="h-24 w-auto p-2 border rounded bg-gray-100 object-contain" />
                                        <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'heroBannerUrl')} />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Imagen principal que aparece en la parte superior de la página de inicio.</p>
                                </div>
                                <div className="pt-4 border-t">
                                    <Label>Logo de la Cabecera (Header)</Label>
                                    <div className="flex items-center gap-4">
                                        <img src={config.logoHeaderUrl} alt="logo preview" className="h-16 w-auto p-2 border rounded bg-gray-100" />
                                        <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoHeaderUrl')} />
                                    </div>
                                </div>
                                <div>
                                    <Label>Logo de la Sección Principal (Hero)</Label>
                                    <div className="flex items-center gap-4">
                                        <img src={config.logoHeroUrl} alt="logo preview" className="h-16 w-auto p-2 border rounded bg-gray-100" />
                                        <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoHeroUrl')} />
                                    </div>
                                </div>
                                <div>
                                    <Label>Logo de la Página de Inicio de Sesión (Login)</Label>
                                    <div className="flex items-center gap-4">
                                        <img src={config.logoLoginUrl} alt="logo preview" className="h-16 w-auto p-2 border rounded bg-gray-100" />
                                        <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoLoginUrl')} />
                                    </div>
                                </div>
                                <div className="pt-4 border-t">
                                    <h4 className="font-semibold text-gray-700 mb-4">Iconos de la Sección "Conectados"</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-4 border rounded-lg text-center">
                                            <Label>Profesores que inspiran</Label>
                                            <img src={config.connectionsFeature1.iconUrl} alt="feature 1 icon preview" className="h-24 w-auto p-2 border rounded bg-gray-100 object-contain mx-auto my-2" />
                                            <Input type="file" accept="image/*" onChange={(e) => handleFileUploadNested(e, 'connectionsFeature1', 'iconUrl')} />
                                        </div>
                                        <div className="p-4 border rounded-lg text-center">
                                            <Label>Padres que participan</Label>
                                            <img src={config.connectionsFeature2.iconUrl} alt="feature 2 icon preview" className="h-24 w-auto p-2 border rounded bg-gray-100 object-contain mx-auto my-2" />
                                            <Input type="file" accept="image/*" onChange={(e) => handleFileUploadNested(e, 'connectionsFeature2', 'iconUrl')} />
                                        </div>
                                        <div className="p-4 border rounded-lg text-center">
                                            <Label>Estudiantes que aprenden</Label>
                                            <img src={config.connectionsFeature3.iconUrl} alt="feature 3 icon preview" className="h-24 w-auto p-2 border rounded bg-gray-100 object-contain mx-auto my-2" />
                                            <Input type="file" accept="image/*" onChange={(e) => handleFileUploadNested(e, 'connectionsFeature3', 'iconUrl')} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t"><Label>Texto del Botón (Cabecera)</Label><Input name="headerButtonText" value={config.headerButtonText} onChange={handleInputChange} /></div>
                        </CardContent>
                    </Card>
                );
            case 'hero':
                return (
                    <Card>
                        <CardHeader><h3 className="font-semibold text-lg">Sección Principal (Hero)</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <div><Label>Título Principal</Label><Input name="heroTitle" value={config.heroTitle} onChange={handleInputChange} /></div>
                            <div><Label>Subtítulo</Label><Textarea name="heroSubtitle" value={config.heroSubtitle} onChange={handleInputChange} /></div>
                            <div><Label>Descripción</Label><Textarea name="heroDescription" value={config.heroDescription} rows={3} onChange={handleInputChange} /></div>
                            <div><Label>Texto del Botón (CTA)</Label><Input name="heroCtaText" value={config.heroCtaText} onChange={handleInputChange} /></div>
                        </CardContent>
                    </Card>
                );
            case 'connections':
                return (
                    <Card>
                        <CardHeader><h3 className="font-semibold text-lg">Sección "Conectados"</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <div><Label>Título</Label><Input name="connectionsTitle" value={config.connectionsTitle} onChange={handleInputChange} /></div>
                            <div><Label>Subtítulo</Label><Textarea name="connectionsSubtitle" value={config.connectionsSubtitle} onChange={handleInputChange} /></div>
                            <div className="grid grid-cols-3 gap-4">
                                <div><Label>Feature 1 Icono</Label><Input name="connectionsFeature1.iconUrl" value={config.connectionsFeature1.iconUrl} onChange={handleInputChange} /></div>
                                <div className="col-span-2"><Label>Feature 1 Texto</Label><Input name="connectionsFeature1.text" value={config.connectionsFeature1.text} onChange={handleInputChange} /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div><Label>Feature 2 Icono</Label><Input name="connectionsFeature2.iconUrl" value={config.connectionsFeature2.iconUrl} onChange={handleInputChange} /></div>
                                <div className="col-span-2"><Label>Feature 2 Texto</Label><Input name="connectionsFeature2.text" value={config.connectionsFeature2.text} onChange={handleInputChange} /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div><Label>Feature 3 Icono</Label><Input name="connectionsFeature3.iconUrl" value={config.connectionsFeature3.iconUrl} onChange={handleInputChange} /></div>
                                <div className="col-span-2"><Label>Feature 3 Texto</Label><Input name="connectionsFeature3.text" value={config.connectionsFeature3.text} onChange={handleInputChange} /></div>
                            </div>
                            <div><Label>Texto de Cierre</Label><Input name="connectionsClosing" value={config.connectionsClosing} onChange={handleInputChange} /></div>
                            <div><Label>Beneficio Final</Label><Input name="connectionsBenefit" value={config.connectionsBenefit} onChange={handleInputChange} /></div>
                        </CardContent>
                    </Card>
                );
            case 'magic':
                return (
                    <Card>
                        <CardHeader><h3 className="font-semibold text-lg">Sección "Magia"</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <div><Label>Título</Label><Input name="magicTitle" value={config.magicTitle} onChange={handleInputChange} /></div>
                            <div><Label>Subtítulo</Label><Textarea name="magicSubtitle" value={config.magicSubtitle} onChange={handleInputChange} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Feature 1 Icono</Label><Input name="magicFeature1.icon" value={config.magicFeature1.icon} onChange={handleInputChange} /></div>
                                <div><Label>Feature 1 Texto</Label><Input name="magicFeature1.text" value={config.magicFeature1.text} onChange={handleInputChange} /></div>
                                <div><Label>Feature 2 Icono</Label><Input name="magicFeature2.icon" value={config.magicFeature2.icon} onChange={handleInputChange} /></div>
                                <div><Label>Feature 2 Texto</Label><Input name="magicFeature2.text" value={config.magicFeature2.text} onChange={handleInputChange} /></div>
                                <div><Label>Feature 3 Icono</Label><Input name="magicFeature3.icon" value={config.magicFeature3.icon} onChange={handleInputChange} /></div>
                                <div><Label>Feature 3 Texto</Label><Input name="magicFeature3.text" value={config.magicFeature3.text} onChange={handleInputChange} /></div>
                                <div><Label>Feature 4 Icono</Label><Input name="magicFeature4.icon" value={config.magicFeature4.icon} onChange={handleInputChange} /></div>
                                <div><Label>Feature 4 Texto</Label><Input name="magicFeature4.text" value={config.magicFeature4.text} onChange={handleInputChange} /></div>
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'learning':
                return (
                    <Card>
                        <CardHeader><h3 className="font-semibold text-lg">Sección "Aprendizaje Positivo"</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <div><Label>Título</Label><Input name="learningTitle" value={config.learningTitle} onChange={handleInputChange} /></div>
                            <div><Label>Subtítulo</Label><Textarea name="learningSubtitle" value={config.learningSubtitle} onChange={handleInputChange} /></div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                <div><Label>Feature 1 Icono</Label><Input name="learningFeature1.icon" value={config.learningFeature1.icon} onChange={handleInputChange} /></div>
                                <div><Label>Feature 1 Texto</Label><Input name="learningFeature1.text" value={config.learningFeature1.text} onChange={handleInputChange} /></div>
                                <div><Label>Feature 2 Icono</Label><Input name="learningFeature2.icon" value={config.learningFeature2.icon} onChange={handleInputChange} /></div>
                                <div><Label>Feature 2 Texto</Label><Input name="learningFeature2.text" value={config.learningFeature2.text} onChange={handleInputChange} /></div>
                                <div><Label>Feature 3 Icono</Label><Input name="learningFeature3.icon" value={config.learningFeature3.icon} onChange={handleInputChange} /></div>
                                <div><Label>Feature 3 Texto</Label><Input name="learningFeature3.text" value={config.learningFeature3.text} onChange={handleInputChange} /></div>
                                <div><Label>Feature 4 Icono</Label><Input name="learningFeature4.icon" value={config.learningFeature4.icon} onChange={handleInputChange} /></div>
                                <div><Label>Feature 4 Texto</Label><Input name="learningFeature4.text" value={config.learningFeature4.text} onChange={handleInputChange} /></div>
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'character':
                return (
                    <Card>
                        <CardHeader><h3 className="font-semibold text-lg">Sección "Personaje"</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Imagen del Personaje</Label>
                                <div className="flex items-center gap-4">
                                    <img src={config.characterImageUrl} alt="character preview" className="h-24 w-24 p-2 border rounded-full bg-gray-100 object-contain" />
                                    <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'characterImageUrl')} />
                                </div>
                            </div>
                            <div><Label>Título</Label><Input name="characterTitle" value={config.characterTitle} onChange={handleInputChange} /></div>
                            <div><Label>Descripción</Label><Textarea name="characterDescription" value={config.characterDescription} rows={3} onChange={handleInputChange} /></div>
                            <div><Label>Cita</Label><Input name="characterQuote" value={config.characterQuote} onChange={handleInputChange} /></div>
                        </CardContent>
                    </Card>
                );
            case 'finalCta':
                return (
                    <Card>
                        <CardHeader><h3 className="font-semibold text-lg">Sección "Llamada a la Acción Final"</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <div><Label>Título</Label><Input name="finalCtaTitle" value={config.finalCtaTitle} onChange={handleInputChange} /></div>
                            <div><Label>Subtítulo</Label><Textarea name="finalCtaSubtitle" value={config.finalCtaSubtitle} onChange={handleInputChange} /></div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                <div><Label>Texto Botón 1</Label><Input name="finalCtaButton1" value={config.finalCtaButton1} onChange={handleInputChange} /></div>
                                <div><Label>Texto Botón 2</Label><Input name="finalCtaButton2" value={config.finalCtaButton2} onChange={handleInputChange} /></div>
                            </div>
                            <div className="pt-4 border-t">
                                <Label>Email para Solicitudes de Demo</Label>
                                <Input name="demoRequestEmail" value={config.demoRequestEmail} onChange={handleInputChange} />
                                <p className="text-xs text-gray-500 mt-1">
                                    Los formularios de "Agendar Demostración" se enviarán a esta dirección de correo.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return <p>Cargando editor...</p>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center sticky top-20 z-10 py-2 bg-gray-100/80 backdrop-blur-sm -mx-6 px-6">
                 <h2 className="text-2xl font-bold text-gray-800">Editando Página de Inicio</h2>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
            
            <div className="flex gap-8 items-start">
                <nav className="w-64 flex-shrink-0 sticky top-40">
                    <ul className="space-y-2">
                        {sections.map(section => (
                            <li key={section.key}>
                                <button
                                    onClick={() => setActiveSection(section.key)}
                                    className={`w-full text-left px-4 py-2 rounded-md transition-colors text-sm ${
                                        activeSection === section.key
                                            ? 'bg-blue-100 text-blue-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {section.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex-1 space-y-6 min-w-0">
                    {renderSectionContent()}
                </div>
            </div>
        </div>
    );
};
