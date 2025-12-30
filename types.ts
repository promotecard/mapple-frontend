
// This file contains all the core type definitions for the Mapple School application.

export enum Role {
  GlobalAdmin = 'Global Admin',
  SchoolAdmin = 'School Admin',
  Parent = 'Parent',
  Teacher = 'Teacher',
  ProviderAdmin = 'Provider Admin',
  Student = 'Student',
}

export enum Status {
  Active = 'Active',
  Pending = 'Pending',
  Suspended = 'Suspended',
  Deleted = 'Deleted',
  // for activities
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled',
  Rescheduled = 'Rescheduled',
}

export enum PaymentMethod {
  CreditCard = 'CreditCard',
  BankTransfer = 'BankTransfer',
  Cash = 'Cash',
  Voucher = 'Voucher',
  CorporateCredit = 'CorporateCredit',
  StudentBalance = 'StudentBalance',
}

export enum SubscriptionPlanName {
  Gratis = 'Gratis',
  Basic = 'Basic',
  Premium = 'Premium',
}

export enum EmailTemplateType {
  NewSchoolCredentials = 'NewSchoolCredentials',
  NewProviderCredentials = 'NewProviderCredentials',
  NewParentCredentials = 'NewParentCredentials',
  ActivityCancellation = 'ActivityCancellation',
}

export enum SalesType {
  POS = 'POS',
  Online = 'Online',
  Both = 'Both',
}

export enum Permission {
    ViewPickupInfo = 'ViewPickupInfo',
    SendCommunications = 'SendCommunications',
    ManageAttendance = 'ManageAttendance',
}

export enum ProviderPermission {
    ViewDashboard = 'ViewDashboard',
    ManageCatalogs = 'ManageCatalogs',
    ManageProducts = 'ManageProducts',
    ManageUsers = 'ManageUsers',
    ViewOrders = 'ViewOrders',
    ViewReports = 'ViewReports',
    UsePOS = 'UsePOS',
}

export enum AttendanceStatus {
    Present = 'Present',
    Late = 'Late',
    Absent = 'Absent',
}

export enum PickupType {
    Notified = 'Notified',
    Scheduled = 'Scheduled',
}

export enum PaymentStatus {
    Paid = 'Paid',
    Pending = 'Pending',
    Confirmed = 'Confirmed',
    ProofUploaded = 'ProofUploaded',
    Rejected = 'Rejected',
    Overdue = 'Overdue',
}

export interface GuardianInfo {
    fullName: string;
    profession: string;
    occupation: string;
    workplace: string;
    workPhone: string;
    cellPhone: string;
    email: string;
}

export interface Benefit {
  id: string;
  schoolId: string;
  name: string;
  subsidyPercentage?: number; // 0-100
  subsidyAmount?: number;
}

export interface CustomFieldDefinition {
  id: string;
  schoolId: string;
  appliesTo: 'parent' | 'student';
  name: string;
  type: 'text' | 'number' | 'date';
}

export interface SavedCard {
    id: string;
    brand: 'Visa' | 'MasterCard' | 'Amex' | 'Discover';
    last4: string;
    expiryMonth: string;
    expiryYear: string;
    holderName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
  status?: Status; // Status added for suspension logic
  schoolId?: string;
  providerId?: string;
  studentId?: string;
  // Parent specific
  idNumber?: string;
  phone?: string;
  otherPhone?: string;
  address?: string;
  profession?: string;
  fatherInfo?: GuardianInfo;
  motherInfo?: GuardianInfo;
  savedCards?: SavedCard[];
  // Staff specific
  positionId?: string;
  corporateDebt?: number;
  creditLimit?: number;
  benefitId?: string;
  pin?: string;
  customFields?: { [key: string]: string };
}

export interface UserWithPassword extends User {
    password?: string;
}

