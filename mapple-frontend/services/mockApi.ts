
import {
  Role, Status, PaymentMethod, SubscriptionPlanName, EmailTemplateType, SalesType,
  Permission, ProviderPermission, AttendanceStatus, PickupType, PaymentStatus,
  User, School, Provider, EmailTemplate, SchoolProviderLink, FeeConfig, SubscriptionPlan,
  Feature, Student, Activity, Catalog, ExternalEnrollment, GradeLevel, Classroom,
  PaymentTransaction, RecurringPayment, PaymentGroup, ProductCategory, Product,
  ProviderCatalog, Order, MediaPost, Circular, LibraryItem, Course, VirtualTutorConfig,
  LandingPageConfig, Conversation, Message, Comment, AttendanceRecord, PickupRecord,
  UserWithPassword, SchoolCreationData, ProviderCreationData, ActivityCreationData,
  CircularCreationData, Benefit, Position, ProviderPosition, StudentCourseProgress,
  OrderItem, GuardianInfo, AuthorizedPickup, ActivityAssignment, ActivityEnrollment
} from '../types';

// Helpers
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// --- Data Persistence Helpers ---
const STORAGE_KEYS = {
    USERS: 'mapple_mock_users',
    SCHOOLS: 'mapple_mock_schools',
    PROVIDERS: 'mapple_mock_providers',
    LINKS: 'mapple_mock_links',
    ACTIVITIES: 'mapple_mock_activities',
    STUDENTS: 'mapple_mock_students',
    PRODUCTS: 'mapple_mock_products',
    ORDERS: 'mapple_mock_orders',
    CATALOGS: 'mapple_mock_catalogs',
    PROVIDER_CATALOGS: 'mapple_mock_provider_catalogs',
    POSITIONS: 'mapple_mock_positions',
    PROVIDER_POSITIONS: 'mapple_mock_provider_positions',
    LIVE_PICKUPS: 'mapple_mock_live_pickups',
};

const loadFromStorage = <T>(key: string, initialData: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error(`Error loading ${key} from storage`, e);
    }
    return initialData;
};

