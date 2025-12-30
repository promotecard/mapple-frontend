
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';
import type { Student } from '../../types';
import { StudentDashboardHome } from './student/StudentDashboardHome';
import { LibraryView } from './student/LibraryView';
import { LMSView } from './student/LMSView';
import { VirtualTutorView } from './student/VirtualTutorView';
import { StudentSettingsView } from './student/StudentSettingsView';

export const StudentDashboard: React.FC<{ activeView?: string }> = ({ activeView = 'home' }) => {
  const { t } = useTranslation();
  const { currentUser } = useAppContext();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (currentUser?.studentId) {
        setIsLoading(true);
        const data = await api.getStudentById(currentUser.studentId);
        setStudentData(data);
        setIsLoading(false);
      }
    };
    fetchStudentData();
  }, [currentUser]);

  const renderContent = () => {
    if (isLoading || !studentData) {
      return <div>{t('common.loading')}</div>;
    }

    switch (activeView) {
      case 'library':
        return <LibraryView student={studentData} />;
      case 'myCourses':
        return <LMSView student={studentData} />;
      case 'virtualTutor':
        return <VirtualTutorView student={studentData} />;
      case 'settings':
        return <StudentSettingsView student={studentData} />;
      case 'home':
      default:
        return <StudentDashboardHome student={studentData} />;
    }
  };

  const getTitleForView = (view: string, student: Student | null) => {
    if (view === 'home') {
      return t('parent.welcome', { name: student?.name.split(' ')[0] });
    }
    return t(`sidebar.${view}`);
  }

  return (
    <div className="space-y-8">
       <h1 className="text-4xl font-display font-bold text-text-primary">
          {getTitleForView(activeView, studentData)}
       </h1>
      {renderContent()}
    </div>
  );
};