export interface School {
  id: string;
  name: string;
  taxId: string;
  address: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  directorName: string;
  status: Status;
  subscriptionPlan?: SubscriptionPlanName;
  acceptedPaymentMethods: PaymentMethod[];
}

export type SchoolCreationData = Omit<School, 'id' | 'acceptedPaymentMethods' | 'subscriptionPlan'>;


export interface Provider {
  id: string;
  businessName: string;
  taxId: string;
  address: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  contactName: string;
  status: Status;
  salesType: SalesType;
  feeConfig: FeeConfig | null;
  posSettings?: {
    taxRate: number; // e.g., 18 for 18%
  };
  pinnedProductIds?: string[];
}
export type ProviderCreationData = Omit<Provider, 'id' | 'feeConfig' | 'posSettings' | 'pinnedProductIds'>;

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: EmailTemplateType;
}

export interface SchoolProviderLink {
  id: string;
  schoolId: string;
  providerId: string;
}

export interface FeeConfig {
  percentage: number;
  applyToSalesType: 'POS' | 'Online' | 'Both';
  applyToPaymentMethods: PaymentMethod[];
}

export interface SubscriptionPlan {
    id: string;
    name: SubscriptionPlanName;
    price: number;
    features: { [featureId: string]: boolean };
}

export interface Feature {
    id: string;
    name: string;
    description: string;
}

export interface Star {
    id: string;
    reason: string;
    awardedBy: string; // userId
    timestamp: string;
}

export interface AuthorizedPickup {
    id: string;
    fullName: string;
    idNumber: string;
}

export interface Student {
    id: string;
    name: string;
    avatarUrl: string;
    idNumber: string;
    dateOfBirth: string;
    schoolId: string;
    parentId: string;
    gradeLevel: string;
    classroomId?: string;
    profileStatus: 'Pending' | 'Complete';
    corporateCreditBalance?: number;
    stars?: Star[];
    emergencyContacts: string;
    healthSummary: string;
    familyInfo: {
        birthplace: string;
        homeAddress: string;
        homePhone: string;
        siblings: string;
        childPosition: string;
        parentsMaritalStatus: 'married' | 'separated' | 'divorced' | 'other';
        livesWith: string;
        timeWithMother: string;
        timeWithFather: string;
    };
    healthHistory: {
        birthConditions: {
            breastfed: boolean;
            pacifier: boolean;
            bedWetting: boolean;
        };
        general: {
            pediatricianName: string;
            emergencyContactName: string;
            allergies: string;
            currentTreatments: string;
        }
    };
    developmentProfile: {
        emotional: { frequentBehavior: string };
        social: { favoriteToys: string };
        motor: { walkedAge: string };
        language: { spokeAge: string };
    };
    authorizedPickups: AuthorizedPickup[];
    pin?: string;
    customFields?: { [key: string]: string };
}

export interface AttendanceRecord {
    id: string;
    studentId: string;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    excused: boolean;
    notes?: string;
}

export interface PickupRecord {
    id: string;
    teacherId: string;
    studentId: string;
    parentName: string;
    pickupTime: string; // ISO date string
    pickupType: PickupType;
    minutesLate: number;
}

export interface Conversation {
    id: string;
    participantIds: string[];
    name: string;
    avatarUrl: string;
    isGroup: boolean;
    lastMessage: {
        text: string;
        timestamp: string;
    };
    unreadCount: number;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    timestamp: string;
    type: 'text' | 'payment_link';
    paymentDetails?: {
        activityName: string;
        amount: number;
        currency: 'DOP' | 'USD';
    };
}

export interface Position {
    id: string;
    name: string;
    permissions: Permission[];
    schoolId: string;
}

export interface ProviderPosition {
    id: string;
    name: string;
    permissions: ProviderPermission[];
    providerId: string;
}

export type ActivityStatus = Status.Pending | Status.Confirmed | Status.Cancelled | Status.Rescheduled;

export interface ActivityAssignment {
    id: string;
    description: string;
    assignedParentId: string;
}