const saveToStorage = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Error saving ${key} to storage`, e);
    }
};

// Mock Data
export const countries = ['República Dominicana', 'México', 'Colombia', 'España'];
export const citiesByCountry: Record<string, string[]> = {
    'República Dominicana': ['Santo Domingo', 'Santiago', 'La Romana'],
    'México': ['Ciudad de México', 'Guadalajara', 'Monterrey'],
    'Colombia': ['Bogotá', 'Medellín', 'Cali'],
    'España': ['Madrid', 'Barcelona', 'Valencia']
};

const INITIAL_USERS: UserWithPassword[] = [
    { id: 'global-admin', name: 'Global Admin', email: 'admin@mapple.com', role: Role.GlobalAdmin, avatarUrl: 'https://ui-avatars.com/api/?name=Global+Admin' },
    { id: 'pos-demo', name: 'POS Demo', email: 'pos.demo@demo.com', role: Role.ProviderAdmin, providerId: 'provider-1', avatarUrl: 'https://ui-avatars.com/api/?name=POS+Demo', pin: '1234' },
    { id: 'provider-admin', name: 'Provider Admin', email: 'provider@demo.com', role: Role.ProviderAdmin, providerId: 'provider-1', avatarUrl: 'https://ui-avatars.com/api/?name=Provider+Admin' },
    { id: 'school-admin', name: 'School Admin', email: 'school@demo.com', role: Role.SchoolAdmin, schoolId: 'school-1', avatarUrl: 'https://ui-avatars.com/api/?name=School+Admin' },
    { id: 'teacher-1', name: 'Teacher One', email: 'teacher@demo.com', role: Role.Teacher, schoolId: 'school-1', avatarUrl: 'https://ui-avatars.com/api/?name=Teacher+One' },
    { id: 'parent-1', name: 'Parent One', email: 'parent@demo.com', role: Role.Parent, schoolId: 'school-1', avatarUrl: 'https://ui-avatars.com/api/?name=Parent+One' },
    { id: 'student-1', name: 'Student One', email: 'student@demo.com', role: Role.Student, schoolId: 'school-1', studentId: 'student-1', avatarUrl: 'https://ui-avatars.com/api/?name=Student+One' }
];

const INITIAL_SCHOOLS: School[] = [
    { id: 'school-1', name: 'Demo School', taxId: '123', address: '123 Main St', country: 'República Dominicana', city: 'Santo Domingo', phone: '555-5555', email: 'school@demo.com', directorName: 'Director Demo', status: Status.Active, acceptedPaymentMethods: [PaymentMethod.Cash, PaymentMethod.BankTransfer] }
];

const INITIAL_PROVIDERS: Provider[] = [
    { id: 'provider-1', businessName: 'Demo Provider', taxId: '456', address: '456 Market St', country: 'República Dominicana', city: 'Santo Domingo', phone: '555-1234', email: 'provider@demo.com', contactName: 'Provider Contact', status: Status.Active, salesType: SalesType.Both, feeConfig: null }
];

const INITIAL_LINKS: SchoolProviderLink[] = [
    { id: 'link-1', schoolId: 'school-1', providerId: 'provider-1' }
];

const INITIAL_STUDENTS: Student[] = [
    {
        id: 'student-1', name: 'Student One', avatarUrl: '', idNumber: 'ST-001', dateOfBirth: '2015-01-01', schoolId: 'school-1', parentId: 'parent-1', gradeLevel: '1ro Primaria', profileStatus: 'Complete', emergencyContacts: '', healthSummary: '',
        familyInfo: { birthplace: '', homeAddress: '', homePhone: '', siblings: '', childPosition: '', parentsMaritalStatus: 'married', livesWith: '', timeWithMother: '', timeWithFather: '' },
        healthHistory: { birthConditions: { breastfed: false, pacifier: false, bedWetting: false }, general: { pediatricianName: '', emergencyContactName: '', allergies: '', currentTreatments: '' } },
        developmentProfile: { emotional: { frequentBehavior: '' }, social: { favoriteToys: '' }, motor: { walkedAge: '' }, language: { spokeAge: '' } },
        authorizedPickups: []
    }
];

// Load users from storage or use initial
let MOCK_USERS: UserWithPassword[] = loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
let MOCK_SCHOOLS: School[] = loadFromStorage(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
let MOCK_PROVIDERS: Provider[] = loadFromStorage(STORAGE_KEYS.PROVIDERS, INITIAL_PROVIDERS);
let MOCK_LINKS: SchoolProviderLink[] = loadFromStorage(STORAGE_KEYS.LINKS, INITIAL_LINKS);
let MOCK_ACTIVITIES: Activity[] = loadFromStorage(STORAGE_KEYS.ACTIVITIES, []);
let MOCK_STUDENTS: Student[] = loadFromStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
let MOCK_PRODUCTS: Product[] = loadFromStorage(STORAGE_KEYS.PRODUCTS, []);
let MOCK_ORDERS: Order[] = loadFromStorage(STORAGE_KEYS.ORDERS, []);
let MOCK_CATALOGS: Catalog[] = loadFromStorage(STORAGE_KEYS.CATALOGS, []);
let MOCK_PROVIDER_CATALOGS: ProviderCatalog[] = loadFromStorage(STORAGE_KEYS.PROVIDER_CATALOGS, []);
let MOCK_POSITIONS: Position[] = loadFromStorage(STORAGE_KEYS.POSITIONS, []);
let MOCK_PROVIDER_POSITIONS: ProviderPosition[] = loadFromStorage(STORAGE_KEYS.PROVIDER_POSITIONS, []);
let MOCK_LIVE_PICKUPS: { studentId: string, studentName: string, parentName: string, eta: number, timestamp: number }[] = loadFromStorage(STORAGE_KEYS.LIVE_PICKUPS, []);

// Persist helpers
const persistUsers = () => saveToStorage(STORAGE_KEYS.USERS, MOCK_USERS);
const persistSchools = () => saveToStorage(STORAGE_KEYS.SCHOOLS, MOCK_SCHOOLS);
const persistProviders = () => saveToStorage(STORAGE_KEYS.PROVIDERS, MOCK_PROVIDERS);
const persistLinks = () => saveToStorage(STORAGE_KEYS.LINKS, MOCK_LINKS);
const persistActivities = () => saveToStorage(STORAGE_KEYS.ACTIVITIES, MOCK_ACTIVITIES);
const persistStudents = () => saveToStorage(STORAGE_KEYS.STUDENTS, MOCK_STUDENTS);
const persistProducts = () => saveToStorage(STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS);
const persistOrders = () => saveToStorage(STORAGE_KEYS.ORDERS, MOCK_ORDERS);
const persistCatalogs = () => saveToStorage(STORAGE_KEYS.CATALOGS, MOCK_CATALOGS);
const persistProviderCatalogs = () => saveToStorage(STORAGE_KEYS.PROVIDER_CATALOGS, MOCK_PROVIDER_CATALOGS);
const persistPositions = () => saveToStorage(STORAGE_KEYS.POSITIONS, MOCK_POSITIONS);
const persistProviderPositions = () => saveToStorage(STORAGE_KEYS.PROVIDER_POSITIONS, MOCK_PROVIDER_POSITIONS);
const persistLivePickups = () => saveToStorage(STORAGE_KEYS.LIVE_PICKUPS, MOCK_LIVE_PICKUPS);

// --- ENSURE DEMO DATA INTEGRITY ---
const ensureDemoData = () => {
    let usersUpdated = false;
    INITIAL_USERS.forEach(demoUser => {
        if (!MOCK_USERS.find(u => u.id === demoUser.id)) {
            MOCK_USERS.push(demoUser);
            usersUpdated = true;
        }
    });
    if (usersUpdated) persistUsers();

    let schoolsUpdated = false;
    INITIAL_SCHOOLS.forEach(demoSchool => {
        if (!MOCK_SCHOOLS.find(s => s.id === demoSchool.id)) {
            MOCK_SCHOOLS.push(demoSchool);
            schoolsUpdated = true;
        }
    });
    if (schoolsUpdated) persistSchools();

    let providersUpdated = false;
    INITIAL_PROVIDERS.forEach(demoProvider => {
        if (!MOCK_PROVIDERS.find(p => p.id === demoProvider.id)) {
            MOCK_PROVIDERS.push(demoProvider);
            providersUpdated = true;
        }
    });
    if (providersUpdated) persistProviders();
    
    let studentsUpdated = false;
    INITIAL_STUDENTS.forEach(demoStudent => {
        if (!MOCK_STUDENTS.find(s => s.id === demoStudent.id)) {
            MOCK_STUDENTS.push(demoStudent);
            studentsUpdated = true;
        }
    });
    if (studentsUpdated) persistStudents();
};
ensureDemoData();


let MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [];
let MOCK_FEATURES: Feature[] = [];
let MOCK_FEE_CONFIG: FeeConfig = { percentage: 5, applyToSalesType: 'Both', applyToPaymentMethods: [] };
let MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [];
let MOCK_EXTERNAL_ENROLLMENTS: ExternalEnrollment[] = [];
let MOCK_GRADE_LEVELS: GradeLevel[] = [{ id: 'gl-1', schoolId: 'school-1', name: '1ro Primaria', order: 1 }];
let MOCK_CLASSROOMS: Classroom[] = [];
let MOCK_PAYMENT_TRANSACTIONS: PaymentTransaction[] = [];
let MOCK_RECURRING_PAYMENTS: RecurringPayment[] = [];
let MOCK_PAYMENT_GROUPS: PaymentGroup[] = [];
// let MOCK_POSITIONS: Position[] = []; // Moved to persistent
// let MOCK_PROVIDER_POSITIONS: ProviderPosition[] = []; // Moved to persistent
let MOCK_BENEFITS: Benefit[] = [];
let MOCK_PRODUCT_CATEGORIES: ProductCategory[] = [];
let MOCK_MEDIA_POSTS: MediaPost[] = [];
let MOCK_CIRCULARS: Circular[] = [];
let MOCK_LIBRARY_ITEMS: LibraryItem[] = [];
let MOCK_COURSES: Course[] = [];
let MOCK_STUDENT_COURSE_PROGRESS: StudentCourseProgress[] = [];
let MOCK_VIRTUAL_TUTOR_CONFIG: VirtualTutorConfig = { schoolId: 'school-1', isEnabled: false, welcomeMessage: '', tutorUrl: '' };
let MOCK_LANDING_PAGE_CONFIG: LandingPageConfig = {
    logoHeaderUrl: '', logoHeroUrl: '', logoLoginUrl: '', heroBannerUrl: '', headerButtonText: '', heroTitle: '', heroSubtitle: '', heroDescription: '', heroCtaText: '',
    connectionsTitle: '', connectionsSubtitle: '', connectionsFeature1: { iconUrl: '', text: '' }, connectionsFeature2: { iconUrl: '', text: '' }, connectionsFeature3: { iconUrl: '', text: '' }, connectionsClosing: '', connectionsBenefit: '',
    magicTitle: '', magicSubtitle: '', magicFeature1: { icon: '', text: '' }, magicFeature2: { icon: '', text: '' }, magicFeature3: { icon: '', text: '' }, magicFeature4: { icon: '', text: '' },
    learningTitle: '', learningSubtitle: '', learningFeature1: { icon: '', text: '' }, learningFeature2: { icon: '', text: '' }, learningFeature3: { icon: '', text: '' }, learningFeature4: { icon: '', text: '' },
    characterTitle: '', characterDescription: '', characterQuote: '', characterImageUrl: '',
    finalCtaTitle: '', finalCtaSubtitle: '', finalCtaButton1: '', finalCtaButton2: '', demoRequestEmail: ''
};
let MOCK_CONVERSATIONS: Conversation[] = [];
let MOCK_MESSAGES: Message[] = [];
let MOCK_COMMENTS: Comment[] = [];
let MOCK_ATTENDANCE: AttendanceRecord[] = [];
let MOCK_PICKUP_RECORDS: PickupRecord[] = [];

// In-memory storage for live pickups (volatile, just for the session/demo)
// let MOCK_LIVE_PICKUPS: { studentId: string, studentName: string, parentName: string, eta: number, timestamp: number }[] = []; // Moved to persistent

export const api = {
    getLandingPageConfig: async (): Promise<LandingPageConfig> => { await delay(); return MOCK_LANDING_PAGE_CONFIG; },
    updateLandingPageConfig: async (config: LandingPageConfig): Promise<void> => { await delay(); MOCK_LANDING_PAGE_CONFIG = config; },
    login: async (email: string, password?: string): Promise<UserWithPassword | undefined> => { 
        await delay(); 
        // Find by email OR id (for impersonation fallback)
        return MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() || u.id === email); 
    },
    getUserById: async (id: string): Promise<User | undefined> => { await delay(); return MOCK_USERS.find(u => u.id === id); },
    
    // FIX: Correctly retrieve permissions based on user's position or default role
    getPermissionsForUser: async (userId: string): Promise<(Permission | ProviderPermission)[]> => { 
        await delay(); 
        const user = MOCK_USERS.find(u => u.id === userId);
        if (!user) return [];
        
        // If user has a position assigned, get permissions from that position
        if (user.positionId) {
            const position = MOCK_POSITIONS.find(p => p.id === user.positionId);
            if (position) return position.permissions;
            
            // Also check provider positions
            const provPosition = MOCK_PROVIDER_POSITIONS.find(p => p.id === user.positionId);
            if (provPosition) return provPosition.permissions;
        }

        // Fallback for Admin roles if no position is assigned (Super Admin behavior)
        if (user.role === Role.ProviderAdmin) {
            // Special case: POS Demo user only gets POS permission
            if (user.email === 'pos.demo@demo.com') {
                return [ProviderPermission.UsePOS];
            }
            // General Provider Admin gets ALL provider permissions
            return Object.values(ProviderPermission);
        }

        if (user.role === Role.SchoolAdmin) {
             // General School Admin gets ALL school permissions
             return Object.values(Permission);
        }
        
        if (user.role === Role.Teacher) {
            // Default basic permissions for teachers if no position assigned
            return [Permission.ViewPickupInfo, Permission.SendCommunications, Permission.ManageAttendance];
        }
        
        return []; 
    },
    
    getUsers: async (): Promise<User[]> => { await delay(); return MOCK_USERS; },
    createUser: async (userData: any): Promise<{ newUser: UserWithPassword }> => { 
        await delay(); 
        const newUser = { ...userData, id: `user-${Date.now()}`, password: 'tempPassword123' }; 
        MOCK_USERS.push(newUser); 
        persistUsers(); 
        return { newUser }; 
    },
    updateUser: async (user: User): Promise<void> => { 
        await delay(); 
        const idx = MOCK_USERS.findIndex(u => u.id === user.id); 
        if(idx !== -1) {
            MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...user };
            persistUsers(); 
        }
    },
    // ADDED: Reset password function
    resetUserPassword: async (userId: string): Promise<string> => {
        await delay();
        const idx = MOCK_USERS.findIndex(u => u.id === userId);
        if (idx !== -1) {
            const newPassword = Math.random().toString(36).slice(-8);
            MOCK_USERS[idx] = { ...MOCK_USERS[idx], password: newPassword };
            persistUsers();
            return newPassword;
        }
        throw new Error("Usuario no encontrado");
    },
    
    getSchools: async (): Promise<School[]> => { await delay(); return MOCK_SCHOOLS; },
    createSchool: async (data: SchoolCreationData): Promise<{ school: School, admin: UserWithPassword }> => { 
        await delay(); 
        // Create new school
        const newSchool = { ...data, id: `school-${Date.now()}`, acceptedPaymentMethods: [] };
        MOCK_SCHOOLS.push(newSchool);
        persistSchools();
        
        // Create admin for the school
        const adminUser: UserWithPassword = {
            id: `admin-${Date.now()}`,
            name: data.directorName,
            email: data.email, // Use school email as admin email for simplicity in demo
            role: Role.SchoolAdmin,
            schoolId: newSchool.id,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.directorName)}`,
            password: 'tempPassword123'
        };
        MOCK_USERS.push(adminUser);
        persistUsers();
        
        return { school: newSchool, admin: adminUser }; 
    }, 
    updateSchool: async (school: School): Promise<void> => { 
        await delay();
        const idx = MOCK_SCHOOLS.findIndex(s => s.id === school.id);
        if(idx !== -1) {
            MOCK_SCHOOLS[idx] = school;
            persistSchools();
        }
    },
    suspendSchool: async (id: string): Promise<void> => { await delay(); },
    updateSchoolSubscription: async (id: string, plan: SubscriptionPlanName): Promise<void> => { await delay(); },
    updateSchoolPaymentMethods: async (id: string, methods: PaymentMethod[]): Promise<void> => { await delay(); },

    getProviders: async (): Promise<Provider[]> => { await delay(); return MOCK_PROVIDERS; },
    getProviderById: async (id: string): Promise<Provider | undefined> => { await delay(); return MOCK_PROVIDERS.find(p => p.id === id); },
    createProvider: async (data: ProviderCreationData): Promise<{ provider: Provider, admin: UserWithPassword }> => { 
        await delay(); 
        const newProvider = { ...data, id: `provider-${Date.now()}`, feeConfig: null };
        MOCK_PROVIDERS.push(newProvider);
        persistProviders();
        
        const adminUser: UserWithPassword = {
            id: `prov-admin-${Date.now()}`,
            name: data.contactName,
            email: data.email,
            role: Role.ProviderAdmin,
            providerId: newProvider.id,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.contactName)}`,
            password: 'tempPassword123'
        };
        MOCK_USERS.push(adminUser);
        persistUsers();
        return { provider: newProvider, admin: adminUser }; 
    }, 
    updateProvider: async (provider: Provider): Promise<void> => { 
        await delay();
        const idx = MOCK_PROVIDERS.findIndex(p => p.id === provider.id);
        if(idx !== -1) {
            MOCK_PROVIDERS[idx] = provider;
            persistProviders();
        }
    },
    suspendProvider: async (id: string): Promise<void> => { await delay(); },
    getProvidersBySchool: async (schoolId: string): Promise<Provider[]> => { await delay(); return MOCK_PROVIDERS; }, // Simplified linkage
    getSchoolsByProvider: async (providerId: string): Promise<School[]> => { await delay(); return MOCK_SCHOOLS; }, // Simplified linkage

    getLinks: async (): Promise<SchoolProviderLink[]> => { await delay(); return MOCK_LINKS; },
    createLink: async (schoolId: string, providerId: string): Promise<void> => { 
        await delay(); 
        MOCK_LINKS.push({ id: `link-${Date.now()}`, schoolId, providerId });
        persistLinks();
    },
    deleteLink: async (id: string): Promise<void> => { 
        await delay(); 
        MOCK_LINKS = MOCK_LINKS.filter(l => l.id !== id);
        persistLinks();
    },

    getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => { await delay(); return MOCK_SUBSCRIPTION_PLANS; },
    getFeatures: async (): Promise<Feature[]> => { await delay(); return MOCK_FEATURES; },
    updateSubscriptionPlan: async (plan: SubscriptionPlan): Promise<void> => { await delay(); },

    getFeeConfig: async (): Promise<FeeConfig> => { await delay(); return MOCK_FEE_CONFIG; },
    updateFeeConfig: async (config: FeeConfig): Promise<void> => { await delay(); MOCK_FEE_CONFIG = config; },

    getEmailTemplates: async (): Promise<EmailTemplate[]> => { await delay(); return MOCK_EMAIL_TEMPLATES; },
    updateEmailTemplate: async (template: EmailTemplate): Promise<void> => { await delay(); },

    getActivitiesBySchool: async (schoolId: string): Promise<Activity[]> => { await delay(); return MOCK_ACTIVITIES.filter(a => a.schoolId === schoolId); },
    createActivity: async (data: ActivityCreationData): Promise<void> => { 
        await delay(); 
        MOCK_ACTIVITIES.push({ ...data, id: `act-${Date.now()}`, enrolledStudentIds: [], status: Status.Pending });
        persistActivities();
    },
    updateActivity: async (activity: Activity): Promise<void> => { 
        await delay(); 
        const idx = MOCK_ACTIVITIES.findIndex(a => a.id === activity.id); 
        if(idx !== -1) {
            MOCK_ACTIVITIES[idx] = activity;
            persistActivities();
        }
    },
    sendCancellationNotification: async (activity: Activity, message: string): Promise<void> => { await delay(); },
    getEnrolledActivities: async (studentIds: string[]): Promise<(Activity & { paymentStatus?: PaymentStatus })[]> => { await delay(); return []; },
    enrollStudentInActivity: async (activityId: string, studentId: string): Promise<void> => { 
        await delay(); 
        const activity = MOCK_ACTIVITIES.find(a => a.id === activityId);
        if (activity && !activity.enrolledStudentIds.includes(studentId)) {
            activity.enrolledStudentIds.push(studentId);
            persistActivities();
        }
    },
    getEnrollmentsForActivity: async (activityId: string): Promise<ActivityEnrollment[]> => { 
        await delay(); 
        const activity = MOCK_ACTIVITIES.find(a => a.id === activityId);
        if(!activity) return [];
        return activity.enrolledStudentIds.map(sid => ({
            id: `enroll-${sid}`,
            activityId: activityId,
            studentId: sid,
            enrollmentDate: new Date().toISOString(),
            paymentStatus: PaymentStatus.Pending
        })); 
    },

    getStudentsBySchool: async (schoolId: string): Promise<Student[]> => { await delay(); return MOCK_STUDENTS.filter(s => s.schoolId === schoolId); },
    getStudentById: async (id: string): Promise<Student | null> => { await delay(); return MOCK_STUDENTS.find(s => s.id === id) || null; },
    createStudent: async (data: any): Promise<void> => { 
        await delay(); 
        MOCK_STUDENTS.push({ ...data, id: `stu-${Date.now()}`, profileStatus: 'Pending', authorizedPickups: [] });
        persistStudents();
    },
    updateStudentProfile: async (student: Student): Promise<void> => { 
        await delay(); 
        const idx = MOCK_STUDENTS.findIndex(s => s.id === student.id); 
        if(idx !== -1) {
            MOCK_STUDENTS[idx] = student;
            persistStudents();
        }
    },
    getStudentsByParent: async (parentId: string): Promise<Student[]> => { await delay(); return MOCK_STUDENTS.filter(s => s.parentId === parentId); },
    getStudentsByTeacher: async (teacherId: string): Promise<Student[]> => { await delay(); return MOCK_STUDENTS; }, // Simplified
    bulkImportParentsAndStudents: async (schoolId: string, data: any[]): Promise<{createdParents: number, createdStudents: number, errors: string[]}> => { 
        await delay(1000); 
        let createdParents = 0;
        let createdStudents = 0;
        const errors: string[] = [];

        // Helper to find existing parent by email
        const findParent = (email: string) => MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.role === Role.Parent);

        for (const row of data) {
            try {
                // Validate minimal required fields again just in case
                if (!row.parentEmail || !row.studentName) {
                    continue;
                }

                // 1. Process Parent
                let parentId = '';
                let parent = findParent(row.parentEmail);
                
                if (parent) {
                    parentId = parent.id;
                    // In a real app, we might check if parent is linked to this school, but for mock we assume global parent identity
                } else {
                    // Create Parent
                    const newParentId = `parent-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                    const newParent: UserWithPassword = {
                        id: newParentId,
                        schoolId: schoolId,
                        name: row.parentName || row.parentEmail.split('@')[0], // Fallback name
                        email: row.parentEmail.trim(),
                        role: Role.Parent,
                        idNumber: row.parentCedula,
                        password: 'temp', // Default password for bulk import
                        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.parentName || 'Parent')}&background=random`
                    };
                    MOCK_USERS.push(newParent);
                    parentId = newParentId;
                    createdParents++;
                }

                // 2. Process Student
                // Check duplicate student by name within the same parent to avoid re-importing duplicates
                const existingStudent = MOCK_STUDENTS.find(s => 
                    s.name.toLowerCase() === row.studentName.toLowerCase().trim() && 
                    s.parentId === parentId
                );
                
                if (!existingStudent) {
                    const newStudentId = `stu-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                    const newStudent: Student = {
                        id: newStudentId,
                        schoolId: schoolId,
                        parentId: parentId,
                        name: row.studentName.trim(),
                        idNumber: row.studentCedula || '',
                        gradeLevel: row.studentGrade || 'Sin Asignar',
                        dateOfBirth: new Date().toISOString().split('T')[0], // Default to today if unknown
                        profileStatus: 'Pending',
                        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.studentName)}&background=random`,
                        emergencyContacts: '',
                        healthSummary: '',
                        familyInfo: { birthplace: '', homeAddress: '', homePhone: '', siblings: '', childPosition: '', parentsMaritalStatus: 'married', livesWith: '', timeWithMother: '', timeWithFather: '' },
                        healthHistory: { birthConditions: { breastfed: false, pacifier: false, bedWetting: false }, general: { pediatricianName: '', emergencyContactName: '', allergies: '', currentTreatments: '' } },
                        developmentProfile: { emotional: { frequentBehavior: '' }, social: { favoriteToys: '' }, motor: { walkedAge: '' }, language: { spokeAge: '' } },
                        authorizedPickups: []
                    };
                    MOCK_STUDENTS.push(newStudent);
                    createdStudents++;
                }

            } catch (e: any) {
                console.error("Error importing row", row, e);
                errors.push(`Error en fila ${row.studentName}: ${e.message}`);
            }
        }
        
        persistUsers();
        persistStudents();

        return { createdParents, createdStudents, errors }; 
    },

    getParentsBySchool: async (schoolId: string): Promise<User[]> => { await delay(); return MOCK_USERS.filter(u => u.role === Role.Parent && u.schoolId === schoolId); },
    createParent: async (data: any): Promise<{ newUser: UserWithPassword }> => { 
        await delay(); 
        const newUser = { ...data, id: `parent-${Date.now()}`, role: Role.Parent, password: 'temp' }; 
        MOCK_USERS.push(newUser); 
        persistUsers();
        return { newUser }; 
    },
    updateStudentParentLinks: async (parentId: string, studentIds: string[]): Promise<void> => { 
        await delay();
        // update students
        studentIds.forEach(sid => {
            const s = MOCK_STUDENTS.find(st => st.id === sid);
            if(s) {
                s.parentId = parentId;
            }
        });
        persistStudents();
    },

    getStaffBySchool: async (schoolId: string): Promise<User[]> => { await delay(); return MOCK_USERS.filter(u => (u.role === Role.Teacher || u.role === Role.SchoolAdmin) && u.schoolId === schoolId); },
    getPositions: async (schoolId: string): Promise<Position[]> => { await delay(); return MOCK_POSITIONS; },
    createPosition: async (data: any): Promise<void> => { 
        await delay(); 
        MOCK_POSITIONS.push({ ...data, id: `pos-${Date.now()}` });
        persistPositions();
    },
    updatePosition: async (position: Position): Promise<void> => { 
        await delay();
        const idx = MOCK_POSITIONS.findIndex(p => p.id === position.id);
        if (idx !== -1) {
            MOCK_POSITIONS[idx] = position;
            persistPositions();
        }
    },
    assignCreditToStaff: async (userId: string, amount: number): Promise<void> => { await delay(); },
    getStaffConsumptionHistory: async (userId: string): Promise<Order[]> => { await delay(); return MOCK_ORDERS.filter(o => o.staffId === userId); },

    getBenefitsBySchool: async (schoolId: string): Promise<Benefit[]> => { await delay(); return MOCK_BENEFITS; },
    createBenefit: async (data: any): Promise<void> => { await delay(); MOCK_BENEFITS.push({ ...data, id: `ben-${Date.now()}` }); },
    updateBenefit: async (benefit: Benefit): Promise<void> => { await delay(); },

    getCatalogsBySchool: async (schoolId: string): Promise<Catalog[]> => { await delay(); return MOCK_CATALOGS.filter(c => c.schoolId === schoolId); },
    createCatalog: async (data: any): Promise<void> => { 
        await delay(); 
        MOCK_CATALOGS.push({ ...data, id: `cat-${Date.now()}` });
        persistCatalogs();
    },
    updateCatalog: async (catalog: Catalog): Promise<void> => { await delay(); },

    getExternalEnrollmentsBySchool: async (schoolId: string): Promise<ExternalEnrollment[]> => { await delay(); return MOCK_EXTERNAL_ENROLLMENTS.filter(e => e.schoolId === schoolId); },
    updateExternalEnrollmentStatus: async (id: string, status: 'Confirmed' | 'Cancelled'): Promise<void> => { await delay(); },

    getGradeLevelsBySchool: async (schoolId: string): Promise<GradeLevel[]> => { await delay(); return MOCK_GRADE_LEVELS.filter(g => g.schoolId === schoolId); },
    createGradeLevel: async (data: any): Promise<void> => { await delay(); MOCK_GRADE_LEVELS.push({ ...data, id: `gl-${Date.now()}` }); },
    updateGradeLevel: async (grade: GradeLevel): Promise<void> => { await delay(); },

    getClassroomsBySchool: async (schoolId: string): Promise<Classroom[]> => { await delay(); return MOCK_CLASSROOMS.filter(c => c.schoolId === schoolId); },
    createClassroom: async (data: any): Promise<void> => { await delay(); MOCK_CLASSROOMS.push({ ...data, id: `cls-${Date.now()}` }); },
    updateClassroom: async (classroom: Classroom): Promise<void> => { await delay(); },
    promoteStudents: async (fromClassId: string, toClassId: string, studentIds: string[]): Promise<void> => { await delay(); },

    getPaymentTransactionsBySchool: async (schoolId: string): Promise<PaymentTransaction[]> => { await delay(); return MOCK_PAYMENT_TRANSACTIONS.filter(t => t.schoolId === schoolId); },
    updatePaymentTransactionStatus: async (id: string, status: PaymentStatus): Promise<void> => { await delay(); },
    uploadPaymentProof: async (transactionId: string, proofBase64: string, method?: PaymentMethod): Promise<void> => {
        await delay();
        const transaction = MOCK_PAYMENT_TRANSACTIONS.find(t => t.id === transactionId || t.referenceId === transactionId);
        if (transaction) {
            transaction.status = PaymentStatus.ProofUploaded;
            transaction.proofUrl = proofBase64;
            if (method) {
                transaction.method = method;
            }
        }
    },

    getRecurringPayments: async (schoolId: string): Promise<RecurringPayment[]> => { await delay(); return MOCK_RECURRING_PAYMENTS.filter(r => r.schoolId === schoolId); },
    createRecurringPayment: async (data: any): Promise<void> => { await delay(); MOCK_RECURRING_PAYMENTS.push({ ...data, id: `rp-${Date.now()}` }); },

    getPaymentGroupsBySchool: async (schoolId: string): Promise<PaymentGroup[]> => { await delay(); return MOCK_PAYMENT_GROUPS.filter(pg => pg.schoolId === schoolId); },
    createPaymentGroup: async (data: any): Promise<void> => { await delay(); MOCK_PAYMENT_GROUPS.push({ ...data, id: `pg-${Date.now()}` }); },

    getProviderPositions: async (providerId: string): Promise<ProviderPosition[]> => { await delay(); return MOCK_PROVIDER_POSITIONS; },
    createProviderPosition: async (data: any): Promise<void> => { 
        await delay(); 
        MOCK_PROVIDER_POSITIONS.push({ ...data, id: `ppos-${Date.now()}` });
        persistProviderPositions();
    },
    updateProviderPosition: async (position: ProviderPosition): Promise<void> => { 
        await delay();
        const idx = MOCK_PROVIDER_POSITIONS.findIndex(p => p.id === position.id);
        if (idx !== -1) {
            MOCK_PROVIDER_POSITIONS[idx] = position;
            persistProviderPositions();
        }
    },
    getUsersByProvider: async (providerId: string): Promise<User[]> => { await delay(); return MOCK_USERS.filter(u => u.providerId === providerId); },

    getProviderCatalogsByProvider: async (providerId: string): Promise<ProviderCatalog[]> => { await delay(); return MOCK_PROVIDER_CATALOGS.filter(c => c.providerId === providerId); },
    createProviderCatalog: async (data: any): Promise<void> => { 
        await delay(); 
        MOCK_PROVIDER_CATALOGS.push({ ...data, id: `pcat-${Date.now()}` });
        persistProviderCatalogs();
    },
    updateProviderCatalog: async (catalog: ProviderCatalog): Promise<void> => { 
        await delay(); 
        const idx = MOCK_PROVIDER_CATALOGS.findIndex(c => c.id === catalog.id);
        if (idx !== -1) {
            MOCK_PROVIDER_CATALOGS[idx] = catalog;
            persistProviderCatalogs();
        }
    },

    getProductsByProvider: async (providerId: string): Promise<Product[]> => { await delay(); return MOCK_PRODUCTS.filter(p => p.providerId === providerId); },
    createProduct: async (data: any): Promise<void> => { 
        await delay(); 
        MOCK_PRODUCTS.push({ ...data, id: `prod-${Date.now()}` });
        persistProducts();
    },
    updateProduct: async (product: Product): Promise<void> => { await delay(); },
    deleteProduct: async (id: string): Promise<void> => { await delay(); },

    getProductCategoriesByProvider: async (providerId: string): Promise<ProductCategory[]> => { await delay(); return MOCK_PRODUCT_CATEGORIES.filter(c => c.providerId === providerId); },
    createProductCategory: async (data: any): Promise<void> => { await delay(); MOCK_PRODUCT_CATEGORIES.push({ ...data, id: `cat-${Date.now()}` }); },
    updateProductCategory: async (category: ProductCategory): Promise<void> => { await delay(); },
    deleteProductCategory: async (id: string): Promise<void> => { await delay(); },

    getOrdersByProvider: async (providerId: string): Promise<Order[]> => { await delay(); return MOCK_ORDERS.filter(o => o.providerId === providerId); },
    createOrder: async (orderData: any, pin?: string): Promise<void> => { 
        await delay(); 
        // Deduct stock
        orderData.items.forEach((item: any) => {
            const productIndex = MOCK_PRODUCTS.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                MOCK_PRODUCTS[productIndex].stock -= item.quantity;
            }
        });
        persistProducts();

        MOCK_ORDERS.push({ ...orderData, id: `ord-${Date.now()}` });
        persistOrders();
    },
    updateOrder: async (order: Order): Promise<void> => { 
        await delay(); 
        const idx = MOCK_ORDERS.findIndex(o => o.id === order.id);
        if(idx !== -1) {
            MOCK_ORDERS[idx] = order;
            persistOrders();
        }
    },
    confirmBankTransferOrder: async (orderId: string): Promise<void> => { await delay(); },
    rejectBankTransferOrder: async (orderId: string): Promise<void> => { await delay(); },
    getOrdersByParent: async (parentId: string): Promise<Order[]> => { await delay(); return MOCK_ORDERS.filter(o => o.parentId === parentId); },

    getMediaPosts: async (schoolId: string): Promise<MediaPost[]> => { await delay(); return MOCK_MEDIA_POSTS.filter(p => p.schoolId === schoolId); },
    createMediaPost: async (schoolId: string, authorId: string, imageUrl: string, caption: string): Promise<void> => { await delay(); MOCK_MEDIA_POSTS.push({ id: `post-${Date.now()}`, schoolId, authorId, imageUrl, caption, likes: [], timestamp: new Date().toISOString() }); },
    toggleLikeOnPost: async (postId: string, userId: string): Promise<MediaPost> => { await delay(); return MOCK_MEDIA_POSTS[0]; }, // Simplified
    getCommentsForPost: async (postId: string): Promise<Comment[]> => { await delay(); return MOCK_COMMENTS; },
    addCommentToPost: async (postId: string, authorId: string, text: string): Promise<void> => { await delay(); },

    getConversationsForUser: async (userId: string): Promise<Conversation[]> => { 
        await delay(); 
        return MOCK_CONVERSATIONS.filter(c => c.participantIds.includes(userId)); 
    },
    getMessagesForConversation: async (conversationId: string): Promise<Message[]> => { 
        await delay(); 
        return MOCK_MESSAGES.filter(m => m.conversationId === conversationId); 
    },
    sendMessage: async (conversationId: string, senderId: string, content: string): Promise<Message> => { 
        await delay(); 
        const newMessage: Message = { 
            id: `msg-${Date.now()}`, 
            conversationId, 
            senderId, 
            content, 
            timestamp: new Date().toISOString(), 
            type: 'text' 
        };
        MOCK_MESSAGES.push(newMessage);
        
        // Update conversation last message
        const convIndex = MOCK_CONVERSATIONS.findIndex(c => c.id === conversationId);
        if (convIndex !== -1) {
            MOCK_CONVERSATIONS[convIndex].lastMessage = {
                text: content,
                timestamp: newMessage.timestamp
            };
        }
        
        return newMessage;
    },
    createGroupConversation: async (creatorId: string, name: string, participantIds: string[]): Promise<Conversation> => { 
        await delay(); 
        const newConversation: Conversation = { 
            id: `conv-${Date.now()}`, 
            name, 
            participantIds: [creatorId, ...participantIds], 
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`, 
            isGroup: true, 
            lastMessage: { text: '', timestamp: new Date().toISOString() }, 
            unreadCount: 0 
        };
        MOCK_CONVERSATIONS.push(newConversation);
        return newConversation;
    },

    getCirculars: async (schoolId: string): Promise<Circular[]> => { await delay(); return MOCK_CIRCULARS.filter(c => c.schoolId === schoolId); },
    createCircular: async (data: CircularCreationData): Promise<void> => { await delay(); MOCK_CIRCULARS.push({ ...data, id: `circ-${Date.now()}`, timestamp: new Date().toISOString() }); },
    updateCircular: async (circular: Circular): Promise<void> => { await delay(); },

    getLibraryBySchool: async (schoolId: string): Promise<LibraryItem[]> => { await delay(); return MOCK_LIBRARY_ITEMS.filter(l => l.schoolId === schoolId); },
    createLibraryItem: async (data: any): Promise<void> => { await delay(); MOCK_LIBRARY_ITEMS.push({ ...data, id: `lib-${Date.now()}`, createdAt: new Date().toISOString() }); },
    deleteLibraryItem: async (id: string): Promise<void> => { await delay(); },

    getCoursesBySchool: async (schoolId: string): Promise<Course[]> => { await delay(); return MOCK_COURSES.filter(c => c.schoolId === schoolId); },
    createCourse: async (data: any): Promise<void> => { await delay(); MOCK_COURSES.push({ ...data, id: `crs-${Date.now()}` }); },
    updateCourse: async (course: Course): Promise<void> => { await delay(); },
    deleteCourse: async (id: string): Promise<void> => { await delay(); },
    getStudentCourseProgress: async (studentId: string): Promise<StudentCourseProgress[]> => { await delay(); return MOCK_STUDENT_COURSE_PROGRESS; },

    getVirtualTutorConfig: async (schoolId: string): Promise<VirtualTutorConfig | null> => { await delay(); return MOCK_VIRTUAL_TUTOR_CONFIG; },
    updateVirtualTutorConfig: async (schoolId: string, config: VirtualTutorConfig): Promise<void> => { await delay(); MOCK_VIRTUAL_TUTOR_CONFIG = config; },

    // UPDATED: Live Pickup Logic with Persistence
    getLivePickupStatusForTeacher: async (teacherId: string): Promise<any[]> => { 
        await delay(); 
        return MOCK_LIVE_PICKUPS; 
    },
    recordPickup: async (teacherId: string, studentId: string, parentName: string, type: PickupType): Promise<void> => { 
        await delay(); 
        // Remove from live list
        MOCK_LIVE_PICKUPS = MOCK_LIVE_PICKUPS.filter(p => p.studentId !== studentId);
        persistLivePickups();
        // In a real app, here we would also save to history (MOCK_PICKUP_RECORDS)
    },
    getPickupHistoryForReport: async (teacherId: string, startDate: string, endDate: string): Promise<PickupRecord[]> => { await delay(); return MOCK_PICKUP_RECORDS; },
    
    startParentPickup: async (parentId: string, studentId: string): Promise<void> => { 
        await delay();
        const student = MOCK_STUDENTS.find(s => s.id === studentId);
        const parent = MOCK_USERS.find(u => u.id === parentId);
        if (student && parent) {
            // Add to live list
            // Check if already there to avoid duplicates
            if (!MOCK_LIVE_PICKUPS.find(p => p.studentId === studentId)) {
                MOCK_LIVE_PICKUPS.push({
                    studentId,
                    studentName: student.name,
                    parentName: parent.name,
                    eta: 5, // Mock ETA
                    timestamp: Date.now()
                });
                persistLivePickups();
            }
        }
    },

    recordAttendance: async (studentId: string, date: string, status: AttendanceStatus, excused: boolean, notes: string): Promise<void> => { await delay(); },
    getAttendanceForStudentsByDateRange: async (studentIds: string[], startDate: string, endDate: string): Promise<AttendanceRecord[]> => { await delay(); return MOCK_ATTENDANCE; },

    awardStar: async (studentId: string, reason: string, awardedBy: string): Promise<void> => { await delay(); },
    addInternalNote: async (studentId: string, note: string, authorId: string): Promise<void> => { await delay(); },
    addFundsToStudent: async (parentId: string, studentId: string, amount: number): Promise<void> => { await delay(); },

    sendDemoRequest: async (email: string, message: string, targetEmail: string): Promise<void> => { await delay(); },

    // ADDED: Saved Cards Methods
    addSavedCard: async (userId: string, cardData: any): Promise<void> => {
        await delay();
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) {
            const newCard = {
                id: `card-${Date.now()}`,
                brand: cardData.brand || 'Visa',
                last4: cardData.last4,
                expiryMonth: cardData.expiryMonth,
                expiryYear: cardData.expiryYear,
                holderName: cardData.holderName
            };
            user.savedCards = [...(user.savedCards || []), newCard as any];
            persistUsers();
        }
    },
    removeSavedCard: async (userId: string, cardId: string): Promise<void> => {
        await delay();
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user && user.savedCards) {
            user.savedCards = user.savedCards.filter(c => c.id !== cardId);
            persistUsers();
        }
    }
};

export { MOCK_USERS };
