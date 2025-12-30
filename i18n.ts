
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  es: {
    translation: {
      loading: 'Cargando Mapple School...',
      login: 'Iniciar Sesión',
      welcome: '¡Bienvenido!',
      selectProfile: 'Selecciona tu perfil para iniciar sesión.',
      search: 'Buscar...',
      viewNotifications: 'Ver notificaciones',
      myProfile: 'Mi Perfil',
      logout: 'Cerrar Sesión',
      
      common: {
        actions: 'Acciones',
        edit: 'Editar',
        delete: 'Eliminar',
        create: 'Crear',
        save: 'Guardar',
        cancel: 'Cancelar',
        status: 'Estado',
        viewDetails: 'Ver Detalles',
        impersonate: 'Impersonar',
        suspend: 'Suspender',
        exportCSV: 'Exportar a Excel',
        date: 'Fecha',
        total: 'Total',
        pending: 'Pendiente',
        confirmed: 'Confirmado',
        cancelled: 'Cancelado',
        active: 'Activo',
        suspended: 'Suspendido',
        back: 'Volver',
        loading: 'Cargando...',
        noData: 'No hay datos disponibles',
      },

      auth: {
        title: 'Inicia sesión en tu cuenta',
        subtitle: 'Accede a la plataforma educativa',
        email: 'Correo electrónico',
        password: 'Contraseña',
        forgotPassword: '¿Olvidaste tu contraseña?',
        submit: 'Iniciar sesión',
        validating: 'Validando...',
        errorLogin: 'Correo o contraseña incorrectos. Inténtalo de nuevo.',
        errorGeneric: 'Ocurrió un error al iniciar sesión.',
        testUsers: 'Usuarios de prueba disponibles'
      },

      landing: {
        headerSubtitle: 'Familias, colegios y estudiantes en una sola app.',
        requestDemo: 'Solicitar demo',
        heroTitle: 'Organiza la vida escolar con un toque de magia.',
        heroSubtitle: 'Pagos, actividades, comunicados y bienestar en un mismo lugar, pensado para padres ocupados y colegios que aman la tecnología sencilla.',
        heroDesc: 'Mapple School convierte tu colegio en una experiencia digital amable, colorida y muy fácil de entender, incluso desde el celular.',
        ctaFamily: 'Probar como familia',
        ctaDemo: 'Ver demo guiada',
        mobileReady: 'Listo para móviles y tablets.',
        allInOne: 'Ideal para cobros, actividades y comunicación.',
        cardHeader: 'Panel escolar amigable',
        cardHeaderDesc: 'Ve pagos, circulares y actividades sin complicarte.',
        cardHeaderSub: 'Estilo pastel infantil para que todo se sienta ligero y acogedor.',
        cardAdminTitle: 'Para equipos directivos',
        cardAdminDesc: 'Controla pagos, asistencia y actividades desde una sola pantalla.',
        cardFamilyTitle: 'Para familias',
        cardFamilyDesc: 'Recibe recordatorios claros, paga con un toque y sigue el día a día.',
        cardProviderTitle: 'Para proveedores',
        cardProviderDesc: 'Cafetería, librería y actividades conectadas a la misma plataforma.',
        footerRights: 'Todos los derechos reservados.',
        privacy: 'Política de privacidad',
        terms: 'Términos de uso'
      },

      sidebar: {
        dashboard: 'Dashboard',
        schools: 'Colegios',
        providers: 'Proveedores',
        users: 'Usuarios',
        linkages: 'Vinculaciones',
        subscriptions: 'Suscripciones',
        homePage: 'Página de Inicio',
        settings: 'Configuración',
        activities: 'Actividades',
        gradesAndClasses: 'Grados y Cursos',
        staff: 'Personal',
        parentsAndStudents: 'Padres y Estudiantes',
        library: 'Biblioteca',
        lms: 'LMS',
        virtualTutor: 'Tutor Virtual',
        programs: 'Programas',
        externalEnrollments: 'Inscripciones Externas',
        communication: 'Comunicación',
        payments: 'Pagos',
        myCourses: 'Mis Cursos',
        attendance: 'Asistencia',
        pickup: 'Recogida',
        communications: 'Comunicados',
        myConsumption: 'Mi Consumo',
        home: 'Inicio',
        marketplace: 'Marketplace',
        myOrders: 'Mis Pedidos',
        dependents: 'Dependientes',
        schoolManagement: 'Gestión Escolar',
        messages: 'Mensajes',
        products: 'Productos',
        catalogs: 'Catálogos',
        orders: 'Pedidos',
        pos: 'POS',
        reports: 'Reportes',
        chat: 'Chat',
        productsList: 'Lista de Productos',
        categories: 'Categorías',
        myProfile: 'Mi Perfil'
      },

      globalAdmin: {
        welcomeMessage: '¡Bienvenido, Administrador Global!',
        welcomeSub: 'Utiliza el menú de la izquierda para gestionar colegios, proveedores y configuraciones.',
        metrics: {
          totalSchools: 'Total Colegios',
          activeSchools: 'Colegios Activos',
          pendingSchools: 'Colegios Pendientes',
          totalProviders: 'Total Proveedores'
        },
        schools: {
            title: 'Gestión de Colegios',
            create: 'Crear Colegio',
            searchPlaceholder: 'Buscar por nombre, director, ciudad...',
            table: {
                name: 'Nombre',
                country: 'País',
                city: 'Ciudad',
                director: 'Director',
                status: 'Estado'
            }
        },
        providers: {
            title: 'Gestión de Proveedores',
            create: 'Crear Proveedor',
            searchPlaceholder: 'Buscar por nombre, contacto...',
            table: {
                name: 'Nombre Comercial',
                feeConfig: 'Config. Comisión',
                country: 'País',
                city: 'Ciudad',
                status: 'Estado'
            }
        },
        users: {
            title: 'Gestión Global de Usuarios',
            searchPlaceholder: 'Buscar por nombre o email...',
            allRoles: 'Todos los Roles',
            table: {
                user: 'Usuario',
                role: 'Rol',
                entity: 'Entidad (Colegio/Proveedor)'
            }
        },
        linkages: {
            title: 'Vinculaciones Colegio-Proveedor',
            create: 'Vincular Colegio & Proveedor',
            table: {
                school: 'Colegio',
                provider: 'Proveedor'
            }
        },
        subscriptions: {
            tabs: {
                plans: 'Gestión de Planes',
                assignments: 'Asignación a Colegios'
            },
            plansTitle: 'Planes de Suscripción',
            assignmentsTitle: 'Asignaciones de Suscripción',
            price: 'Precio',
            features: 'Características'
        },
        settings: {
            feeTitle: 'Comisión de Venta por Defecto',
            feeDesc: 'Esta comisión aplica a todos los proveedores a menos que se configure una personalizada.',
            templatesTitle: 'Plantillas de Correo',
            percentage: 'Porcentaje (%)',
            salesType: 'Aplicar a Tipo de Venta',
            paymentMethods: 'Aplicar a Métodos de Pago'
        }
      },
      
      parent: {
        welcome: 'Hola, {{name}}',
        menu: {
            marketplace: 'Marketplace',
            marketplaceDesc: 'Compra uniformes y artículos escolares.',
            activities: 'Actividades',
            activitiesDesc: 'Inscribe y gestiona actividades.',
            dependents: 'Dependientes',
            dependentsDesc: 'Gestiona perfiles de tus hijos.',
            schoolMgmt: 'Gestión Escolar',
            schoolMgmtDesc: 'Pagos, reportes y solicitudes.'
        },
        pickup: {
            title: '¿Listo para recoger a tus hijos?',
            desc: 'Notifica al colegio que vas en camino.',
            button: 'Notificar Recogida'
        },
        schoolManagement: {
            title: 'Gestión Escolar',
            statement: 'Estado de Cuenta y Pagos',
            statementDesc: 'Revisa tus pagos pendientes y el historial.',
            funds: 'Asignar Fondos para Consumo',
            fundsDesc: 'Recarga el balance de tus hijos para la cafetería.',
            reports: 'Reportes de Consumo',
            reportsDesc: 'Revisa el historial de consumo de tus hijos.',
            requests: 'Solicitudes y Permisos',
            requestsDesc: 'Envía solicitudes de permisos y otros documentos.'
        }
      },
      
      teacher: {
          daySummary: 'Resumen del Día',
          studentCount: 'Tienes {{count}} estudiantes en tus cursos.',
          pickup: {
              live: 'Recogida en Vivo',
              scheduled: 'Recogida Programada',
              reports: 'Generar Reporte de Recogidas',
              student: 'Estudiante',
              parent: 'Nombre del Padre/Madre/Autorizado',
              other: 'Especifique el nombre',
              register: 'Registrar Salida',
              notified: 'Entregado'
          },
          attendance: {
              taking: 'Registro de Asistencia',
              reports: 'Generador de Reportes de Asistencia',
              student: 'Estudiante',
              weekPrev: 'Semana Anterior',
              today: 'Hoy',
              weekNext: 'Semana Siguiente'
          },
          communication: {
              search: 'Buscar estudiante...',
              conversationWith: 'Conversación con padre/madre de {{name}}',
              placeholder: 'Escribe un mensaje...',
              quick: {
                  homework: 'Tarea',
                  note: 'Nota',
                  request: 'Solicitud'
              }
          }
      },

      provider: {
          dashboard: 'Dashboard',
          metrics: {
              totalSales: 'Ventas Totales',
              totalOrders: 'Total Pedidos',
              pendingOrders: 'Pedidos Pendientes'
          },
          recentOrders: 'Pedidos Recientes',
          products: {
              title: 'Productos',
              create: 'Nuevo Producto',
              categoriesTitle: 'Categorías',
              createCategory: 'Nueva Categoría',
              search: 'Buscar productos...',
              table: {
                  product: 'Producto',
                  category: 'Categoría',
                  price: 'Precio',
                  stock: 'Stock'
              }
          },
          pos: {
              currentOrder: 'Pedido Actual',
              search: 'Buscar productos...',
              searchStaff: 'Buscar empleado...',
              client: 'Cliente',
              balance: 'Balance Disponible',
              credit: 'Crédito Disponible',
              subtotal: 'Subtotal',
              tax: 'Impuestos',
              total: 'TOTAL A PAGAR',
              checkout: 'Finalizar Venta'
          }
      },

      student: {
          balance: 'Mi Saldo Disponible',
          balanceDesc: 'Para consumo en la cafetería',
          quickAccess: 'Accesos Rápidos',
          quickAccessDesc: 'Utiliza el menú de la izquierda para navegar a la Biblioteca de recursos, ver tus Cursos asignados o contactar a tu Tutor Virtual.',
          library: 'Biblioteca de Recursos',
          courses: 'Mis Cursos',
          tutor: 'Tutor Virtual',
          tutorAccess: 'Acceder al Tutor',
          settings: 'Configuración de la Cuenta',
          changePassword: 'Cambiar Contraseña',
          pin: 'PIN de Compra'
      },

      demoRequest: {
        title: 'Agendar una Demostración',
        cancel: 'Cancelar',
        submit: 'Enviar Solicitud',
        submitting: 'Enviando...',
        description: 'Déjanos tu correo y nos pondremos en contacto.',
        emailLabel: 'Tu Correo Electrónico',
        emailPlaceholder: 'tunombre@ejemplo.com',
        messageLabel: 'Mensaje (Opcional)',
        messagePlaceholder: 'Cuéntanos un poco sobre tu colegio...',
        successTitle: 'Solicitud Enviada',
        successMessage: '¡Gracias por tu interés!',
        successDescription: 'Hemos recibido tu solicitud.',
        close: 'Cerrar',
      }
    }
  },
  en: {
    translation: {
      loading: 'Loading Mapple School...',
      login: 'Log In',
      welcome: 'Welcome!',
      selectProfile: 'Select your profile to log in.',
      search: 'Search...',
      viewNotifications: 'View notifications',
      myProfile: 'My Profile',
      logout: 'Log Out',

      common: {
        actions: 'Actions',
        edit: 'Edit',
        delete: 'Delete',
        create: 'Create',
        save: 'Save',
        cancel: 'Cancel',
        status: 'Status',
        viewDetails: 'View Details',
        impersonate: 'Impersonate',
        suspend: 'Suspend',
        exportCSV: 'Export to Excel',
        date: 'Date',
        total: 'Total',
        pending: 'Pending',
        confirmed: 'Confirmed',
        cancelled: 'Cancelled',
        active: 'Active',
        suspended: 'Suspended',
        back: 'Back',
        loading: 'Loading...',
        noData: 'No data available',
      },

      auth: {
        title: 'Log in to your account',
        subtitle: 'Access the educational platform',
        email: 'Email address',
        password: 'Password',
        forgotPassword: 'Forgot your password?',
        submit: 'Log In',
        validating: 'Validating...',
        errorLogin: 'Incorrect email or password. Please try again.',
        errorGeneric: 'An error occurred while logging in.',
        testUsers: 'Test Users Available'
      },

      landing: {
        headerSubtitle: 'Families, schools, and students in one app.',
        requestDemo: 'Request Demo',
        heroTitle: 'Organize school life with a touch of magic.',
        heroSubtitle: 'Payments, activities, communications, and well-being in one place, designed for busy parents and schools that love simple technology.',
        heroDesc: 'Mapple School turns your school into a friendly, colorful, and easy-to-understand digital experience, even from your phone.',
        ctaFamily: 'Try as Family',
        ctaDemo: 'View Guided Demo',
        mobileReady: 'Mobile and tablet ready.',
        allInOne: 'Ideal for payments, activities, and communication.',
        cardHeader: 'Friendly School Panel',
        cardHeaderDesc: 'View payments, circulars, and activities without complications.',
        cardHeaderSub: 'Pastel child-friendly style to make everything feel light and welcoming.',
        cardAdminTitle: 'For Administration',
        cardAdminDesc: 'Control payments, attendance, and activities from a single screen.',
        cardFamilyTitle: 'For Families',
        cardFamilyDesc: 'Receive clear reminders, pay with a tap, and follow the day-to-day.',
        cardProviderTitle: 'For Providers',
        cardProviderDesc: 'Cafeteria, bookstore, and activities connected to the same platform.',
        footerRights: 'All rights reserved.',
        privacy: 'Privacy Policy',
        terms: 'Terms of Use'
      },

      sidebar: {
        dashboard: 'Dashboard',
        schools: 'Schools',
        providers: 'Providers',
        users: 'Users',
        linkages: 'Linkages',
        subscriptions: 'Subscriptions',
        homePage: 'Home Page',
        settings: 'Settings',
        activities: 'Activities',
        gradesAndClasses: 'Grades & Classes',
        staff: 'Staff',
        parentsAndStudents: 'Parents & Students',
        library: 'Library',
        lms: 'LMS',
        virtualTutor: 'Virtual Tutor',
        programs: 'Programs',
        externalEnrollments: 'External Enrollments',
        communication: 'Communication',
        payments: 'Payments',
        myCourses: 'My Courses',
        attendance: 'Attendance',
        pickup: 'Pickup',
        communications: 'Communications',
        myConsumption: 'My Consumption',
        home: 'Home',
        marketplace: 'Marketplace',
        myOrders: 'My Orders',
        dependents: 'Dependents',
        schoolManagement: 'School Management',
        messages: 'Messages',
        products: 'Products',
        catalogs: 'Catalogs',
        orders: 'Orders',
        pos: 'POS',
        reports: 'Reports',
        chat: 'Chat',
        productsList: 'Product List',
        categories: 'Categories',
        myProfile: 'My Profile'
      },

      globalAdmin: {
        welcomeMessage: 'Welcome, Global Admin!',
        welcomeSub: 'Use the navigation on the left to manage schools, providers, and settings.',
        metrics: {
          totalSchools: 'Total Schools',
          activeSchools: 'Active Schools',
          pendingSchools: 'Pending Schools',
          totalProviders: 'Total Providers'
        },
        schools: {
            title: 'School Management',
            create: 'Create School',
            searchPlaceholder: 'Search by name, director, city...',
            table: {
                name: 'School Name',
                country: 'Country',
                city: 'City',
                director: 'Director',
                status: 'Status'
            }
        },
         providers: {
            title: 'Provider Management',
            create: 'Create Provider',
            searchPlaceholder: 'Search by name, contact...',
            table: {
                name: 'Business Name',
                feeConfig: 'Fee Config',
                country: 'Country',
                city: 'City',
                status: 'Status'
            }
        },
        users: {
            title: 'Global User Management',
            searchPlaceholder: 'Search by name or email...',
            allRoles: 'All Roles',
            table: {
                user: 'User',
                role: 'Role',
                entity: 'Entity (School/Provider)'
            }
        },
        linkages: {
            title: 'School-Provider Links',
            create: 'Link School & Provider',
            table: {
                school: 'School',
                provider: 'Provider'
            }
        },
        subscriptions: {
            tabs: {
                plans: 'Plan Management',
                assignments: 'School Assignments'
            },
            plansTitle: 'Subscription Plans',
            assignmentsTitle: 'School Subscription Assignments',
            price: 'Price',
            features: 'Features'
        },
        settings: {
            feeTitle: 'Default Platform Sales Fee',
            feeDesc: 'This fee applies to all providers unless a custom fee is set for them individually.',
            templatesTitle: 'Email Templates',
            percentage: 'Fee Percentage (%)',
            salesType: 'Apply to Sales Type',
            paymentMethods: 'Apply to Payment Methods'
        }
      },
      
      parent: {
        welcome: 'Hello, {{name}}',
        menu: {
            marketplace: 'Marketplace',
            marketplaceDesc: 'Buy uniforms and school supplies.',
            activities: 'Activities',
            activitiesDesc: 'Enroll and manage activities.',
            dependents: 'Dependents',
            dependentsDesc: 'Manage your children\'s profiles.',
            schoolMgmt: 'School Management',
            schoolMgmtDesc: 'Payments, reports, and requests.'
        },
        pickup: {
            title: 'Ready to pickup your kids?',
            desc: 'Notify the school you are on your way.',
            button: 'Notify Pickup'
        },
        schoolManagement: {
            title: 'School Management',
            statement: 'Account Statement & Payments',
            statementDesc: 'Check pending payments and transaction history.',
            funds: 'Assign Funds for Consumption',
            fundsDesc: 'Top up your children\'s balance for the cafeteria.',
            reports: 'Consumption Reports',
            reportsDesc: 'Review your children\'s consumption history.',
            requests: 'Requests & Permissions',
            requestsDesc: 'Send permission requests and other documents.'
        }
      },
      
      teacher: {
          daySummary: 'Day Summary',
          studentCount: 'You have {{count}} students in your courses.',
           pickup: {
              live: 'Live Pickup',
              scheduled: 'Scheduled Pickup',
              reports: 'Generate Pickup Report',
              student: 'Student',
              parent: 'Parent/Guardian/Authorized Name',
              other: 'Specify name',
              register: 'Register Departure',
              notified: 'Delivered'
          },
           attendance: {
              taking: 'Take Attendance',
              reports: 'Attendance Report Generator',
              student: 'Student',
              weekPrev: 'Previous Week',
              today: 'Today',
              weekNext: 'Next Week'
          },
          communication: {
              search: 'Search student...',
              conversationWith: 'Conversation with parent of {{name}}',
              placeholder: 'Type a message...',
              quick: {
                  homework: 'Homework',
                  note: 'Note',
                  request: 'Request'
              }
          }
      },

      provider: {
          dashboard: 'Dashboard',
          metrics: {
              totalSales: 'Total Sales',
              totalOrders: 'Total Orders',
              pendingOrders: 'Pending Orders'
          },
          recentOrders: 'Recent Orders',
          products: {
              title: 'Products',
              create: 'New Product',
              categoriesTitle: 'Categories',
              createCategory: 'New Category',
              search: 'Search products...',
              table: {
                  product: 'Product',
                  category: 'Category',
                  price: 'Price',
                  stock: 'Stock'
              }
          },
          pos: {
              currentOrder: 'Current Order',
              search: 'Search products...',
              searchStaff: 'Search staff...',
              client: 'Customer',
              balance: 'Available Balance',
              credit: 'Available Credit',
              subtotal: 'Subtotal',
              tax: 'Tax',
              total: 'TOTAL TO PAY',
              checkout: 'Complete Sale'
          }
      },

      student: {
          balance: 'My Available Balance',
          balanceDesc: 'For cafeteria consumption',
          quickAccess: 'Quick Access',
          quickAccessDesc: 'Use the menu on the left to browse the Library, view your assigned Courses, or contact your Virtual Tutor.',
          library: 'Resource Library',
          courses: 'My Courses',
          tutor: 'Virtual Tutor',
          tutorAccess: 'Access Tutor',
          settings: 'Account Settings',
          changePassword: 'Change Password',
          pin: 'Purchase PIN'
      },

      demoRequest: {
        title: 'Schedule a Demo',
        cancel: 'Cancel',
        submit: 'Send Request',
        submitting: 'Sending...',
        description: 'Leave us your email and we will contact you.',
        emailLabel: 'Your Email Address',
        emailPlaceholder: 'yourname@example.com',
        messageLabel: 'Message (Optional)',
        messagePlaceholder: 'Tell us a little about your school...',
        successTitle: 'Request Sent',
        successMessage: 'Thank you for your interest!',
        successDescription: 'We have received your request.',
        close: 'Close',
      }
    }
  }
};

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18next;