export interface Activity {
    id: string;
    schoolId: string;
    name: string;
    description: string;
    imageUrl: string;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    maxCapacity: number;
    cost: number;
    currency: 'DOP' | 'USD';
    acceptedPaymentMethods: PaymentMethod[];
    responsiblePerson: string;
    participatingLevels: string[];
    status: ActivityStatus;
    visibility: 'Public' | 'Private';
    requiresAssistanceRegistration: boolean;
    enrolledStudentIds: string[];
    publicRegistrationLink?: string;
    assignments?: ActivityAssignment[];
}

export type ActivityCreationData = Omit<Activity, 'id' | 'enrolledStudentIds' | 'publicRegistrationLink'>;

export interface CatalogItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

export interface Catalog {
    id: string;
    schoolId: string;
    name: string;
    description: string;
    items: CatalogItem[];
    activityIds?: string[];
}

export interface ExternalEnrollment {
    id: string;
    activityId: string;
    schoolId: string;
    studentName: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    status: 'Pending' | 'Confirmed' | 'Cancelled';
}

export interface GradeLevel {
    id: string;
    schoolId: string;
    name: string;
    order: number;
}

export interface Classroom {
    id: string;
    schoolId: string;
    name: string;
    schoolYear: string;
    gradeLevelId: string;
    teacherId?: string;
    assistantId?: string;
    studentIds: string[];
}

export interface PaymentTransaction {
    id: string;
    schoolId: string;
    parentId: string;
    studentId: string;
    referenceId: string; // activityId, recurringPaymentId, etc.
    concept: string;
    amount: number;
    currency: 'DOP' | 'USD';
    date: string; // ISO date string
    status: PaymentStatus;
    method: PaymentMethod;
    proofUrl?: string;
}

export interface RecurringPayment {
    id: string;
    schoolId: string;
    name: string;
    amount: number;
    currency: 'DOP' | 'USD';
    frequency: 'Monthly' | 'Annual' | 'OneTime';
}

export interface PaymentGroup {
    id: string;
    schoolId: string;
    name: string; // e.g. "1ro Primaria - Mensualidad"
    recurringPaymentId: string; // links to RecurringPayment config (amount, currency)
    memberParentIds: string[]; // parents in this group
    nextDueDate: string; // ISO Date string, e.g., 2024-03-01
}

export interface ProductCategory {
    id: string;
    providerId: string;
    name: string;
}

export interface Product {
    id: string;
    providerId: string;
    categoryId?: string;
    name: string;
    description: string;
    cost: number;
    price: number;
    stock: number;
    imageUrl: string;
}

export interface ProviderCatalog {
    id: string;
    providerId: string;
    name: string;
    description: string;
    productIds: string[];
    visibilityType: 'Permanent' | 'DateRange' | 'Scheduled';
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    cutoffTime?: string;
    deliveryTime?: string;
    schoolIds?: string[];
    acceptedPaymentMethods?: PaymentMethod[];
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    providerId: string;
    schoolId: string;
    parentId?: string;
    studentId?: string;
    staffId?: string;
    customerName: string; // parent name
    items: OrderItem[];
    subtotal: number;
    taxAmount: number;
    finalAmount: number;
    paymentMethod: PaymentMethod;
    status: 'Pending' | 'Preparing' | 'Ready for Delivery' | 'Delivered' | 'Cancelled';
    orderDate: string; // ISO date string
}

export interface ActivityEnrollment {
  id: string;
  activityId: string;
  studentId: string;
  enrollmentDate: string;
  paymentStatus: PaymentStatus;
}

export interface MediaPost {
    id: string;
    schoolId: string;
    authorId: string;
    imageUrl: string;
    caption: string;
    likes: string[]; // array of userIds
    timestamp: string; // ISO date string
    albumName?: string; // Optional album/folder name
}

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    text: string;
    timestamp: string; // ISO date string
}

export interface Circular {
    id: string;
    schoolId: string;
    title: string;
    content: string;
    targetGroups: string[]; // e.g., ['all', '1ro Primaria', '2do Primaria']
    timestamp: string; // ISO date string
}

export type CircularCreationData = Omit<Circular, 'id' | 'timestamp'>;

export interface LibraryItem {
    id: string;
    schoolId: string;
    title: string;
    description: string;
    fileUrl: string;
    fileType: 'pdf' | 'video' | 'doc' | 'link';
    uploadedBy: string; // userId of admin/teacher
    createdAt: string;
}

// --- LMS TYPES ---

export interface Question {
    id: string;
    text: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'match';
    options?: string[]; // For multiple choice
    correctAnswer: string | string[]; // For auto-grading
    points: number;
}

export interface Exam {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    timeLimitMinutes: number;
    maxAttempts: number;
    minScoreToPass: number; // e.g., 70
    evaluationScope: 'course_general' | 'module_specific';
}

export interface LessonContent {
    id: string;
    type: 'text' | 'video_embed' | 'video_upload' | 'file' | 'link';
    title: string;
    data: string; // Text content, URL, or file URL
    description?: string;
}

export interface CourseModule {
    id: string;
    title: string;
    description: string;
    contents: LessonContent[];
}

export interface Course {
    id: string;
    schoolId: string;
    title: string;
    shortDescription: string;
    longDescription: string;
    category: string;
    level: 'Basic' | 'Intermediate' | 'Advanced';
    imageUrl: string;
    language: string;
    hasCertificate: boolean;
    minScore: number; // 0-100
    allowComments: boolean;
    status: 'Active' | 'Inactive';
    isPaid: boolean;
    price?: number;
    instructorId?: string;
    
    targetGradeLevels: string[]; // Keep for filtering/assignments
    modules: CourseModule[];
    finalExam?: Exam;
    
    // Stats (calculated or mock)
    enrolledCount?: number;
    avgCompletion?: number;
}

// Backward compatibility for existing code using simpler types
export interface Lesson {
    id: string;
    title: string;
    content: string; // Markdown content
    videoUrl?: string;
}

export interface StudentCourseProgress {
    studentId: string;
    courseId: string;
    completedLessonIds: string[];
    completedModuleIds?: string[];
    examGrades?: { examId: string, score: number, date: string }[];
    status?: 'In Progress' | 'Passed' | 'Failed';
}

export interface VirtualTutorConfig {
    schoolId: string;
    isEnabled: boolean;
    welcomeMessage: string;
    tutorUrl: string;
}

export interface LandingPageConfig {
    logoHeaderUrl: string;
    logoHeroUrl: string;
    logoLoginUrl: string;
    heroBannerUrl: string;
    headerButtonText: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    heroCtaText: string;
    
    connectionsTitle: string;
    connectionsSubtitle: string;
    connectionsFeature1: { iconUrl: string; text: string };
    connectionsFeature2: { iconUrl: string; text: string };
    connectionsFeature3: { iconUrl: string; text: string };
    connectionsClosing: string;
    connectionsBenefit: string;

    magicTitle: string;
    magicSubtitle: string;
    magicFeature1: { icon: string; text: string };
    magicFeature2: { icon: string; text: string };
    magicFeature3: { icon: string; text: string };
    magicFeature4: { icon: string; text: string };

    learningTitle: string;
    learningSubtitle: string;
    learningFeature1: { icon: string; text: string };
    learningFeature2: { icon: string; text: string };
    learningFeature3: { icon: string; text: string };
    learningFeature4: { icon: string; text: string };
    
    characterTitle: string;
    characterDescription: string;
    characterQuote: string;
    characterImageUrl: string;

    finalCtaTitle: string;
    finalCtaSubtitle: string;
    finalCtaButton1: string;
    finalCtaButton2: string;
    demoRequestEmail: string;
}
